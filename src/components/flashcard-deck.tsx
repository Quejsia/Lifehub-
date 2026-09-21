"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { reviewFlashcard } from "@/actions/learning";
import type { Activity, AttemptResult } from "@/lib/types";
import type { ActivityReviewState } from "@/lib/types";

export function FlashcardDeck({
  activities,
  reviewStates,
  signedIn,
}: {
  activities: Activity[];
  reviewStates: ActivityReviewState[];
  signedIn: boolean;
}) {
  const cards = useMemo(() => {
    const reviewByActivity = new Map(reviewStates.map((state) => [state.activity_id, state]));
    const now = Date.now();
    return activities
      .filter((item) => item.type === "flashcard")
      .sort((a, b) => {
        const aState = reviewByActivity.get(a.id);
        const bState = reviewByActivity.get(b.id);
        const aDue = !aState || new Date(aState.due_at).getTime() <= now;
        const bDue = !bState || new Date(bState.due_at).getTime() <= now;
        if (aDue !== bDue) return aDue ? -1 : 1;
        const aDueAt = aState ? new Date(aState.due_at).getTime() : 0;
        const bDueAt = bState ? new Date(bState.due_at).getTime() : 0;
        if (aDueAt !== bDueAt) return aDueAt - bDueAt;
        return a.sort_order - b.sort_order;
      });
  }, [activities, reviewStates]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [feedback, setFeedback] = useState<AttemptResult | null>(null);
  const [busy, setBusy] = useState(false);
  const card = cards[index % Math.max(cards.length, 1)];
  const state = reviewStates.find((item) => item.activity_id === card?.id);
  const due = !state || new Date(state.due_at).getTime() <= Date.now();
  const word = card?.prompt.replace(/^Word:\s*/i, "").trim() ?? "";

  useEffect(() => {
    setFlipped(false);
    setFeedback(null);
  }, [card?.id]);

  function speak() {
    if (!card?.answer || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const word = card.prompt.replace(/^Word:\s*/i, "").trim();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(word || card.answer));
  }

  async function grade(knewIt: boolean) {
    if (!signedIn || !card || busy || feedback || !flipped) return;
    setBusy(true);
    try {
      const result = await reviewFlashcard(card.id, knewIt);
      setFeedback(result);
      window.dispatchEvent(new CustomEvent<AttemptResult>("lifehub:attempt", { detail: result }));
    } catch (error) {
      setFeedback({ correct: false, xp_awarded: 0, correct_answer: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  function next() {
    setIndex((value) => value + 1);
  }

  if (!card) return <div className="feedback info">No flashcards are published yet.</div>;

  return (
    <div className="flashcard-module">
      <div className="learning-module-head">
        <div>
          <p className="eyebrow">FLASHCARDS</p>
          <h1>Quick recall, spaced over time.</h1>
          <p>Reveal each card, rate your recall, and LifeHub schedules when to review it again.</p>
        </div>
        <span className={"review-status " + (due ? "due" : "scheduled")}>{due ? "Due now" : "Scheduled"}</span>
      </div>

      <div className={"flashcard " + (flipped ? "flipped" : "")} role="button" tabIndex={0} onClick={() => !feedback && setFlipped((value) => !value)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (!feedback) setFlipped((value) => !value); } }} aria-label={flipped ? "Flashcard answer" : "Flashcard question"}>
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-label">WORD</span>
            <div className="flashcard-word">{word || card.prompt}</div>
            <span className="flashcard-hint">Tap to reveal</span>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="flashcard-label">ANSWER</span>
            <div className="flashcard-word">{card.answer}</div>
            {card.definition && <p>{card.definition}</p>}
            {card.explanation && <small>{card.explanation}</small>}
          </div>
        </div>
      </div>

      <div className="flashcard-tools">
        <button className="secondary-btn" type="button" onClick={speak} disabled={!signedIn}>
          <Volume2 size={18} /> Hear answer
        </button>
        <span className="flashcard-count">{(index % cards.length) + 1} / {cards.length}</span>
      </div>

      {flipped && !feedback && signedIn && (
        <div className="grade-actions">
          <button className="secondary-btn review-again" type="button" onClick={() => void grade(false)} disabled={busy}>
            <RotateCcw size={18} /> Need review
          </button>
          <button className="primary-btn" type="button" onClick={() => void grade(true)} disabled={busy}>
            <Check size={18} /> I knew it
          </button>
        </div>
      )}

      {feedback && (
        <div className="feedback correct" role="status">
          <div className="feedback-main"><Sparkles size={18} /><span>{feedback.xp_awarded} XP earned</span></div>
          <div className="feedback-detail">{feedback.review_due_days !== undefined ? `Next review in ${feedback.review_due_days} day${feedback.review_due_days === 1 ? "" : "s"}.` : "Review saved."}</div>
          <button className="primary-btn flashcard-next" type="button" onClick={next}>Next card</button>
        </div>
      )}

      {state && <p className="review-meta">Recall streak: {state.correct_streak} · Review interval: {state.interval_days || 0} day{state.interval_days === 1 ? "" : "s"}</p>}
      {!signedIn && <div className="feedback info">Sign in to save flashcard reviews and build your adaptive review schedule.</div>}
    </div>
  );
}