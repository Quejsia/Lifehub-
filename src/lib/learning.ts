import { createClient } from "@/lib/supabase/server";
import type { LearningData } from "@/lib/types";

export async function getLearningData(): Promise<LearningData> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const [courses, lessons, activities, achievements] = await Promise.all([
    supabase.from("courses").select("*").eq("published", true).order("created_at", { ascending: true }),
    supabase.from("lessons").select("*").eq("published", true).order("sort_order", { ascending: true }),
    supabase.from("activities").select("*").order("sort_order", { ascending: true }),
    supabase.from("achievements").select("*").order("xp_reward", { ascending: true }),
  ]);

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
    };
  }

  const userId = userData.user.id;
  const [profile, attempts, lessonProgress, dailyActivity, userAchievements] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("attempts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(250),
    supabase.from("lesson_progress").select("*").eq("user_id", userId),
    supabase.from("daily_activity").select("*").eq("user_id", userId).order("activity_date", { ascending: false }).limit(60),
    supabase.from("user_achievements").select("*").eq("user_id", userId),
  ]);

  if (profile.error) throw profile.error;
  if (attempts.error) throw attempts.error;
  if (lessonProgress.error) throw lessonProgress.error;
  if (dailyActivity.error) throw dailyActivity.error;
  if (userAchievements.error) throw userAchievements.error;

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
  };
}