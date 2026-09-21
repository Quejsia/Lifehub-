"use client";

import { Award, CheckCircle2, Flame, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Achievement, AttemptResult } from "@/lib/types";

type ProgressPanelProps = {
  initialLevel: number;
  initialXp: number;
  initialStreak: number;
  initialAttempts: number;
  initialCorrect: number;
  initialMastery: number;
  achievements: Achievement[];
  earnedAchievementIds: string[];
};

export function ProgressPanel({
  initialLevel,
  initialXp,
  initialStreak,
  initialAttempts,
  initialCorrect,
  initialMastery,
  achievements,
  earnedAchievementIds,
}: ProgressPanelProps) {
  const [level, setLevel] = useState(initialLevel);
  const [xp, setXp] = useState(initialXp);
  const [streak, setStreak] = useState(initialStreak);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [correct, setCorrect] = useState(initialCorrect);
  const [mastery, setMastery] = useState(initialMastery);
  const [earnedIds, setEarnedIds] = useState(() => new Set(earnedAchievementIds));
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const onAttempt = (event: Event) => {
      const result = (event as CustomEvent<AttemptResult>).detail;
      if (!result) return;

      setAttempts(result.attempt_count ?? (value => value + 1));
      setCorrect(result.correct_count ?? (value => value + (result.correct ? 1 : 0)));
      setXp(value => value + (result.xp_awarded ?? 0));
      if (result.streak !== undefined) setStreak(result.streak);
      if (result.mastery !== undefined) setMastery(Math.round(result.mastery));

      if (result.xp_awarded) {
        setLevel(value => Math.max(value, Math.floor((xp + result.xp_awarded) / 500) + 1));
        setPulse(true);
        window.setTimeout(() => setPulse(false), 420);
      }
      if (result.new_achievements?.length) {
        setEarnedIds(current => {
          const next = new Set(current);
          result.new_achievements?.forEach((achievement) => next.add(achievement.id));
          return next;
        });
      }
    };

    window.addEventListener("lifehub:attempt", onAttempt);
    return () => window.removeEventListener("lifehub:attempt", onAttempt);
  }, [xp]);

  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  const levelProgress = ((xp % 500) / 500) * 100;
  const earned = useMemo(() => earnedIds, [earnedIds]);

  return (
    <aside className="card progress-card" aria-labelledby="progress-title">
      <h2 id="progress-title" className="progress-title">YOUR PROGRESS</h2>

      <div className="stat-grid">
        <div className={"stat stat-xp" + (pulse ? " stat-pulse" : "")}><div className="stat-value">Level {level}</div><div className="stat-label">{xp} total XP</div></div>
        <div className="stat"><div className="stat-value">{streak}</div><div className="stat-label">day streak</div></div>
        <div className="stat"><div className="stat-value">{accuracy}%</div><div className="stat-label">accuracy</div></div>
        <div className="stat"><div className="stat-value">{attempts}</div><div className="stat-label">attempts saved</div></div>
      </div>

      <div className="progress-caption"><span>Level progress</span><span>{Math.round(levelProgress)}%</span></div>
      <div className="progress-track" aria-label="Level progress">
        <div className="progress-fill" style={{ width: `${levelProgress}%` }} />
      </div>

      <div className="progress-caption"><span>Spelling mastery</span><span>{mastery}%</span></div>
      <div className="progress-track" aria-label="Spelling mastery">
        <div className="progress-fill" style={{ width: `${mastery}%` }} />
      </div>

      <ul className="achievement-list" aria-label="Achievements">
        {achievements.map(achievement => {
          const isEarned = earned.has(achievement.id);
          return (
            <li key={achievement.id} className="achievement-row">
              {isEarned ? <CheckCircle2 size={16} style={{ color: "var(--accent)" }} /> : <Award size={16} style={{ color: "var(--border)" }} />}
              <span style={{ fontWeight: isEarned ? 700 : 500 }}>{achievement.name}</span>
            </li>
          );
        })}
      </ul>

      <div className="progress-footer">
        <span><Flame size={15} /> Keep your streak alive.</span>
        <span><Target size={15} /> Small steps count.</span>
      </div>
    </aside>
  );
}