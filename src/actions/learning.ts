"use server";

import { createClient } from "@/lib/supabase/server";
import type { AttemptResult } from "@/lib/types";

type RpcResponse = {
  data: unknown;
  error: unknown;
};

type LearningRpc = (
  functionName: string,
  args: Record<string, unknown>,
) => Promise<RpcResponse>;

export async function submitLearningActivity(
  activityId: string,
  submittedAnswer: string,
  durationMs?: number,
): Promise<AttemptResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("You must be signed in to practice.");

  const answer = submittedAnswer.trim();
  if (!answer) throw new Error("Enter an answer before checking.");
  if (answer.length > 500) throw new Error("Answer is too long.");
  if (
    durationMs !== undefined &&
    (!Number.isFinite(durationMs) || durationMs < 0 || durationMs > 900000)
  ) {
    throw new Error("Invalid answer duration.");
  }

  // Bind RPC to the Supabase client and keep its complex overloads behind one server-only boundary.
  const rpc = supabase.rpc.bind(supabase) as unknown as LearningRpc;

  const { data, error } = await rpc("submit_activity_attempt", {
    p_activity_id: activityId,
    p_submitted_answer: answer,
    p_duration_ms: durationMs,
  });

  if (error) throw error;
  return data as AttemptResult;
}

export async function submitSpellingAttempt(
  activityId: string,
  submittedAnswer: string,
  durationMs?: number,
): Promise<AttemptResult> {
  return submitLearningActivity(activityId, submittedAnswer, durationMs);
}

export async function reviewFlashcard(
  activityId: string,
  knewIt: boolean,
  durationMs?: number,
): Promise<AttemptResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("You must be signed in to review flashcards.");

  const rpc = supabase.rpc.bind(supabase) as unknown as LearningRpc;
  const { data, error } = await rpc("review_flashcard", {
    p_activity_id: activityId,
    p_knew_it: knewIt,
    p_duration_ms: durationMs,
  });

  if (error) throw error;
  return data as AttemptResult;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}