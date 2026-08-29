import Link from "next/link";
import { ChevronLeft, LogOut, Mail, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { signOutAction } from "@/app/actions/auth";
import { AccountAvatar } from "@/components/MobileShell";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="settings-page">
      <header className="settings-header">
        <Link href="/home" aria-label="Back to home"><ChevronLeft size={23} /></Link>
        <h1>Settings</h1>
        <span aria-hidden />
      </header>

      <section className="settings-profile">
        <AccountAvatar className="settings-avatar" user={user} href={null} />
        <h2>{user?.name || "RenoAI account"}</h2>
        <p>{user?.email || "Signed in with Google"}</p>
      </section>

      <section className="settings-section" aria-labelledby="account-heading">
        <h3 id="account-heading">Account</h3>
        <div className="settings-account-card">
          <div className="settings-account-icon"><Mail size={18} /></div>
          <div><strong>Google account</strong><span>{user?.email || "Connected"}</span></div>
          <ShieldCheck className="settings-account-check" size={19} aria-label="Connected" />
        </div>
      </section>

      <form className="settings-logout-form" action={signOutAction}>
        <button className="settings-logout" type="submit"><LogOut size={18} /> Log out</button>
        <p>You’ll need to sign in with Google again to access your requests.</p>
      </form>
    </main>
  );
}
