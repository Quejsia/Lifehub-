import Link from "next/link";
import {
  Brain,
  Calculator,
  ChevronRight,
  Code2,
  FlaskConical,
  Languages,
  Library,
  Monitor,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getLearningData } from "@/lib/learning";

const subjects = [
  {
    id: "mathematics",
    title: "Mathematics",
    description: "Build confidence with numbers, fractions, percentages, algebra, geometry, and problem solving.",
    next: "Arithmetic → Fractions → Algebra",
    icon: Calculator,
    status: "Available",
    href: "/learn/mathematics-foundations",
  },
  {
    id: "science",
    title: "Science",
    description: "Explore biology, chemistry, physics, and Earth and environmental science through focused lessons.",
    next: "Biology → Chemistry → Physics",
    icon: FlaskConical,
    status: "Available",
    href: "/learn/science-foundations",
  },
  {
    id: "programming",
    title: "Programming",
    description: "Grow practical coding skills from web fundamentals to C/C++, C#, and ASP.NET.",
    next: "HTML → CSS → JavaScript",
    icon: Code2,
    status: "Next",
    href: null,
  },
  {
    id: "english",
    title: "English",
    description: "Strengthen spelling, vocabulary, reading, grammar, and communication foundations.",
    next: "Spelling → Vocabulary → Reading",
    icon: Languages,
    status: "Available",
    href: "/practice",
  },
  {
    id: "filipino",
    title: "Filipino",
    description: "A dedicated path for Filipino language, reading, grammar, writing, and comprehension.",
    next: "Wika → Pagbasa → Pagsulat",
    icon: Library,
    status: "Coming next",
    href: null,
  },
  {
    id: "digital-literacy",
    title: "Digital Literacy",
    description: "Learn practical skills for internet safety, cybersecurity, research, files, and everyday productivity.",
    next: "Internet safety → Research → Security",
    icon: Monitor,
    status: "Coming next",
    href: null,
  },
  {
    id: "study-skills",
    title: "Study Skills",
    description: "Build better routines with note-taking, time management, memory, and exam preparation.",
    next: "Notes → Focus → Review",
    icon: Brain,
    status: "Coming next",
    href: null,
  },
];

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default async function EducationPage() {
  const data = await getLearningData();

  const englishCourses = data.courses.filter(
    (course) => course.subject?.toLowerCase() === "english",
  );

  const englishLessonIds = data.lessons
    .filter((lesson) => englishCourses.some((course) => course.id === lesson.course_id))
    .map((lesson) => lesson.id);

  const englishProgress = data.lessonProgress.filter((item) =>
    englishLessonIds.includes(item.lesson_id),
  );

  const englishMastery = englishProgress.length
    ? clampPercent(
        englishProgress.reduce((sum, item) => sum + Number(item.mastery ?? 0), 0) /
          englishProgress.length,
      )
    : 0;

  const mathematicsCourse = data.courses.find((course) => course.slug === "mathematics-foundations");
  const mathematicsLessonIds = data.lessons
    .filter((lesson) => lesson.course_id === mathematicsCourse?.id)
    .map((lesson) => lesson.id);

  const mathematicsProgress = data.lessonProgress.filter((item) =>
    mathematicsLessonIds.includes(item.lesson_id),
  );

  const mathematicsMastery = mathematicsProgress.length
    ? clampPercent(
        mathematicsProgress.reduce((sum, item) => sum + Number(item.mastery ?? 0), 0) /
          mathematicsProgress.length,
      )
    : 0;

  const scienceCourse = data.courses.find((course) => course.slug === "science-foundations");
  const scienceLessonIds = data.lessons
    .filter((lesson) => lesson.course_id === scienceCourse?.id)
    .map((lesson) => lesson.id);

  const scienceProgress = data.lessonProgress.filter((item) =>
    scienceLessonIds.includes(item.lesson_id),
  );

  const scienceMastery = scienceProgress.length
    ? clampPercent(
        scienceProgress.reduce((sum, item) => sum + Number(item.mastery ?? 0), 0) /
          scienceProgress.length,
      )
    : 0;

  const livePathCount = data.courses.length;

  return (
    <div className="app-shell">
      <SiteHeader profile={data.profile} />

      <main id="main-content" className="page-wrap">
        <section className="hero" aria-labelledby="education-title">
          <p className="eyebrow">EDUCATION HUB</p>
          <h1 id="education-title">One place for every subject.</h1>
          <p>
            Explore LifeHub&apos;s growing library of learning paths. Start with a live
            foundation or see what&apos;s coming next.
          </p>
        </section>

        <section className="section" aria-labelledby="overview-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow" style={{ marginBottom: 5 }}>YOUR LEARNING MAP</p>
              <h2 id="overview-title">Choose a subject to begin.</h2>
            </div>
            <span className="nav-link" aria-label={`${livePathCount} learning paths available`}>
              {livePathCount} live path{livePathCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="topic-grid">
            {subjects.map((subject) => {
              const Icon = subject.icon;
              const isEnglish = subject.id === "english";
              const isMathematics = subject.id === "mathematics";
              const isScience = subject.id === "science";
              const live = isEnglish || isMathematics || isScience;
              const cardClass = `card topic-card ${live ? "live-topic" : "future"}`;

              const cardContent = (
                <>
                  <div className="topic-icon">
                    <Icon size={20} />
                  </div>

                  <div className="topic-card-heading">
                    <h3>{subject.title}</h3>
                    {live && <ChevronRight size={18} aria-hidden="true" />}
                  </div>

                  <p>{subject.description}</p>

                  {(isEnglish || isMathematics || isScience) && (
                    <>
                      <div className="topic-progress-track" aria-hidden="true">
                        <div
                          className="topic-progress-fill"
                          style={{
                            width: `${isScience ? scienceMastery : isMathematics ? mathematicsMastery : englishMastery}%`,
                          }}
                        />
                      </div>
                      <p className="topic-card-meta">
                        {isScience
                          ? `${scienceMastery}% mastery · Biology Basics live`
                          : isMathematics
                            ? `${mathematicsMastery}% mastery · Arithmetic Basics live`
                            : `${englishMastery}% mastery · Foundations live`}
                      </p>
                    </>
                  )}

                  {!live && (
                    <p className="topic-card-meta">{subject.status}</p>
                  )}

                  <span className="topic-open">
                    {isEnglish
                      ? "Continue learning"
                      : isMathematics || isScience
                        ? "Start learning"
                        : "Coming soon"}
                  </span>
                </>
              );

              return subject.href ? (
                <Link
                  href={subject.href}
                  className={cardClass}
                  key={subject.id}
                  aria-label={`Open ${subject.title}`}
                >
                  {cardContent}
                </Link>
              ) : (
                <article className={cardClass} key={subject.id}>
                  {cardContent}
                </article>
              );
            })}
          </div>
        </section>

        <section className="section" aria-labelledby="next-title">
          <div className="card learning-module">
            <div className="learning-module-head">
              <div>
                <p className="eyebrow">WHAT&apos;S NEXT</p>
                <h2 id="next-title">Science Foundations is live.</h2>
                <p>
                  Start with Biology Basics, then expand into chemistry, physics, and Earth
                  science as the Science path grows. Your answers use the same attempts,
                  mastery, XP, streak, achievement, and adaptive-review systems already
                  powering LifeHub.
                </p>
              </div>
              <div className="learning-path-icon" aria-hidden="true">
                <Calculator size={24} />
              </div>
            </div>

            <div className="learning-tip card" style={{ marginTop: 0 }}>
              <div className="learning-tip-icon">
                <Library size={18} />
              </div>
              <div>
                <strong>Phase 3 foundation is live</strong>
                <p>
                  Science is now the second new subject connected to the existing
                  Phase 2 learning engine, so you can practice and earn progress without
                  a separate system.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="path-details-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow" style={{ marginBottom: 5 }}>SUBJECT ROADMAPS</p>
              <h2 id="path-details-title">What each path will cover.</h2>
            </div>
          </div>

          <div className="topic-grid">
            {subjects.slice(0, 4).map((subject) => {
              const Icon = subject.icon;
              return (
                <article className="card topic-card" key={subject.id + "-details"}>
                  <div className="topic-icon"><Icon size={20} /></div>
                  <h3>{subject.title}</h3>
                  <p>{subject.next}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
