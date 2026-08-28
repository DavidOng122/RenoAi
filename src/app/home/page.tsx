import { AppShell } from "@/components/AppShell";
import { RepairComposer } from "@/features/repair-input/RepairComposer";

export default function HomePage() {
  return <AppShell>
    <section className="hero"><div><div className="eyebrow">Home repair, made clear</div><h1>What needs fixing?</h1></div><p className="hero-copy">Show us the issue and describe what you notice. We’ll turn it into a clear, contractor-ready brief with a grounded price range.</p></section>
    <RepairComposer />
    <section className="feature-strip" aria-label="How it works"><div className="feature"><span className="feature-number">01</span><strong>Describe it in your own words</strong></div><div className="feature"><span className="feature-number">02</span><strong>Review what the AI understood</strong></div><div className="feature"><span className="feature-number">03</span><strong>Get a repair plan and fair range</strong></div></section>
  </AppShell>;
}
