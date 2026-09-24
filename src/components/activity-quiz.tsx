"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, CircleAlert, RotateCcw } from "lucide-react";
import { submitLearningActivity } from "@/actions/learning";
import type { Activity, AttemptResult } from "@/lib/types";

function getOptions(value: Activity["options"]): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function ActivityQuiz({
  activities,
  signedIn,
  kind,
  title,
  description,
}: {
  activities: Activity[];
  signedIn: boolean;
  kind: "vocabulary" | "reading" | "mathematics" | "science";
  title: string;
  description: string;
}) {
  const quizActivities = useMemo(() => activities.filter((item) => item.type === "multiple_choice"), [activities]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [feedback, setFeedback] = useState<AttemptResult | null>(null);
  const [busy, setBusy] = useState(false);
  const activity = quizActivities[index % Math.max(quizActivities.length, 1)];
  const options = getOptions(activity?.options);
  const passage = kind === "reading" ? activity?.definition : null;
  const sectionLabel = kind === "mathematics" ? "MATHEMATICS" : kind === "science" ? "SCIENCE" : kind === "vocabulary" ? "VOCABULARY" : "READING";

  async function submit() {
    if (!signedIn || !activity || !selected || busy || feedback) return;
    setBusy(true);
    try {
      const result = await submitLearningActivity(activity.id, selected);
      setFeedback(result);
      window.dispatchEvent(new CustomEvent<AttemptResult>("lifehub:attempt", { detail: result }));
    } catch (error) {
      setFeedback({ correct: false, xp_awarded: 0, correct_answer: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  function next() {
    setSelected("");
    setFeedback(null);
    setIndex((value) => value + 1);
  }

  if (!activity) {
    return <div className="feedback info">This learning path is not published yet.</div>;
  }

  const questionNumber = (index % quizActivities.length) + 1;

  return (
    <div className="learning-module">
      <div className="learning-module-head">
        <div>
          <p className="eyebrow">{sectionLabel}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className="activity-count">{questionNumber}/{quizActivities.length}</span>
      </div>

      {passage && (
        <section className="reading-passage" aria-label="Reading passage">
          <div className="reading-passage-label">PASSAGE</div>
          <p>{passage}</p>
        </section>
      )}

      <div className="quiz-prompt">{activity.prompt}</div>

      <div className="option-grid" role="radiogroup" aria-label="Answer choices">
        {options.map((option) => {
          const chosen = selected === option;
          const correct = feedback?.correct && option === feedback.correct_answer;
          const wrong = feedback && !feedback.correct && chosen;
          return (
            <button
              key={option}
              type="button"
              className={"quiz-option" + (chosen ? " selected" : "") + (correct ? " correct" : "") + (wrong ? " wrong" : "")}
              onClick={() => !feedback && !busy && setSelected(option)}
              disabled={!!feedback || busy || !signedIn}
              role="radio"
              aria-checked={chosen}
            >
              <span className="quiz-option-marker">{correct ? <Check size={16} /> : wrong ? <CircleAlert size={16} /> : ""}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      <div className="learning-actions">
        {!feedback ? (
          <button className="primary-btn" type="button" onClick={() => void submit()} disabled={!signedIn || !selected || busy}>
            {busy ? "Checking…" : "Check answer"}
          </button>
        ) : (
          <button className="primary-btn" type="button" onClick={next}>
            Next question <ChevronRight size={18} />
          </button>
        )}
        {feedback && !feedback.correct && (
          <button className="secondary-btn" type="button" onClick={() => { setSelected(""); setFeedback(null); }}>
            <RotateCcw size={17} /> Try again
          </button>
        )}
      </div>

      {feedback && (
        <div className={"feedback " + (feedback.correct ? "correct" : "incorrect")} role="status">
          <strong>{feedback.correct ? `Correct! +${feedback.xp_awarded} XP` : "Keep going."}</strong>
          {!feedback.correct && feedback.correct_answer && <div className="feedback-detail">Answer: {feedback.correct_answer}</div>}
          {feedback.mastery !== undefined && <div className="feedback-detail">Lesson mastery: {Math.round(feedback.mastery)}%</div>}
        </div>
      )}

      {!signedIn && <div className="feedback info">Sign in to save attempts, earn XP, and unlock adaptive review.</div>}
    </div>
  );
}