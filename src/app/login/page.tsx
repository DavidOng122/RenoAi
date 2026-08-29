import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

function safeCallbackUrl(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/onboarding";
  }
  return value;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const session = await auth();
  if (session?.user) redirect("/home");

  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const hasError = typeof params.error === "string";
  const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <main className="login-page" data-node-id="95:117">
      <div className="login-content google-only">
        <div className="login-brand" data-node-id="95:137">
          <Image
            className="login-brand-mark"
            src="/brand/renoai-mark.png"
            alt="RenoaAI"
            width={56}
            height={56}
            priority
          />
          <h1>RenoaAI</h1>
        </div>

        <div className="social-login-list" aria-label="Sign in options">
          {hasError && <p className="login-error">Google sign-in failed. Please try again.</p>}
          {!googleConfigured && <p className="login-error">Add your Google OAuth credentials to enable sign-in.</p>}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl });
            }}
          >
            <button className="social-login-button google" type="submit" disabled={!googleConfigured}>
              <span className="social-login-icon">
                <Image src="/brand/google.svg" alt="" width={20} height={20} />
              </span>
              <span>Sign in with Google</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
