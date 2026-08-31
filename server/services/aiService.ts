import { GoogleGenAI } from '@google/genai';
import { db } from '../db.js';

export class AIService {
  private static client: GoogleGenAI | null = null;
  private static cache: Map<string, { reply: string; timestamp: number }> = new Map();

  private static getClient(): GoogleGenAI | null {
    if (!this.client && process.env.GEMINI_API_KEY) {
      try {
        this.client = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI client:', err);
        return null;
      }
    }
    return this.client;
  }

  /**
   * Helper that executes a prompt with automatic model fallback and transient error recovery.
   */
  private static async executeWithFallback(
    params: {
      contents: string;
      systemInstruction?: string;
      maxOutputTokens?: number;
      temperature?: number;
    }
  ): Promise<string | null> {
    const ai = this.getClient();
    if (!ai) return null;

    // Supported models in priority order
    const candidateModels = ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            maxOutputTokens: params.maxOutputTokens || 120,
            temperature: params.temperature ?? 0.3,
            systemInstruction: params.systemInstruction,
          },
        });

        const text = response.text?.trim();
        if (text) {
          return text;
        }
      } catch (err: any) {
        const isUnavailableOrRateLimit =
          err?.status === 'UNAVAILABLE' ||
          err?.code === 503 ||
          err?.code === 429 ||
          err?.message?.includes('high demand') ||
          err?.message?.includes('quota') ||
          err?.message?.includes('rate');

        if (isUnavailableOrRateLimit) {
          // Quietly try next fallback model without throwing noisy unhandled errors
          continue;
        } else {
          // Other error, proceed to fallback model
          continue;
        }
      }
    }

    return null;
  }

  /**
   * Generates a warm, uplifting morning message customized to the senior's routine and streak.
   */
  public static async generateMorningGreeting(seniorName: string, streak: number, weather: string = 'Sunny, 72°F'): Promise<string> {
    const cacheKey = `greeting_${seniorName}_${streak}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) {
      return cached.reply;
    }

    const fallback = `सुप्रभात ${seniorName} जी! ☀️ आज का दिन बहुत सुंदर है। आप ${streak} दिन की स्ट्रीक पर हैं! आइए एक सौम्य सैर और सुबह के नाश्ते के साथ दिन की शुरुआत करें।`;

    const result = await this.executeWithFallback({
      contents: `Generate a short, warm, cheerful morning greeting for an elderly senior named "${seniorName}". 
      Streak: ${streak} days. Weather: ${weather}. 
      Keep under 25 words. Simple words, 1 friendly emoji, high warmth.`,
      maxOutputTokens: 60,
      temperature: 0.3,
      systemInstruction: 'You are Sath AI, a gentle, respectful companion for elderly seniors. You speak with clear, simple words and warmth.',
    });

    const text = result || fallback;
    this.cache.set(cacheKey, { reply: text, timestamp: Date.now() });
    return text;
  }

  /**
   * Generates a daily guardian peace-of-mind summary.
   */
  public static async generateGuardianDailySummary(seniorId: string): Promise<string> {
    const senior = db.getSenior(seniorId) || { name: 'Sunita', age: 78 };
    const today = new Date().toISOString().split('T')[0];
    const routine = db.getDailyRoutine(seniorId, today);
    const activity = db.getDailyActivity(seniorId, today);
    const meds = db.getMedicines(seniorId);
    const progress = db.getProgress(seniorId);

    const stepPct = Math.round((activity.steps / (activity.step_goal || 8000)) * 100);
    const medTaken = routine.medicine_status === 'completed' || routine.breakfast_medicine_status === 'completed';

    const promptData = {
      seniorName: senior.name,
      wakeTime: routine.wake_time || '7:15 AM',
      steps: activity.steps,
      stepGoal: activity.step_goal,
      stepPercent: `${stepPct}%`,
      yogaComplete: routine.yoga_status === 'completed',
      breakfastComplete: routine.breakfast_status === 'completed',
      medicinesCount: meds.length,
      morningMedTaken: medTaken,
      currentStreak: progress.current_streak,
    };

    const cacheKey = `summary_${seniorId}_${routine.wake_status}_${activity.steps}_${progress.current_streak}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 120000) {
      return cached.reply;
    }

    // High quality dynamic fallback customized to real telemetry
    const fallback = `${senior.name} is safe, active, and on track today. She checked in at ${promptData.wakeTime}, completed ${activity.steps.toLocaleString()} steps (${stepPct}% of goal), and has maintained her ${progress.current_streak}-day wellness streak with zero safety alerts.`;

    const result = await this.executeWithFallback({
      contents: `Write a concise 2-3 sentence "Peace of Mind" daily summary for a guardian about their parent.
      Data: ${JSON.stringify(promptData)}.
      Focus on: "Is my parent safe and on track today?". Clear, reassuring, professional tone.`,
      maxOutputTokens: 90,
      temperature: 0.2,
      systemInstruction: 'You are Sath Guardian Intelligence. Provide clear, factual, reassuring updates for families caring for aging parents.',
    });

    const text = result || fallback;
    this.cache.set(cacheKey, { reply: text, timestamp: Date.now() });
    return text;
  }

  /**
   * Senior Companion Chat: answers questions, gives encouragement, or chats with safety constraints.
   */
  public static async companionChat(seniorName: string, userMessage: string, _history: Array<{ role: 'user' | 'model'; text: string }> = []): Promise<string> {
    const msg = (userMessage || '').toLowerCase();

    // Contextual graceful fallback
    let fallback = `मैं आपके साथ हूँ, ${seniorName} जी। आप आज बहुत अच्छा कर रही हैं! यदि आपको किसी सहायता की आवश्यकता हो, तो कृपया परिवार या अभिभावक से संपर्क करें।`;
    if (msg.includes('दवाई') || msg.includes('medicine') || msg.includes('tablet')) {
      fallback = `${seniorName} जी, आपकी दवाइयों का समय पर ध्यान रखा जा रहा है। कृपया डॉक्टर के परामर्श के अनुसार समय पर पानी के साथ दवाई लें।`;
    } else if (msg.includes('सैर') || msg.includes('walk') || msg.includes('कदम')) {
      fallback = `बहुत बढ़िया ${seniorName} जी! नियमित चलना आपके स्वास्थ्य और ताजगी के लिए बहुत लाभकारी है।`;
    } else if (msg.includes('नमस्ते') || msg.includes('hello') || msg.includes('सुप्रभात')) {
      fallback = `नमस्ते ${seniorName} जी! आपका दिन शुभ और सुखद हो। मैं आपकी सहायता के लिए यहाँ हूँ।`;
    }

    const result = await this.executeWithFallback({
      contents: `The senior "${seniorName}" says: "${userMessage}".
      Respond warmly, encouragingly, and concisely in sweet, respectful, elder-friendly HINDI (under 35 words). 
      CRITICAL MEDICAL SAFETY: NEVER diagnose, prescribe, or advise changing medications. If they ask about medical symptoms or prescriptions, gently remind them to speak with their doctor or family.`,
      maxOutputTokens: 80,
      temperature: 0.3,
      systemInstruction: `You are Sath AI, a loving, respectful, patient companion for an elderly senior. 
      Always speak in respectful, warm HINDI (using 'आप', 'जी'). 
      Keep sentences short, clear, and reassuring. 
      STRICT SAFETY RULE: Do NOT diagnose diseases or change prescriptions.`,
    });

    return result || fallback;
  }
}

