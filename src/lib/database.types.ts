export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      achievements: { Row: { description: string; id: string; name: string; slug: string; xp_reward: number } };
      activities: { Row: { answer: string | null; created_at: string; definition: string | null; difficulty: string; explanation: string | null; id: string; lesson_id: string; options: Json; prompt: string; sort_order: number; type: string } };
      attempts: { Row: { activity_id: string; created_at: string; duration_ms: number | null; id: string; is_correct: boolean; submitted_answer: string | null; user_id: string; xp_awarded: number } };
      courses: { Row: { created_at: string; description: string | null; id: string; level_label: string | null; published: boolean; slug: string; subject: string; title: string; updated_at: string } };
      daily_activity: { Row: { activity_date: string; attempts_count: number; user_id: string; xp_earned: number } };
      lesson_progress: { Row: { attempt_count: number; completed_at: string | null; correct_count: number; last_practiced_at: string | null; lesson_id: string; mastery: number; user_id: string } };
      lessons: { Row: { course_id: string; created_at: string; description: string | null; id: string; published: boolean; slug: string; sort_order: number; title: string } };
      profiles: { Row: { avatar_url: string | null; created_at: string; current_streak: number; display_name: string | null; id: string; level: number; longest_streak: number; updated_at: string; xp: number } };
      user_achievements: { Row: { achievement_id: string; earned_at: string; user_id: string } };
    };
    Functions: {
      submit_spelling_attempt: { Args: { p_activity_id: string; p_duration_ms?: number; p_submitted_answer: string }; Returns: Json };
    };
  };
}