import Link from "next/link";
import { Award, BookOpen, Calculator, Code2, FlaskConical, Lightbulb, PenLine, Target } from "lucide-react";
import { getLearningData } from "@/lib/learning";
import { SiteHeader } from "@/components/site-header";
import { SpellingPractice } from "@/components/spelling-practice";
import { ProgressPanel } from "@/components/progress-panel";

const topics = [
  { title: "Spelling", subtitle: "Spelling Foundations", icon: PenLine, live: true },
  { title: "Vocabulary", subtitle: "Planned learning path", icon: Lightbulb, live: false },
  { title: "Reading", subtitle: "Planned learning path", icon: BookOpen, live: false },
  { title: "Mathematics", subtitle: "Planned learning path", icon: Calculator, live: false },
  { title: "Science", subtitle: "Planned learning path", icon: FlaskConical, live: false },
  { title: "Programming", subtitle: "Planned learning path", icon: Code2, live: false },
];

function pct(value: number, fallback = 0) {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : fallback;
}

export async function LifeHubHome() {
  const data = await getLearningData();
  const spellingCourse = data.courses.find((course) => course.subject.toLowerCase() === "english") ?? data.courses[0];
  const spellingLessons = data.lessons.filter((lesson) => lesson.course_id === spellingCourse?.id);
  const currentLesson = spellingLessons[0];
  const currentLessonProgress = data.lessonProgress.find((item) => item.lesson_id === currentLesson?.id);
  const correct = data.attempts.filter((attempt) => attempt.is_correct).length;
  const accuracy = data.attempts.length ? pct((correct / data.attempts.length) * 100) : 0;
  const mastery = pct(Number(currentLessonProgress?.mastery ?? 0));
  const level = data.profile?.level ?? 1;
  const xp = data.profile?.xp ?? 0;
  const levelProgress = ((xp % 500) / 500) * 100;

  return (
    <div className="app-shell">
      <SiteHeader profile={data.profile} />
      <main id="main-content" className="page-wrap">
        <section className="hero" aria-labelledby="page-title">
          <p className="eyebrow">TODAY&apos;S FOCUS</p>
          <h1 id="page-title">A little practice goes a long way.</h1>
          <p>{spellingCourse?.title ?? "Spelling Foundations"} keeps today&apos;s practice focused and measurable.</p>
        </section>

        <section className="dashboard-grid" aria-label="Learning dashboard">
          <article className="card practice-card">
            <SpellingPractice activities={data.activities} signedIn={!!data.profile} />
          </article>

          <ProgressPanel
            initialLevel={level}
            initialXp={xp}
            initialStreak={data.profile?.current_streak ?? 0}
            initialAttempts={data.attempts.length}
            initialCorrect={correct}
            initialMastery={mastery}
            achievements={data.achievements}
            earnedAchievementIds={data.userAchievements.map((entry) => entry.achievement_id)}
          />
        </section>

        <section className="section" aria-labelledby="paths-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow" style={{ marginBottom: 5 }}>LEARNING PATHS</p>
              <h2 id="paths-title">Choose what to work on next.</h2>
            </div>
            <Link href="/practice" className="nav-link">Open practice</Link>
          </div>
          <div className="topic-grid">
            {topics.map((topic) => {
              const Icon = topic.icon;
              const isSpelling = topic.title === "Spelling";
              return (
                <article className={`card topic-card ${topic.live ? "" : "future"}`} key={topic.title}>
                  <div className="topic-icon"><Icon size={20} /></div>
                  <h3>{topic.title}</h3>
                  <p>{isSpelling ? `${mastery}% mastery` : topic.subtitle}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section" aria-label="Learning metrics">
          <div className="card section-metrics">
            <div><Target size={20} className="metric-icon" /><div className="metric-value">{data.lessonProgress.length}</div><div className="metric-label">Lessons with progress</div></div>
            <div><BookOpen size={20} className="metric-icon" /><div className="metric-value">{data.courses.length}</div><div className="metric-label">Published course{data.courses.length === 1 ? "" : "s"}</div></div>
            <div><Award size={20} style={{ color: "var(--accent)" }} /><div className="metric-value">{data.userAchievements.length}</div><div className="metric-label">Achievements earned</div></div>
          </div>
        </section>
      </main>
    </div>
  );
}