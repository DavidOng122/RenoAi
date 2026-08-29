import { auth } from "@/auth";
import { AccountAvatar, MobileBottomNav } from "@/components/MobileShell";
import { RequestList } from "@/features/requests/RequestList";

export default async function RequestsPage() {
  const session = await auth();
  return (
    <main className="brief-shell requests-shell">
      <header className="requests-heading">
        <div>
          <h1>Request</h1>
          <p>Your saved repair brief</p>
        </div>
        <AccountAvatar className="requests-avatar" user={session?.user} />
      </header>
      <RequestList />
      <MobileBottomNav />
    </main>
  );
}
