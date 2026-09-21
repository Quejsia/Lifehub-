import { createClient } from "@/lib/supabase/server";
import type { Activity, ActivityReviewState, Course, Lesson, LessonProgress, Profile } from "@/lib/types";

export type Phase2CourseData = {
  course: Course;
  lesson: Lesson;
  activities: Activity[];
  reviewStates: ActivityReviewState[];
  progress: LessonProgress | null;
  profile: Profile | null;
};

export async function getPhase2Course(slug: string): Promise<Phase2CourseData | null> {
  const supabase = await createClient();

  // Keep the complex PostgREST generic chain isolated from the page-level types.
  // The generated Supabase schema remains the source of truth for the returned models.
  const from = supabase.from.bind(supabase) as unknown as (table: string) => any;

  const { data: courseData, error: courseError } = await from("courses")
    .select("id,slug,title,description,subject,level_label,published,created_at,updated_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (courseError) throw courseError;
  const course = courseData as Course | null;
  if (!course) return null;

  const { data: lessonData, error: lessonError } = await from("lessons")
    .select("id,course_id,slug,title,description,sort_order,published,created_at")
    .eq("course_id", course.id)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .limit(1);

  if (lessonError) throw lessonError;
  const lesson = (lessonData as Lesson[] | null)?.[0];
  if (!lesson) return null;

  const userResult = await supabase.auth.getUser();
  if (userResult.error) throw userResult.error;
  const user = userResult.data.user;

  const { data: activityData, error: activityError } = await from("activities")
    .select("id,lesson_id,type,prompt,answer,definition,difficulty,explanation,options,sort_order,created_at")
    .eq("lesson_id", lesson.id)
    .order("sort_order", { ascending: true });

  if (activityError) throw activityError;
  const activities = (activityData as Activity[] | null) ?? [];

  let profile: Profile | null = null;
  let progress: LessonProgress | null = null;
  let reviewStates: ActivityReviewState[] = [];

  if (user) {
    const [profileResult, progressResult, reviewResult] = await Promise.all([
      from("profiles")
        .select("id,display_name,avatar_url,xp,level,current_streak,longest_streak,created_at,updated_at")
        .eq("id", user.id)
        .maybeSingle(),
      from("lesson_progress")
        .select("user_id,lesson_id,attempt_count,correct_count,mastery,last_practiced_at,completed_at")
        .eq("user_id", user.id)
        .eq("lesson_id", lesson.id)
        .maybeSingle(),
      from("activity_review_state")
        .select("activity_id,correct_streak,due_at,ease_factor,interval_days,last_reviewed_at,repetitions,user_id")
        .eq("user_id", user.id),
    ]);

    if (profileResult.error) throw profileResult.error;
    if (progressResult.error) throw progressResult.error;
    if (reviewResult.error) throw reviewResult.error;

    profile = profileResult.data as Profile | null;
    progress = progressResult.data as LessonProgress | null;
    reviewStates = (reviewResult.data as ActivityReviewState[] | null) ?? [];
  }

  return {
    course,
    lesson,
    activities,
    reviewStates,
    progress,
    profile,
  };
}