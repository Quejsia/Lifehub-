import Link from "next/link";
import { Award, BookOpen, Calculator, ChevronRight, Code2, FlaskConical, Lightbulb, PenLine, Sparkles, Target } from "lucide-react";
import { getLearningData } from "@/lib/learning";
import { SiteHeader } from "@/components/site-header";
import { SpellingPractice } from "@/components/spelling-practice";
import { ProgressPanel } from "@/components/progress-panel";

const topics = [
  { title: "Spelling", subtitle: "Spelling Foundations", courseSlug: "spelling-foundations", href: "/practice", icon: PenLine, live: true },
  { title: "Vocabulary", subtitle: "Everyday word challenges", courseSlug: "vocabulary-basics", href: "/learn/vocabulary-basics", icon: Lightbulb, live: true },
  { title: "Reading", subtitle: "Short comprehension checks", courseSlug: "reading-foundations", href: "/learn/reading-foundations", icon: BookOpen, live: true },
  { title: "Flashcards", subtitle: "Adaptive recall deck", courseSlug: "flashcard-foundations", href: "/learn/flashcard-foundations", icon: Sparkles, live: true },
  { title: "Mathematics", subtitle: "Arithmetic and problem solving", courseSlug: "mathematics-foundations", href: "/learn/mathematics-foundations", icon: Calculator, live: true },
  { title: "Science", subtitle: "Biology and science foundations", courseSlug: "science-foundations", href: "/learn/science-foundations", icon: FlaskConical, live: true },
  { title: "Programming", subtitle: "Web and programming foundations", courseSlug: "programming-foundations", href: "/learn/programming-foundations", icon: Code2, live: true },
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
  const masteryByCourse = new Map(
    data.courses.map((course) => {
      const lessonIds = data.lessons.filter((lesson) => lesson.course_id === course.id).map((lesson) => lesson.id);
      const values = data.lessonProgress
        .filter((item) => lessonIds.includes(item.lesson_id))
        .map((item) => Number(item.mastery));
      return [course.slug, values.length ? pct(values.reduce((sum, value) => sum + value, 0) / values.length) : 0];
    }),
  );

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
            <SpellingPractice activities={data.activities} reviewStates={data.reviewStates} signedIn={!!data.profile} />
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
            <Link href="/education" className="nav-link">Education Hub</Link>
          </div>
          <div className="topic-grid">
            {topics.map((topic) => {
              const Icon = topic.icon;
              const isSpelling = topic.title === "Spelling";
              const cardClass = `card topic-card ${topic.live ? "live-topic" : "future"}`;

              if (topic.href) {
                return (
                  <Link
                    href={topic.href}
                    className={cardClass}
                    key={topic.title}
                    aria-label={`Open ${topic.title}`}
                  >
                    <div className="topic-icon"><Icon size={20} /></div>
                    <div className="topic-card-heading">
                      <h3>{topic.title}</h3>
                      <ChevronRight size={18} aria-hidden="true" />
                    </div>
                    <p>{topic.courseSlug ? `${masteryByCourse.get(topic.courseSlug) ?? 0}% mastery` : topic.subtitle}</p>
                    {topic.courseSlug && (
                      <div className="topic-progress-track" aria-hidden="true">
                        <div className="topic-progress-fill" style={{ width: `${masteryByCourse.get(topic.courseSlug) ?? 0}%` }} />
                      </div>
                    )}
                    <span className="topic-open">{isSpelling ? "Open practice" : topic.live ? "Start path" : "Explore roadmap"}</span>
                  </Link>
                );
              }

              return (
                <article className={cardClass} key={topic.title}>
                  <div className="topic-icon"><Icon size={20} /></div>
                  <h3>{topic.title}</h3>
                  <p>{topic.subtitle}</p>
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