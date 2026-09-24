import Link from "next/link";
import { ArrowLeft, BookOpen, Calculator, FlaskConical, Layers3, Lightbulb, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ActivityQuiz } from "@/components/activity-quiz";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { getPhase2Course } from "@/lib/phase2";

const configs = {
  vocabulary: { slug: "vocabulary-basics", title: "Vocabulary Basics", kind: "vocabulary" as const, icon: Layers3 },
  reading: { slug: "reading-foundations", title: "Reading Foundations", kind: "reading" as const, icon: BookOpen },
  flashcards: { slug: "flashcard-foundations", title: "Flashcard Foundations", kind: "flashcards" as const, icon: Sparkles },
  mathematics: { slug: "mathematics-foundations", title: "Mathematics Foundations", kind: "mathematics" as const, icon: Calculator },
  science: { slug: "science-foundations", title: "Science Foundations", kind: "science" as const, icon: FlaskConical },
};

export default async function LearningPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = Object.values(configs).find((item) => item.slug === slug);
  if (!config) notFound();

  const data = await getPhase2Course(config.slug);
  if (!data) notFound();

  const Icon = config.icon;
  const mastery = Math.max(0, Math.min(100, Math.round(Number(data.progress?.mastery ?? 0))));

  return (
    <div className="app-shell">
      <SiteHeader profile={data.profile} />
      <main id="main-content" className="page-wrap learning-page">
        <div className="learning-breadcrumb">
          <Link href="/" className="back-link"><ArrowLeft size={16} /> Back to Learn</Link>
          <span>/</span>
          <span>{data.course.title}</span>
        </div>

        <section className="learning-path-banner">
          <div className="learning-path-icon"><Icon size={24} /></div>
          <div className="learning-path-copy">
            <p className="eyebrow">LEARNING PATH</p>
            <h1>{data.course.title}</h1>
            <p>{data.course.description}</p>
            <div className="path-mastery" aria-label={"Mastery " + mastery + "%"}>
              <div className="path-mastery-caption"><span>Mastery</span><strong>{mastery}%</strong></div>
              <div className="path-mastery-track"><div className="path-mastery-fill" style={{ width: mastery + "%" }} /></div>
            </div>
          </div>
        </section>

        {config.kind === "flashcards" ? (
          <FlashcardDeck activities={data.activities} reviewStates={data.reviewStates} signedIn={!!data.profile} />
        ) : (
          <ActivityQuiz
            activities={data.activities}
            signedIn={!!data.profile}
            kind={config.kind}
            title={data.lesson.title}
            description={data.lesson.description ?? ""}
          />
        )}

        <section className="learning-tip card">
          <div className="learning-tip-icon"><Lightbulb size={18} /></div>
          <div>
            <strong>Study tip</strong>
            <p>Short, focused sessions are easier to repeat. Finish one round, review anything you missed, then come back later for a fresh recall.</p>
          </div>
        </section>
      </main>
    </div>
  );
}