import { OnboardingForm } from "@/features/onboarding/OnboardingForm";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { mode } = await searchParams;
  return <OnboardingForm isAddingProperty={mode === "new"} />;
}
