import { getLearningData } from "@/lib/learning";
import { SiteHeader } from "@/components/site-header";
import { SpellingPractice } from "@/components/spelling-practice";

export default async function PracticePage() {
  const data = await getLearningData();
  return (
    <div className="app-shell">
      <SiteHeader profile={data.profile} />
      <main id="main-content" className="page-wrap">
        <section className="hero">
          <p className="eyebrow">PRACTICE</p>
          <h1>Build the habit one word at a time.</h1>
          <p>Complete a short spelling round and save your progress to LifeHub.</p>
        </section>
        <article className="card practice-card" style={{ maxWidth: 980 }}>
          <SpellingPractice activities={data.activities} reviewStates={data.reviewStates} signedIn={!!data.profile} />
        </article>
      </main>
    </div>
  );
}