import type { Database } from "@/lib/database.types";

export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Attempt = Database["public"]["Tables"]["attempts"]["Row"];
export type LessonProgress = Database["public"]["Tables"]["lesson_progress"]["Row"];
export type DailyActivity = Database["public"]["Tables"]["daily_activity"]["Row"];
export type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
export type UserAchievement = Database["public"]["Tables"]["user_achievements"]["Row"];
export type ActivityReviewState = Database["public"]["Tables"]["activity_review_state"]["Row"];

export type AttemptResult = {
  correct: boolean;
  xp_awarded: number;
  correct_answer?: string;
  mastery?: number;
  streak?: number;
  attempt_count?: number;
  correct_count?: number;
  review_due_at?: string;
  review_due_days?: number;
  new_achievements?: Array<Pick<Achievement, "id" | "name" | "description" | "xp_reward">>;
};

export type LearningData = {
  courses: Course[];
  lessons: Lesson[];
  activities: Activity[];
  achievements: Achievement[];
  profile: Profile | null;
  attempts: Attempt[];
  lessonProgress: LessonProgress[];
  dailyActivity: DailyActivity[];
  userAchievements: UserAchievement[];
  reviewStates: ActivityReviewState[];
};