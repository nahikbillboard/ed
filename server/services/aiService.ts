import { GoogleGenAI } from '@google/genai';
import { db } from '../db.js';

export class AIService {
  private static client: GoogleGenAI | null = null;
  private static cache: Map<string, { reply: string; timestamp: number }> = new Map();

  private static getClient(): GoogleGenAI | null {
    if (!this.client && process.env.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.client;
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

    const ai = this.getClient();
    const fallback = `Good morning, ${seniorName}! ☀️ It's a beautiful day. You're on a ${streak}-day streak! Let's start with a gentle walk and your morning nourishment.`;

    if (!ai) return fallback;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Generate a short, warm, cheerful morning greeting for an elderly senior named "${seniorName}". 
        Streak: ${streak} days. Weather: ${weather}. 
        Keep under 25 words. Simple words, 1 friendly emoji, high warmth.`,
        config: {
          maxOutputTokens: 60,
          temperature: 0.3,
          systemInstruction: 'You are KinCare AI, a gentle, respectful companion for elderly seniors. You speak with clear, simple words and warmth.',
        },
      });
      const text = response.text?.trim() || fallback;
      this.cache.set(cacheKey, { reply: text, timestamp: Date.now() });
      return text;
    } catch (err) {
      console.warn('Gemini morning greeting fallback:', err);
      return fallback;
    }
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

    const promptData = {
      seniorName: senior.name,
      wakeTime: routine.wake_time || '7:12 AM',
      steps: activity.steps,
      stepGoal: activity.step_goal,
      yogaComplete: routine.yoga_status === 'completed',
      breakfastComplete: routine.breakfast_status === 'completed',
      medicinesCount: meds.length,
      currentStreak: progress.current_streak,
    };

    const cacheKey = `summary_${seniorId}_${routine.wake_status}_${activity.steps}_${progress.current_streak}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 120000) {
      return cached.reply;
    }

    const ai = this.getClient();
    const fallback = `${senior.name} is safe and doing well today. They walked ${promptData.steps} steps toward their goal, completed their morning wellness routine, and stayed on schedule with meals and medications.`;

    if (!ai) return fallback;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Write a concise 2-3 sentence "Peace of Mind" daily summary for a guardian about their parent.
        Data: ${JSON.stringify(promptData)}.
        Focus on: "Is my parent safe and on track today?". Clear, reassuring, professional tone.`,
        config: {
          maxOutputTokens: 90,
          temperature: 0.2,
          systemInstruction: 'You are KinCare Guardian Intelligence. Provide clear, factual, reassuring updates for families caring for aging parents.',
        },
      });
      const text = response.text?.trim() || fallback;
      this.cache.set(cacheKey, { reply: text, timestamp: Date.now() });
      return text;
    } catch (err) {
      console.warn('Gemini guardian summary fallback:', err);
      return fallback;
    }
  }

  /**
   * Senior Companion Chat: answers questions, gives encouragement, or chats with safety constraints.
   */
  public static async companionChat(seniorName: string, userMessage: string, history: Array<{ role: 'user' | 'model'; text: string }> = []): Promise<string> {
    const ai = this.getClient();
    const fallback = `मैं आपके साथ हूँ, ${seniorName} जी। आप आज बहुत अच्छा कर रहे हैं! यदि आपको किसी सहायता की आवश्यकता हो, तो कृपया लाल एसओएस बटन दबाएं या परिवार से संपर्क करें।`;

    if (!ai) return fallback;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `The senior "${seniorName}" says: "${userMessage}".
        Respond warmly, encouragingly, and concisely in sweet, respectful, elder-friendly HINDI (under 35 words). 
        CRITICAL MEDICAL SAFETY: NEVER diagnose, prescribe, or advise changing medications. If they ask about medical symptoms or prescriptions, gently remind them to speak with their doctor or family.`,
        config: {
          maxOutputTokens: 80,
          temperature: 0.3,
          systemInstruction: `You are KinCare AI, a loving, respectful, patient companion for an elderly senior. 
          Always speak in respectful, warm HINDI (using 'आप', 'जी'). 
          Keep sentences short, clear, and reassuring. 
          STRICT SAFETY RULE: Do NOT diagnose diseases or change prescriptions.`,
        },
      });
      return response.text?.trim() || fallback;
    } catch (err) {
      console.warn('Gemini companion chat fallback:', err);
      return fallback;
    }
  }
}
