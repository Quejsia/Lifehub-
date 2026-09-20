"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, Volume2, XCircle } from "lucide-react";
import { submitSpellingAttempt } from "@/actions/learning";
import type { Activity, AttemptResult } from "@/lib/types";

export function SpellingPractice({ activities, signedIn }: { activities: Activity[]; signedIn: boolean }) {
  const spellingActivities = useMemo(
    () => activities.filter((activity) => ["listen_spell", "fix_spelling", "missing_letters", "dictation"].includes(activity.type)),
    [activities],
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AttemptResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());

  const activity = spellingActivities[index % Math.max(1, spellingActivities.length)];

  useEffect(() => {
    setAnswer("");
    setFeedback(null);
    setStartedAt(Date.now());
  }, [activity?.id]);

  function speak() {
    if (!activity?.answer || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(activity.answer));
  }

  async function checkAnswer() {
    if (!signedIn) return;
    if (!activity || !answer.trim() || busy || feedback) return;
    setBusy(true);
    try {
      const result = await submitSpellingAttempt(activity.id, answer, Date.now() - startedAt);
      setFeedback(result);
    } catch (error) {
      setFeedback({ correct: false, xp_awarded: 0, correct_answer: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  if (!activity) {
    return <div className="feedback info">No spelling activities are published yet.</div>;
  }

  return (
    <div>
      <div className="card-kicker">PENLINE&nbsp;&nbsp; SPELLING LEARNER</div>
      <h2 className="lesson-title">Common Words</h2>
      <div className="mode-label">{activity.type.replaceAll("_", " ").replace(/(^|\s)\S/g, (c) => c.toUpperCase())}</div>
      <div className="prompt">{activity.prompt}</div>

      <div className="input-row">
        <input
          className="answer-input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void checkAnswer(); }}
          placeholder="Type your answer..."
          disabled={!signedIn || busy || !!feedback}
          aria-label="Spelling answer"
          autoComplete="off"
        />
        <button className="primary-btn" type="button" onClick={() => void checkAnswer()} disabled={!signedIn || busy || !!feedback || !answer.trim()}>
          {busy ? <Clock3 size={17} /> : <Check size={17} />}
          {busy ? "Checking…" : "Check answer"}
        </button>
      </div>

      {!signedIn && <div className="feedback info">Sign in to save attempts, earn XP, and keep your streak.</div>}

      {activity.type === "listen_spell" && signedIn && (
        <button className="secondary-btn" type="button" style={{ marginTop: 14 }} onClick={speak}>
          <Volume2 size={17} /> Play word
        </button>
      )}

      {feedback && (
        <div className={`feedback ${feedback.correct ? "correct" : "incorrect"}`} role="status">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {feedback.correct ? <Check size={18} /> : <XCircle size={18} />}
            {feedback.correct ? `Correct! +${feedback.xp_awarded} XP` : `Not quite. ${feedback.correct_answer ?? "Try the next one."}`}
          </div>
          {feedback.correct && feedback.mastery !== undefined && (
            <div style={{ marginTop: 8, fontWeight: 600 }}>Lesson mastery: {Math.round(feedback.mastery)}%</div>
          )}
        </div>
      )}

      {feedback && (
        <button className="secondary-btn" type="button" style={{ marginTop: 12 }} onClick={() => setIndex((value) => value + 1)}>
          Next word
        </button>
      )}
    </div>
  );
}