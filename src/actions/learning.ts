"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AttemptResult } from "@/lib/types";

export async function submitSpellingAttempt(
  activityId: string,
  submittedAnswer: string,
  durationMs?: number,
): Promise<AttemptResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("You must be signed in to practice.");

  const answer = submittedAnswer.trim();
  if (!answer) throw new Error("Enter an answer before checking.");

  const { data, error } = await supabase.rpc("submit_spelling_attempt", {
    p_activity_id: activityId,
    p_submitted_answer: answer,
    p_duration_ms: durationMs ?? undefined,
  });

  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/practice");
  return data as AttemptResult;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}