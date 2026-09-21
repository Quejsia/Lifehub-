"use server";

import { createClient } from "@/lib/supabase/server";
import type { AttemptResult } from "@/lib/types";

type RpcResponse = {
  data: unknown;
  error: unknown;
};

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

  // Keep the database RPC contract isolated from the generated client typing.
  const rpc = supabase.rpc as unknown as (
    functionName: string,
    args: {
      p_activity_id: string;
      p_submitted_answer: string;
      p_duration_ms?: number;
    },
  ) => Promise<RpcResponse>;

  const { data, error } = await rpc("submit_spelling_attempt", {
    p_activity_id: activityId,
    p_submitted_answer: answer,
    p_duration_ms: durationMs,
  });

  if (error) throw error;
  return data as AttemptResult;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}