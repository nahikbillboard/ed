import { Router } from 'express';
import { db } from '../db.js';
import { NotificationService } from '../services/notificationService.js';
import { VoiceService } from '../services/voiceService.js';
import { WhatsAppService } from '../services/whatsappService.js';
import { AIService } from '../services/aiService.js';
import { SchedulerService } from '../services/schedulerService.js';
import { Senior, Medicine, EmergencyContact, Reward, XpTransaction } from '../types.js';

export const apiRouter = Router();

const getTodayStr = () => new Date().toISOString().split('T')[0];

// ----------------------------------------------------
// AUTH & CURRENT SESSION
// ----------------------------------------------------
apiRouter.post('/auth/login', (req, res) => {
  const { role = 'senior', seniorId = 'senior_eleanor_01' } = req.body;
  const user = db.getRaw().users.find(u => u.role === role) || db.getRaw().users[0];
  return res.json({
    success: true,
    data: {
      user,
      token: 'demo-session-jwt-token-active',
      seniorId,
    },
    message: `Logged in successfully as ${user.name} (${user.role})`
  });
});

apiRouter.get('/auth/me', (req, res) => {
  const senior = db.getAllSeniors()[0];
  const user = db.getRaw().users[0];
  return res.json({
    success: true,
    data: { user, seniorId: senior?.id || 'senior_eleanor_01' }
  });
});

// ----------------------------------------------------
// SENIORS & ONBOARDING
// ----------------------------------------------------
apiRouter.get('/seniors', (req, res) => {
  res.json({ success: true, data: db.getAllSeniors() });
});

apiRouter.get('/seniors/:id', (req, res) => {
  const senior = db.getSenior(req.params.id);
  if (!senior) return res.status(404).json({ success: false, message: 'Senior not found' });
  
  const preferences = db.getRaw().senior_preferences.find(p => p.senior_id === senior.id);
  const emergencyContacts = db.getEmergencyContacts(senior.id);
  const guardians = db.getRaw().guardians;
  
  res.json({
    success: true,
    data: {
      ...senior,
      preferences,
      emergencyContacts,
      guardians,
    }
  });
});

apiRouter.post('/seniors', (req, res) => {
  const {
    name, age, guardian_name, guardian_phone, preferred_language = 'English',
    wake_time = '07:30', breakfast_time = '08:30', lunch_time = '13:00',
    dinner_time = '19:30', night_medicine_time = '21:00', step_goal = 8000,
    emergency_contact_name, emergency_contact_phone, medicines = []
  } = req.body;

  const seniorId = `senior_${Date.now()}`;
  const userId = `user_${seniorId}`;
  const guardianId = `guardian_${Date.now()}`;

  const newSenior: Senior = {
    id: seniorId,
    user_id: userId,
    name: name || 'Beloved Senior',
    age: Number(age) || 75,
    guardian_name: guardian_name || 'Guardian',
    guardian_phone: guardian_phone || '+15558765432',
    preferred_language,
    wake_time,
    breakfast_time,
    lunch_time,
    dinner_time,
    night_medicine_time,
    step_goal: Number(step_goal) || 8000,
    emergency_contact_name: emergency_contact_name || guardian_name || 'Emergency Contact',
    emergency_contact_phone: emergency_contact_phone || guardian_phone || '+15558765432',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.createSenior(newSenior);

  // Create Preferences
  db.getRaw().senior_preferences.push({
    id: `pref_${seniorId}`,
    senior_id: seniorId,
    voice_gender: 'female',
    voice_speed: 'normal',
    large_text_mode: true,
    high_contrast: false,
    auto_speak_prompts: true,
    sound_alerts: true,
  });

  // Create Guardian
  db.getRaw().guardians.push({
    id: guardianId,
    user_id: `user_${guardianId}`,
    name: guardian_name || 'Guardian',
    phone: guardian_phone || '+15558765432',
    email: 'guardian@family.care',
    relationship: 'Child',
    is_primary: true,
    notify_sms: true,
    notify_whatsapp: true,
    notify_push: true,
    created_at: new Date().toISOString(),
  });

  db.getRaw().senior_guardians.push({
    id: `sg_${seniorId}_${guardianId}`,
    senior_id: seniorId,
    guardian_id: guardianId,
    permissions: ['read', 'write', 'emergency_manage'],
    created_at: new Date().toISOString(),
  });

  // Create Emergency Contact
  db.getRaw().emergency_contacts.push({
    id: `emg_${seniorId}_1`,
    senior_id: seniorId,
    name: emergency_contact_name || guardian_name,
    relationship: 'Family Guardian',
    phone: emergency_contact_phone || guardian_phone,
    is_primary: true,
    priority_order: 1,
    created_at: new Date().toISOString(),
  });

  // Create default meal schedules
  db.getRaw().meal_schedules.push(
    { id: `meal_${seniorId}_1`, senior_id: seniorId, meal_type: 'breakfast', scheduled_time: breakfast_time, description: 'Nutritious breakfast', enabled: true },
    { id: `meal_${seniorId}_2`, senior_id: seniorId, meal_type: 'lunch', scheduled_time: lunch_time, description: 'Hearty lunch', enabled: true },
    { id: `meal_${seniorId}_3`, senior_id: seniorId, meal_type: 'dinner', scheduled_time: dinner_time, description: 'Light dinner', enabled: true },
  );

  // Add initial medicines if provided
  if (Array.isArray(medicines) && medicines.length > 0) {
    medicines.forEach((m: any, idx: number) => {
      db.getRaw().medicines.push({
        id: `med_${seniorId}_${idx + 1}`,
        senior_id: seniorId,
        medicine_number: idx + 1,
        name: m.name || `Medicine #${idx + 1}`,
        dosage_information: m.dosage || '1 Tablet',
        instructions: m.instructions || 'Take with water after meal',
        quantity_remaining: Number(m.quantity) || 30,
        low_stock_threshold: Number(m.threshold) || 6,
        refill_unit: 'tablets',
        schedule_time: m.time || breakfast_time,
        enabled: true,
        created_at: new Date().toISOString(),
      });
    });
  } else {
    // Seed default medicine
    db.getRaw().medicines.push({
      id: `med_${seniorId}_1`,
      senior_id: seniorId,
      medicine_number: 1,
      name: 'Daily Multivitamin & Care Pill',
      dosage_information: '1 Tablet',
      instructions: 'Take 1 tablet with warm water after breakfast',
      quantity_remaining: 28,
      low_stock_threshold: 5,
      refill_unit: 'tablets',
      schedule_time: breakfast_time,
      enabled: true,
      created_at: new Date().toISOString(),
    });
  }

  // Create initial progress
  db.getProgress(seniorId);
  db.getDailyRoutine(seniorId, getTodayStr());
  db.getDailyActivity(seniorId, getTodayStr());

  db.addAuditLog(userId, 'senior', 'SENIOR_PROFILE_CREATED', 'senior', seniorId, { name: newSenior.name });

  res.status(201).json({
    success: true,
    data: newSenior,
    message: 'Senior profile onboarded successfully!'
  });
});

apiRouter.patch('/seniors/:id', (req, res) => {
  const updated = db.updateSenior(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Senior not found' });
  db.addAuditLog('system', 'guardian', 'SENIOR_PROFILE_UPDATED', 'senior', updated.id, req.body);
  res.json({ success: true, data: updated, message: 'Profile updated' });
});

apiRouter.patch('/seniors/:id/preferences', (req, res) => {
  const pref = db.getRaw().senior_preferences.find(p => p.senior_id === req.params.id);
  if (!pref) return res.status(404).json({ success: false, message: 'Preferences not found' });
  Object.assign(pref, req.body);
  db.scheduleSave();
  res.json({ success: true, data: pref, message: 'Preferences updated' });
});

// ----------------------------------------------------
// SENIOR HOME SCREEN & TODAY'S BUNDLE
// ----------------------------------------------------
apiRouter.get('/seniors/:id/today', async (req, res) => {
  const seniorId = req.params.id;
  const senior = db.getSenior(seniorId);
  if (!senior) return res.status(404).json({ success: false, message: 'Senior not found' });

  const today = getTodayStr();
  const routine = db.getDailyRoutine(seniorId, today);
  const activity = db.getDailyActivity(seniorId, today);
  const progress = db.getProgress(seniorId);
  const medicines = db.getMedicines(seniorId);
  const exercises = db.getRaw().exercise_library.filter(e => e.enabled);
  const rewards = db.getRaw().rewards.filter(r => r.enabled);
  const emergencyContacts = db.getEmergencyContacts(seniorId);
  const preferences = db.getRaw().senior_preferences.find(p => p.senior_id === seniorId);
  const recentNotifications = db.getRaw().notifications.filter(n => n.senior_id === seniorId).slice(0, 5);

  res.json({
    success: true,
    data: {
      senior,
      routine,
      activity,
      progress,
      medicines,
      exercises,
      rewards,
      emergencyContacts,
      preferences,
      recentNotifications,
    }
  });
});

apiRouter.get('/seniors/:id/routine', (req, res) => {
  const today = getTodayStr();
  const routine = db.getDailyRoutine(req.params.id, today);
  res.json({ success: true, data: routine });
});

apiRouter.patch('/routine/:id', (req, res) => {
  const updated = db.updateDailyRoutine(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Routine not found' });
  res.json({ success: true, data: updated });
});

// ----------------------------------------------------
// 3. WAKE-UP CHECK-IN
// ----------------------------------------------------
apiRouter.post('/checkin/wakeup', async (req, res) => {
  const { seniorId } = req.body;
  const senior = db.getSenior(seniorId);
  if (!senior) return res.status(404).json({ success: false, message: 'Senior not found' });

  const today = getTodayStr();
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const routine = db.getDailyRoutine(seniorId, today);
  routine.wake_status = 'completed';
  routine.wake_time = timeFormatted;
  routine.updated_at = now.toISOString();

  // Award XP (+50 XP)
  const xpAmount = 50;
  routine.xp_earned += xpAmount;
  const progress = db.addXp(seniorId, 'wakeup', xpAmount, `Checked in awake at ${timeFormatted}`);

  // Auto-dispatch WhatsApp & Push to Guardian
  await WhatsAppService.sendTemplateMessage({
    seniorId,
    recipientPhone: senior.guardian_phone,
    templateType: 'wakeup',
    parameters: {
      seniorName: senior.name,
      time: timeFormatted,
      streak: progress.current_streak,
      xp: xpAmount,
    }
  });

  await NotificationService.broadcastToGuardians(
    seniorId,
    `${senior.name} is awake ☀️`,
    `${senior.name} checked in at ${timeFormatted}. Morning routine is on track! (+${xpAmount} XP earned)`
  );

  db.addAuditLog(senior.user_id, 'senior', 'WAKEUP_CHECKIN', 'daily_routines', routine.id, {
    wakeTime: timeFormatted,
    xpAwarded: xpAmount,
  });

  res.json({
    success: true,
    data: {
      routine,
      progress,
      wakeTime: timeFormatted,
      xpAwarded: xpAmount,
    },
    message: `Good morning ${senior.name}! Awakening registered successfully.`
  });
});

apiRouter.get('/checkin/wakeup/:seniorId', (req, res) => {
  const today = getTodayStr();
  const routine = db.getDailyRoutine(req.params.seniorId, today);
  res.json({
    success: true,
    data: {
      wake_status: routine.wake_status,
      wake_time: routine.wake_time,
      date: routine.date,
    }
  });
});

// ----------------------------------------------------
// 4. UNIFIED DAILY ROUTINE TASK COMPLETION
// ----------------------------------------------------
apiRouter.post('/routine/task-complete', async (req, res) => {
  const { seniorId, taskType, taskTitle, extraDetails, dishName } = req.body;
  const senior = db.getSenior(seniorId) || { name: 'Eleanor', guardian_phone: '9561442888' };
  const today = getTodayStr();
  const routine = db.getDailyRoutine(seniorId, today);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let xpAmount = 40;
  let activityType: XpTransaction['activity_type'] = 'yoga';
  let defaultTitle = 'Daily Routine Task';

  switch (taskType) {
    case 'walk':
      routine.walking_status = 'completed';
      xpAmount = 50;
      activityType = 'walking';
      defaultTitle = 'Daily Walk';
      break;
    case 'yoga':
      routine.yoga_status = 'completed';
      xpAmount = 70;
      activityType = 'yoga';
      defaultTitle = 'Morning Yoga';
      break;
    case 'breakfast':
      routine.breakfast_status = 'completed';
      xpAmount = 40;
      activityType = 'meal';
      defaultTitle = 'Breakfast';
      break;
    case 'breakfast_medicine':
      routine.breakfast_medicine_status = 'completed';
      routine.medicine_status = 'completed';
      xpAmount = 40;
      activityType = 'medicine';
      defaultTitle = 'After-Breakfast Medicine';
      break;
    case 'lunch':
      routine.lunch_status = 'completed';
      xpAmount = 40;
      activityType = 'meal';
      defaultTitle = 'Lunch';
      break;
    case 'lunch_medicine':
      routine.lunch_medicine_status = 'completed';
      xpAmount = 40;
      activityType = 'medicine';
      defaultTitle = 'After-Lunch Medicine';
      break;
    case 'nap':
      routine.nap_status = 'completed';
      xpAmount = 40;
      activityType = 'nap';
      defaultTitle = 'Sleep Nap';
      break;
    case 'dinner':
      routine.dinner_status = 'completed';
      xpAmount = 40;
      activityType = 'meal';
      defaultTitle = 'Dinner';
      break;
    case 'dinner_medicine':
      routine.dinner_medicine_status = 'completed';
      routine.night_medicine_status = 'completed';
      xpAmount = 40;
      activityType = 'medicine';
      defaultTitle = 'After-Dinner Medicine';
      break;
    case 'wakeup':
      routine.wake_status = 'completed';
      routine.wake_time = timeStr;
      xpAmount = 50;
      activityType = 'wakeup';
      defaultTitle = 'Morning Wake-Up Check-in';
      break;
  }

  routine.xp_earned += xpAmount;
  const resolvedTitle = taskTitle || defaultTitle;
  const progress = db.addXp(seniorId, activityType, xpAmount, `Completed ${resolvedTitle}`);

  // Dispatch WhatsApp to 9561442888
  const whatsappRes = await WhatsAppService.sendTemplateMessage({
    seniorId,
    recipientPhone: senior.guardian_phone || '9561442888',
    templateType: (taskType as any) || 'task_completed',
    parameters: {
      seniorName: senior.name,
      taskTitle: resolvedTitle,
      time: timeStr,
      xp: xpAmount,
      streak: progress.current_streak,
      dishName: dishName || extraDetails || '',
    }
  });

  db.scheduleSave();

  res.json({
    success: true,
    data: {
      routine,
      progress,
      xpAwarded: xpAmount,
      taskTitle: resolvedTitle,
      whatsapp: whatsappRes,
    },
    message: `Great job! "${resolvedTitle}" is marked as done and WhatsApp notification sent to 9561442888.`
  });
});

// ----------------------------------------------------
// 5. WALKING & STEP TRACKING
// ----------------------------------------------------
apiRouter.get('/activity/today/:seniorId', (req, res) => {
  const today = getTodayStr();
  const activity = db.getDailyActivity(req.params.seniorId, today);
  res.json({ success: true, data: activity });
});

apiRouter.post('/activity/steps', async (req, res) => {
  const { seniorId, steps, addSteps } = req.body;
  const senior = db.getSenior(seniorId);
  if (!senior) return res.status(404).json({ success: false, message: 'Senior not found' });

  const today = getTodayStr();
  const currentAct = db.getDailyActivity(seniorId, today);
  const newSteps = addSteps ? currentAct.steps + Number(addSteps) : Number(steps);

  const updatedAct = db.updateDailyActivity(seniorId, today, newSteps);
  const routine = db.getDailyRoutine(seniorId, today);

  let unlockedBreathing = false;
  let xpAwarded = 0;

  // Check goal completion
  if (updatedAct.steps >= updatedAct.step_goal && routine.walking_status !== 'completed') {
    routine.walking_status = 'completed';
    if (routine.breathing_status === 'locked') {
      routine.breathing_status = 'unlocked';
      unlockedBreathing = true;
    }
    xpAwarded = 80;
    routine.xp_earned += xpAwarded;
    db.addXp(seniorId, 'walking', xpAwarded, `Completed walking step goal (${updatedAct.steps} steps)`);

    // Notify guardian
    await WhatsAppService.sendTemplateMessage({
      seniorId,
      recipientPhone: senior.guardian_phone,
      templateType: 'exercise_complete',
      parameters: {
        seniorName: senior.name,
        activityTitle: `Walking Goal (${updatedAct.steps.toLocaleString()} steps)`,
        steps: updatedAct.steps,
        goal: updatedAct.step_goal,
        xp: xpAwarded,
      }
    });
  } else if (updatedAct.steps > 0 && routine.walking_status === 'pending') {
    routine.walking_status = 'in_progress';
    if (routine.breathing_status === 'locked') {
      routine.breathing_status = 'unlocked';
      unlockedBreathing = true;
    }
  }

  db.scheduleSave();

  res.json({
    success: true,
    data: {
      activity: updatedAct,
      routine,
      unlockedBreathing,
      xpAwarded,
    },
    message: 'Steps tracked successfully'
  });
});

apiRouter.patch('/activity/goal', (req, res) => {
  const { seniorId, stepGoal } = req.body;
  const senior = db.getSenior(seniorId);
  if (!senior) return res.status(404).json({ success: false, message: 'Senior not found' });

  senior.step_goal = Number(stepGoal);
  const today = getTodayStr();
  const act = db.getDailyActivity(seniorId, today);
  act.step_goal = Number(stepGoal);
  db.scheduleSave();

  res.json({ success: true, data: { stepGoal: senior.step_goal }, message: 'Step goal updated' });
});

apiRouter.get('/activity/history/:seniorId', (req, res) => {
  const history = db.getRaw().daily_activity.filter(a => a.senior_id === req.params.seniorId);
  res.json({ success: true, data: history });
});

// ----------------------------------------------------
// 5. BREATHING & WELLNESS
// ----------------------------------------------------
apiRouter.post('/wellness/breathing/start', (req, res) => {
  const { seniorId, durationSeconds = 180 } = req.body;
  const session = {
    id: `well_${Date.now()}`,
    senior_id: seniorId,
    type: 'breathing' as const,
    duration_seconds: Number(durationSeconds),
    completed: false,
    created_at: new Date().toISOString(),
  };
  db.getRaw().wellness_sessions.push(session);
  db.scheduleSave();
  res.json({ success: true, data: session });
});

apiRouter.post('/wellness/breathing/complete', async (req, res) => {
  const { seniorId, durationSeconds = 180 } = req.body;
  const senior = db.getSenior(seniorId);
  const today = getTodayStr();

  const session = {
    id: `well_${Date.now()}`,
    senior_id: seniorId,
    type: 'breathing' as const,
    duration_seconds: Number(durationSeconds),
    completed: true,
    completion_time: new Date().toISOString(),
    notes: 'Guided box breathing cycle completed',
    created_at: new Date().toISOString(),
  };
  db.getRaw().wellness_sessions.push(session);

  const routine = db.getDailyRoutine(seniorId, today);
  routine.breathing_status = 'completed';

  const xpAmount = 60;
  routine.xp_earned += xpAmount;
  const progress = db.addXp(seniorId, 'breathing', xpAmount, 'Completed peaceful breathing exercise');

  db.scheduleSave();

  res.json({
    success: true,
    data: { session, routine, progress, xpAwarded: xpAmount },
    message: 'Breathing exercise complete! Great job.'
  });
});

apiRouter.get('/wellness/breathing/history/:seniorId', (req, res) => {
  const history = db.getRaw().wellness_sessions.filter(w => w.senior_id === req.params.seniorId && w.type === 'breathing');
  res.json({ success: true, data: history });
});

// ----------------------------------------------------
// 6. YOGA & GENTLE EXERCISES
// ----------------------------------------------------
apiRouter.get('/exercises', (req, res) => {
  res.json({ success: true, data: db.getRaw().exercise_library.filter(e => e.enabled) });
});

apiRouter.get('/exercises/:id', (req, res) => {
  const ex = db.getRaw().exercise_library.find(e => e.id === req.params.id);
  if (!ex) return res.status(404).json({ success: false, message: 'Exercise not found' });
  res.json({ success: true, data: ex });
});

apiRouter.post('/exercises/:id/complete', async (req, res) => {
  const { seniorId } = req.body;
  const exercise = db.getRaw().exercise_library.find(e => e.id === req.params.id);
  if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });

  const senior = db.getSenior(seniorId);
  const today = getTodayStr();

  const session = {
    id: `exsess_${Date.now()}`,
    senior_id: seniorId,
    exercise_id: exercise.id,
    exercise_title: exercise.title,
    started_at: new Date(Date.now() - exercise.duration_minutes * 60000).toISOString(),
    completed_at: new Date().toISOString(),
    status: 'completed' as const,
    xp_awarded: 70,
  };
  db.getRaw().exercise_sessions.push(session);

  const routine = db.getDailyRoutine(seniorId, today);
  routine.yoga_status = 'completed';
  routine.xp_earned += session.xp_awarded;

  const progress = db.addXp(seniorId, 'yoga', session.xp_awarded, `Completed ${exercise.title}`);

  if (senior) {
    await WhatsAppService.sendTemplateMessage({
      seniorId,
      recipientPhone: senior.guardian_phone,
      templateType: 'exercise_complete',
      parameters: {
        seniorName: senior.name,
        activityTitle: exercise.title,
        steps: exercise.duration_minutes + ' min session',
        goal: 'Done',
        xp: session.xp_awarded,
      }
    });
  }

  db.scheduleSave();

  res.json({
    success: true,
    data: { session, routine, progress, xpAwarded: session.xp_awarded },
    message: `Wonderful! You completed ${exercise.title}.`
  });
});

// ----------------------------------------------------
// 7. PROGRESS, XP & REWARDS
// ----------------------------------------------------
apiRouter.get('/progress/:seniorId', (req, res) => {
  const prog = db.getProgress(req.params.seniorId);
  res.json({ success: true, data: prog });
});

apiRouter.get('/xp/history/:seniorId', (req, res) => {
  const history = db.getRaw().xp_transactions.filter(x => x.senior_id === req.params.seniorId);
  res.json({ success: true, data: history });
});

apiRouter.get('/rewards', (req, res) => {
  res.json({ success: true, data: db.getRaw().rewards.filter(r => r.enabled) });
});

apiRouter.post('/rewards/:id/redeem', async (req, res) => {
  const { seniorId } = req.body;
  const reward = db.getRaw().rewards.find(r => r.id === req.params.id);
  if (!reward) return res.status(404).json({ success: false, message: 'Reward not found' });

  const prog = db.getProgress(seniorId);
  if (prog.total_xp < reward.xp_cost) {
    return res.status(400).json({ success: false, message: `Not enough XP. Need ${reward.xp_cost} XP.` });
  }

  prog.total_xp -= reward.xp_cost;

  const redemption = {
    id: `red_${Date.now()}`,
    senior_id: seniorId,
    reward_id: reward.id,
    reward_title: reward.title,
    xp_spent: reward.xp_cost,
    status: 'pending' as const,
    redeemed_at: new Date().toISOString(),
  };
  db.getRaw().reward_redemptions.unshift(redemption);

  db.getRaw().xp_transactions.unshift({
    id: `xp_red_${Date.now()}`,
    senior_id: seniorId,
    activity_type: 'reward_redemption',
    xp_amount: -reward.xp_cost,
    description: `Redeemed reward: ${reward.title}`,
    created_at: new Date().toISOString(),
  });

  const senior = db.getSenior(seniorId);
  if (senior) {
    await NotificationService.broadcastToGuardians(
      seniorId,
      `Reward Redeemed: ${reward.title} 🎉`,
      `${senior.name} redeemed "${reward.title}" using ${reward.xp_cost} Wellness XP!`
    );
  }

  db.scheduleSave();

  res.json({
    success: true,
    data: { redemption, remainingXp: prog.total_xp },
    message: `Congratulations! "${reward.title}" is ready for you.`
  });
});

apiRouter.get('/rewards/redemptions/:seniorId', (req, res) => {
  const list = db.getRaw().reward_redemptions.filter(r => r.senior_id === req.params.seniorId);
  res.json({ success: true, data: list });
});

// ----------------------------------------------------
// 8. MEAL REMINDERS & LOGS
// ----------------------------------------------------
apiRouter.get('/meals/:seniorId', (req, res) => {
  const seniorId = req.params.seniorId;
  const schedules = db.getRaw().meal_schedules.filter(m => m.senior_id === seniorId);
  const today = getTodayStr();
  const logs = db.getRaw().meal_logs.filter(m => m.senior_id === seniorId && m.date === today);
  res.json({ success: true, data: { schedules, logs } });
});

apiRouter.post('/meals/:mealType/complete', async (req, res) => {
  const { seniorId, dishName } = req.body;
  const mealType = req.params.mealType as 'breakfast' | 'lunch' | 'dinner';
  const senior = db.getSenior(seniorId);
  const today = getTodayStr();
  const now = new Date();

  // Update or insert meal log
  let log = db.getRaw().meal_logs.find(m => m.senior_id === seniorId && m.date === today && m.meal_type === mealType);
  if (!log) {
    log = {
      id: `ml_${seniorId}_${mealType}_${today}`,
      senior_id: seniorId,
      meal_type: mealType,
      date: today,
      completed_at: now.toISOString(),
      status: 'completed',
    };
    db.getRaw().meal_logs.push(log);
  } else {
    log.completed_at = now.toISOString();
    log.status = 'completed';
  }

  // Update routine
  const routine = db.getDailyRoutine(seniorId, today);
  if (mealType === 'breakfast') routine.breakfast_status = 'completed';
  if (mealType === 'lunch') routine.lunch_status = 'completed';
  if (mealType === 'dinner') routine.dinner_status = 'completed';

  const xpAmount = 40;
  routine.xp_earned += xpAmount;
  const progress = db.addXp(seniorId, 'meal', xpAmount, `Confirmed ${mealType} enjoyed: ${dishName || 'Healthy meal'}`);

  let whatsappRes = null;
  if (senior) {
    whatsappRes = await WhatsAppService.sendTemplateMessage({
      seniorId,
      recipientPhone: senior.guardian_phone || '9561442888',
      templateType: mealType,
      parameters: {
        seniorName: senior.name,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        xp: xpAmount,
        dishName: dishName || '',
      }
    });

    await NotificationService.broadcastToGuardians(
      seniorId,
      `${mealType.toUpperCase()} Confirmed ✓`,
      `${senior.name} enjoyed ${dishName ? `"${dishName}" for ` : ''}${mealType} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    );
  }

  db.scheduleSave();

  res.json({
    success: true,
    data: { log, routine, progress, xpAwarded: xpAmount, whatsapp: whatsappRes },
    message: `Yum! Your ${mealType} confirmation is recorded.`
  });
});

// ----------------------------------------------------
// 9. MEDICINES & INVENTORY
// ----------------------------------------------------
apiRouter.get('/medicines/:seniorId', (req, res) => {
  const meds = db.getMedicines(req.params.seniorId);
  const today = getTodayStr();
  const logs = db.getRaw().medicine_logs.filter(l => l.senior_id === req.params.seniorId && l.date === today);
  res.json({ success: true, data: { medicines: meds, todayLogs: logs } });
});

apiRouter.post('/medicines', (req, res) => {
  const { seniorId, name, dosage_information, instructions, quantity_remaining = 30, low_stock_threshold = 6, schedule_time = '09:00' } = req.body;
  const existing = db.getMedicines(seniorId);
  const newMed: Medicine = {
    id: `med_${Date.now()}`,
    senior_id: seniorId,
    medicine_number: existing.length + 1,
    name,
    dosage_information,
    instructions,
    quantity_remaining: Number(quantity_remaining),
    low_stock_threshold: Number(low_stock_threshold),
    refill_unit: 'tablets',
    schedule_time,
    enabled: true,
    created_at: new Date().toISOString(),
  };
  db.getRaw().medicines.push(newMed);
  db.scheduleSave();
  res.status(201).json({ success: true, data: newMed, message: 'Medicine added' });
});

apiRouter.patch('/medicines/:id', (req, res) => {
  const updated = db.updateMedicine(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Medicine not found' });
  res.json({ success: true, data: updated, message: 'Medicine updated' });
});

apiRouter.post('/medicines/:id/taken', async (req, res) => {
  const { seniorId } = req.body;
  const med = db.getRaw().medicines.find(m => m.id === req.params.id);
  if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });

  const senior = db.getSenior(seniorId);
  const today = getTodayStr();
  const now = new Date();

  // Deduct inventory
  med.quantity_remaining = Math.max(0, med.quantity_remaining - 1);

  // Record log
  const log = {
    id: `medlog_${Date.now()}`,
    medicine_id: med.id,
    senior_id: seniorId,
    medicine_number: med.medicine_number,
    medicine_name: med.name,
    date: today,
    scheduled_time: med.schedule_time,
    taken_at: now.toISOString(),
    status: 'taken' as const,
    notes: 'Confirmed on screen by senior',
  };
  db.getRaw().medicine_logs.unshift(log);

  // Update routine
  const routine = db.getDailyRoutine(seniorId, today);
  routine.medicine_status = 'completed';
  if (med.medicine_number === 1 || med.name.toLowerCase().includes('breakfast')) {
    routine.breakfast_medicine_status = 'completed';
  } else if (med.medicine_number === 2 || med.name.toLowerCase().includes('lunch')) {
    routine.lunch_medicine_status = 'completed';
  } else if (med.medicine_number === 3 || med.name.toLowerCase().includes('dinner') || med.schedule_time >= '20:00') {
    routine.dinner_medicine_status = 'completed';
    routine.night_medicine_status = 'completed';
  }

  const xpAmount = 40;
  routine.xp_earned += xpAmount;
  const progress = db.addXp(seniorId, 'medicine', xpAmount, `Confirmed Medicine #${med.medicine_number} (${med.name}) taken`);

  let lowStockAlert = false;
  // Check low-stock threshold
  if (med.quantity_remaining <= med.low_stock_threshold) {
    lowStockAlert = true;
    // Create Refill Request
    db.getRaw().refill_requests.unshift({
      id: `refill_${Date.now()}`,
      medicine_id: med.id,
      senior_id: seniorId,
      medicine_name: med.name,
      quantity_remaining: med.quantity_remaining,
      requested_at: now.toISOString(),
      status: 'requested',
      notes: `Quantity dropped to ${med.quantity_remaining} doses (threshold: ${med.low_stock_threshold})`,
    });

    if (senior) {
      await WhatsAppService.sendTemplateMessage({
        seniorId,
        recipientPhone: senior.guardian_phone,
        templateType: 'low_stock',
        parameters: {
          seniorName: senior.name,
          medicineNumber: med.medicine_number,
          medicineName: med.name,
          remainingDoses: med.quantity_remaining,
          threshold: med.low_stock_threshold,
        }
      });
    }
  }

  // Notify guardian of dose confirmation
  if (senior) {
    await WhatsAppService.sendTemplateMessage({
      seniorId,
      recipientPhone: senior.guardian_phone,
      templateType: 'medicine_taken',
      parameters: {
        seniorName: senior.name,
        medicineNumber: med.medicine_number,
        medicineName: med.name,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        remainingDoses: med.quantity_remaining,
      }
    });
  }

  db.scheduleSave();

  res.json({
    success: true,
    data: {
      medicine: med,
      log,
      routine,
      progress,
      lowStockAlert,
      xpAwarded: xpAmount,
    },
    message: `Medicine #${med.medicine_number} confirmed taken!`
  });
});

apiRouter.post('/medicines/:id/remind', async (req, res) => {
  const { seniorId, delayMinutes = 10 } = req.body;
  const med = db.getRaw().medicines.find(m => m.id === req.params.id);
  if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });

  // Trigger immediate friendly voice reminder
  await VoiceService.makeCall({
    seniorId,
    callType: 'medicine_reminder',
    triggerSource: 'senior_request',
    medicineNumber: med.medicine_number,
  });

  res.json({
    success: true,
    message: `Voice reminder placed for Medicine #${med.medicine_number}. Will check back in ${delayMinutes} minutes.`
  });
});

apiRouter.get('/medicines/:seniorId/history', (req, res) => {
  const logs = db.getRaw().medicine_logs.filter(l => l.senior_id === req.params.seniorId);
  const refills = db.getRaw().refill_requests.filter(r => r.senior_id === req.params.seniorId);
  res.json({ success: true, data: { logs, refills } });
});

apiRouter.post('/medicines/refill/order', (req, res) => {
  const { refillId, medicineId, quantityToAdd = 30 } = req.body;
  const med = db.getRaw().medicines.find(m => m.id === medicineId);
  if (med) {
    med.quantity_remaining += Number(quantityToAdd);
  }
  const refill = db.getRaw().refill_requests.find(r => r.id === refillId);
  if (refill) {
    refill.status = 'fulfilled';
  }
  db.scheduleSave();
  res.json({ success: true, message: 'Pharmacy refill confirmed and inventory updated!' });
});

// ----------------------------------------------------
// 10. SOS & EMERGENCY SYSTEM
// ----------------------------------------------------
apiRouter.post('/sos/trigger', async (req, res) => {
  const { seniorId, location_lat, location_lng, location_address } = req.body;
  const senior = db.getSenior(seniorId);
  if (!senior) return res.status(404).json({ success: false, message: 'Senior not found' });

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const primaryContact = db.getEmergencyContacts(seniorId)[0] || {
    name: senior.emergency_contact_name,
    phone: senior.emergency_contact_phone,
  };

  const sosEvent = {
    id: `sos_${Date.now()}`,
    senior_id: seniorId,
    contact_name: primaryContact.name,
    contact_phone: primaryContact.phone,
    triggered_at: now.toISOString(),
    location_lat: location_lat || 37.7749,
    location_lng: location_lng || -122.4194,
    location_address: location_address || 'Oakwood Residence, Apt 4B',
    status: 'active' as const,
    call_status: 'completed' as const,
    notification_status: 'delivered' as const,
  };
  db.getRaw().sos_events.unshift(sosEvent);

  // 1. Dispatch Voice Emergency Call
  await VoiceService.makeCall({
    seniorId,
    callType: 'sos',
    triggerSource: 'sos',
    customScript: `EMERGENCY ALERT: ${senior.name} has activated the emergency SOS button. Connecting to primary responder ${primaryContact.name} immediately.`,
  });

  // 2. Dispatch WhatsApp Emergency Alert to Guardian
  await WhatsAppService.sendTemplateMessage({
    seniorId,
    recipientPhone: senior.guardian_phone,
    templateType: 'sos_alert',
    parameters: {
      seniorName: senior.name,
      time: timeFormatted,
      location: sosEvent.location_address,
      contactPhone: primaryContact.phone,
    }
  });

  // 3. Broadcast SMS and Push Alert
  await NotificationService.broadcastToGuardians(
    seniorId,
    `🚨 SOS EMERGENCY: ${senior.name}`,
    `EMERGENCY ALERT: ${senior.name} pressed SOS at ${timeFormatted}. Location: ${sosEvent.location_address}. Primary contact (${primaryContact.phone}) has been dialed.`
  );

  db.addAuditLog(senior.user_id, 'senior', 'SOS_TRIGGERED', 'sos_events', sosEvent.id, {
    location: sosEvent.location_address,
    time: timeFormatted,
  });

  db.scheduleSave();

  res.json({
    success: true,
    data: sosEvent,
    message: `Emergency services and ${primaryContact.name} have been notified immediately.`
  });
});

apiRouter.get('/sos/history/:seniorId', (req, res) => {
  const events = db.getRaw().sos_events.filter(e => e.senior_id === req.params.seniorId);
  res.json({ success: true, data: events });
});

apiRouter.post('/sos/:id/resolve', (req, res) => {
  const { resolvedBy = 'David Vance (Guardian)' } = req.body;
  const event = db.getRaw().sos_events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'SOS event not found' });

  event.status = 'resolved';
  event.resolved_at = new Date().toISOString();
  event.resolved_by = resolvedBy;
  db.scheduleSave();

  res.json({ success: true, data: event, message: 'SOS event marked as resolved.' });
});

apiRouter.get('/emergency-contacts/:seniorId', (req, res) => {
  const contacts = db.getEmergencyContacts(req.params.seniorId);
  res.json({ success: true, data: contacts });
});

apiRouter.post('/seniors/:id/emergency-contacts', (req, res) => {
  const { name, relationship, phone, is_primary = false } = req.body;
  const contact: EmergencyContact = {
    id: `emg_${Date.now()}`,
    senior_id: req.params.id,
    name,
    relationship,
    phone,
    is_primary: Boolean(is_primary),
    priority_order: db.getEmergencyContacts(req.params.id).length + 1,
    created_at: new Date().toISOString(),
  };
  db.getRaw().emergency_contacts.push(contact);
  db.scheduleSave();
  res.status(201).json({ success: true, data: contact, message: 'Emergency contact added' });
});

// ----------------------------------------------------
// NOTIFICATIONS, VOICE CALLS & AI COMPANION
// ----------------------------------------------------
apiRouter.get('/notifications/:seniorId', (req, res) => {
  const list = db.getRaw().notifications.filter(n => n.senior_id === req.params.seniorId);
  res.json({ success: true, data: list });
});

apiRouter.get('/voice/history/:seniorId', (req, res) => {
  const list = VoiceService.getCallHistory(req.params.seniorId);
  res.json({ success: true, data: list });
});

apiRouter.post('/voice/call', async (req, res) => {
  const { seniorId, callType = 'wakeup', customScript } = req.body;
  const call = await VoiceService.makeCall({
    seniorId,
    callType,
    triggerSource: 'manual',
    customScript,
  });
  res.json({ success: true, data: call, message: 'Voice call simulated & recorded.' });
});

apiRouter.post('/ai/companion-chat', async (req, res) => {
  const { seniorId, message } = req.body;
  const senior = db.getSenior(seniorId) || { name: 'Eleanor' };
  const reply = await AIService.companionChat(senior.name, message);
  res.json({ success: true, data: { reply } });
});

apiRouter.get('/ai/morning-greeting', async (req, res) => {
  const seniorId = (req.query.seniorId as string) || 'senior_eleanor_01';
  const senior = db.getSenior(seniorId) || { name: 'Eleanor' };
  const prog = db.getProgress(seniorId);
  const greeting = await AIService.generateMorningGreeting(senior.name, prog.current_streak);
  res.json({ success: true, data: { greeting } });
});

apiRouter.get('/ai/guardian-summary', async (req, res) => {
  const seniorId = (req.query.seniorId as string) || 'senior_eleanor_01';
  const summary = await AIService.generateGuardianDailySummary(seniorId);
  res.json({ success: true, data: { summary } });
});

// ----------------------------------------------------
// DEMO SIMULATION CONTROLS
// ----------------------------------------------------
apiRouter.post('/demo/trigger-event', async (req, res) => {
  const { seniorId = 'senior_eleanor_01', eventType, extraParam } = req.body;
  try {
    const result = await SchedulerService.triggerEvent(seniorId, eventType, extraParam);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.post('/demo/reset', (req, res) => {
  const freshSeed = db.getSeedData();
  Object.assign(db.getRaw(), freshSeed);
  db.scheduleSave();
  res.json({ success: true, message: 'Database reset to initial demo state.' });
});
