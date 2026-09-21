"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, RotateCcw, Volume2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { submitSpellingAttempt } from "@/actions/learning";
import type { Activity, AttemptResult } from "@/lib/types";

const modeLabels: Record<string, string> = {
  listen_spell: "Listen & Spell",
  fix_spelling: "Fix the Spelling",
  missing_letters: "Missing Letters",
  dictation: "Dictation",
};

export function SpellingPractice({
  activities,
  signedIn,
}: {
  activities: Activity[];
  signedIn: boolean;
}) {
  const router = useRouter();
  const spellingActivities = useMemo(
    () =>
      activities
        .filter((activity) =>
          ["listen_spell", "fix_spelling", "missing_letters", "dictation"].includes(activity.type),
        )
        .sort((a, b) => a.sort_order - b.sort_order),
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
    if (!signedIn || !activity || !answer.trim() || busy || feedback) return;
    setBusy(true);
    try {
      const result = await submitSpellingAttempt(activity.id, answer, Date.now() - startedAt);
      setFeedback(result);
      router.refresh();
    } catch (error) {
      setFeedback({
        correct: false,
        xp_awarded: 0,
        correct_answer: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setAnswer("");
    setFeedback(null);
    setStartedAt(Date.now());
  }

  function nextWord() {
    setIndex((value) => value + 1);
  }

  if (!activity) {
    return <div className="feedback info">No spelling activities are published yet.</div>;
  }

  const mode = modeLabels[activity.type] ?? "Practice";

  return (
    <div className="practice-content">
      <div className="card-kicker">
        <span className="kicker-dot" aria-hidden="true" />
        SPELLING LEARNER
      </div>

      <div className="practice-heading-row">
        <div>
          <h2 className="lesson-title">Common Words</h2>
          <div className="mode-label">{mode}</div>
        </div>
        <span className="activity-count" aria-label={`Question ${(index % spellingActivities.length) + 1} of ${spellingActivities.length}`}>
          {(index % spellingActivities.length) + 1}/{spellingActivities.length}
        </span>
      </div>

      <div className="prompt">{activity.prompt}</div>

      <form
        className="answer-form"
        onSubmit={(event) => {
          event.preventDefault();
          void checkAnswer();
        }}
        noValidate
      >
        <label className="sr-only" htmlFor="spelling-answer">Your spelling answer</label>
        <input
          id="spelling-answer"
          className="answer-input"
          name="spelling-answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          disabled={!signedIn || busy || !!feedback}
          aria-describedby="answer-hint"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />

        <button
          className="primary-btn check-btn"
          type="submit"
          disabled={!signedIn || busy || !!feedback || !answer.trim()}
        >
          {busy ? <Clock3 size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
          <span>{busy ? "Checking…" : "Check answer"}</span>
        </button>
      </form>

      <p id="answer-hint" className="answer-hint">
        {signedIn ? "Press Enter to check your answer." : "Sign in to save attempts, earn XP, and keep your streak."}
      </p>

      <div className="practice-actions">
        {activity.type === "listen_spell" && signedIn && (
          <button className="secondary-btn" type="button" onClick={speak}>
            <Volume2 size={18} aria-hidden="true" /> Play word
          </button>
        )}
      </div>

      {feedback && (
        <div className={`feedback ${feedback.correct ? "correct" : "incorrect"}`} role="status" aria-live="polite">
          <div className="feedback-main">
            {feedback.correct ? <Check size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
            <span>
              {feedback.correct
                ? `Correct! +${feedback.xp_awarded} XP`
                : feedback.correct_answer ?? "That answer wasn't quite right."}
            </span>
          </div>
          {feedback.correct ? (
            <div className="feedback-detail">
              {feedback.mastery !== undefined ? `Lesson mastery: ${Math.round(feedback.mastery)}%` : "Progress saved."}
            </div>
          ) : (
            <div className="feedback-detail">You can try the same word again or continue to the next one.</div>
          )}
        </div>
      )}

      {feedback && (
        <div className="next-actions">
          {!feedback.correct && (
            <button className="secondary-btn" type="button" onClick={retry}>
              <RotateCcw size={17} aria-hidden="true" /> Try again
            </button>
          )}
          <button className={`primary-btn ${feedback.correct ? "" : "next-secondary"}`} type="button" onClick={nextWord}>
            Next word <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}