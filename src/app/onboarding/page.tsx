import { AppShell } from "@/components/AppShell";
import { OnboardingForm } from "@/features/onboarding/OnboardingForm";

export default function OnboardingPage() {
  return <AppShell navigation={false}><div className="page-head"><div><div className="eyebrow">Your property</div><h1>Tell us where home is.</h1></div></div><div style={{maxWidth:680}}><OnboardingForm /></div></AppShell>;
}
