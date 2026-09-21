import { createClient } from "@/lib/supabase/server";
import type { LearningData } from "@/lib/types";

export async function getLearningData(): Promise<LearningData> {
  const supabase = await createClient();

  const userPromise = supabase.auth.getUser();
  const publicPromise = Promise.all([
    supabase
      .from("courses")
      .select("id,slug,title,description,subject,level_label,published,created_at,updated_at")
      .eq("published", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("lessons")
      .select("id,course_id,slug,title,description,sort_order,published,created_at")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("activities")
      .select("id,lesson_id,type,prompt,answer,definition,difficulty,explanation,options,sort_order,created_at")
      .order("sort_order", { ascending: true }),
    supabase
      .from("achievements")
      .select("id,slug,name,description,xp_reward")
      .order("xp_reward", { ascending: true }),
  ]);

  const [
    { data: userData },
    [courses, lessons, activities, achievements],
  ] = await Promise.all([userPromise, publicPromise]);

  if (courses.error) throw courses.error;
  if (lessons.error) throw lessons.error;
  if (activities.error) throw activities.error;
  if (achievements.error) throw achievements.error;

  if (!userData.user) {
    return {
      courses: courses.data,
      lessons: lessons.data,
      activities: activities.data,
      achievements: achievements.data,
      profile: null,
      attempts: [],
      lessonProgress: [],
      dailyActivity: [],
      userAchievements: [],
      reviewStates: [],
    };
  }

  const userId = userData.user.id;

  const [profile, attempts, lessonProgress, dailyActivity, userAchievements] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,display_name,avatar_url,xp,level,current_streak,longest_streak,created_at,updated_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("attempts")
      .select("id,user_id,activity_id,submitted_answer,is_correct,duration_ms,xp_awarded,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(250),
    supabase
      .from("lesson_progress")
      .select("user_id,lesson_id,attempt_count,correct_count,mastery,last_practiced_at,completed_at")
      .eq("user_id", userId),
    supabase
      .from("daily_activity")
      .select("user_id,activity_date,attempts_count,xp_earned")
      .eq("user_id", userId)
      .order("activity_date", { ascending: false })
      .limit(60),
    supabase
      .from("user_achievements")
      .select("user_id,achievement_id,earned_at")
      .eq("user_id", userId),
    supabase
      .from("activity_review_state")
      .select("user_id,activity_id,correct_streak,due_at,ease_factor,interval_days,last_reviewed_at,repetitions")
      .eq("user_id", userId),
  ]);

  if (profile.error) throw profile.error;
  if (attempts.error) throw attempts.error;
  if (lessonProgress.error) throw lessonProgress.error;
  if (dailyActivity.error) throw dailyActivity.error;
  if (userAchievements.error) throw userAchievements.error;
  if (reviewStates.error) throw reviewStates.error;

  return {
    courses: courses.data,
    lessons: lessons.data,
    activities: activities.data,
    achievements: achievements.data,
    profile: profile.data,
    attempts: attempts.data,
    lessonProgress: lessonProgress.data,
    dailyActivity: dailyActivity.data,
    userAchievements: userAchievements.data,
    reviewStates: reviewStates.data ?? [],
  };
}