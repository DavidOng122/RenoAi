import Image from "next/image";
import { auth } from "@/auth";
import { MobileBottomNav, MobileHeader } from "@/components/MobileShell";
import { RepairComposer } from "@/features/repair-input/RepairComposer";

export default async function HomePage() {
  const session = await auth();
  return (
    <main className="brief-shell home-shell">
      <div className="home-logo">
        <Image src="/brand/renoai-mark.png" alt="" width={32} height={32} priority />
        <span>RenoAI</span>
      </div>
      <MobileHeader user={session?.user} />
      <section className="home-hero">
        <h1>What needs fixing?</h1>
        <p>Add a photo and tell us<br />what happened</p>
      </section>
      <RepairComposer />
      <MobileBottomNav />
    </main>
  );
}
