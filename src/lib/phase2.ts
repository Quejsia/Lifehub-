import { createClient } from "@/lib/supabase/server";
import type { Activity, Course, Lesson, LessonProgress, Profile } from "@/lib/types";
import type { Database } from "@/lib/database.types";

export type ActivityReviewState = Database["public"]["Tables"]["activity_review_state"]["Row"];

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
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id,slug,title,description,subject,level_label,published,created_at,updated_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (courseError) throw courseError;
  if (!course) return null;

  const { data: lessons, error: lessonError } = await supabase
    .from("lessons")
    .select("id,course_id,slug,title,description,sort_order,published,created_at")
    .eq("course_id", course.id)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .limit(1);

  if (lessonError) throw lessonError;
  const lesson = lessons?.[0];
  if (!lesson) return null;

  const userResult = await supabase.auth.getUser();
  const user = userResult.data.user;

  const publicResult = await supabase
    .from("activities")
    .select("id,lesson_id,type,prompt,answer,definition,difficulty,explanation,options,sort_order,created_at")
    .eq("lesson_id", lesson.id)
    .order("sort_order", { ascending: true });

  if (publicResult.error) throw publicResult.error;

  let profile: Profile | null = null;
  let progress: LessonProgress | null = null;
  let reviewStates: ActivityReviewState[] = [];

  if (user) {
    const [profileResult, progressResult, reviewResult] = await Promise.all([
      supabase.from("profiles").select("id,display_name,avatar_url,xp,level,current_streak,longest_streak,created_at,updated_at").eq("id", user.id).maybeSingle(),
      supabase.from("lesson_progress").select("user_id,lesson_id,attempt_count,correct_count,mastery,last_practiced_at,completed_at").eq("user_id", user.id).eq("lesson_id", lesson.id).maybeSingle(),
      supabase.from("activity_review_state").select("activity_id,correct_streak,due_at,ease_factor,interval_days,last_reviewed_at,repetitions,user_id").eq("user_id", user.id),
    ]);
    if (profileResult.error) throw profileResult.error;
    if (progressResult.error) throw progressResult.error;
    if (reviewResult.error) throw reviewResult.error;
    profile = profileResult.data;
    progress = progressResult.data;
    reviewStates = reviewResult.data ?? [];
  }

  return { course, lesson, activities: publicResult.data ?? [], reviewStates, progress, profile };
}