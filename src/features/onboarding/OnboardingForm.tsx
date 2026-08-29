"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { localStore } from "@/lib/local-store";
import { newId } from "@/lib/utils";
import type { Property } from "@/schemas/property.schema";

const homeTypes: Array<{
  label: Property["home_type"];
  icon: string;
  width: number;
  height: number;
}> = [
  { label: "HDB", icon: "/onboarding/hdb.svg", width: 32, height: 31 },
  { label: "Condo", icon: "/onboarding/condo.svg", width: 33, height: 32 },
  { label: "Landed", icon: "/onboarding/landed.svg", width: 34, height: 28 },
  { label: "Other", icon: "/onboarding/other.svg", width: 37, height: 29 },
];

function Stepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="onboarding-stepper" aria-label={`Step ${step} of 2`}>
      {step === 2 ? (
        <Image className="onboarding-step-complete" src="/onboarding/step-complete.svg" alt="" width={28} height={28} />
      ) : (
        <span className="active">1</span>
      )}
      <i />
      <span className={step >= 2 ? "active" : ""}>2</span>
    </div>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [existing, setExisting] = useState<Property>();
  const [step, setStep] = useState<1 | 2>(1);
  const [homeType, setHomeType] = useState<Property["home_type"]>("HDB");
  const [area, setArea] = useState("");

  useEffect(() => {
    const property = localStore.properties()[0];
    if (!property) return;
    setExisting(property);
    setHomeType(property.home_type);
    setArea(property.address.address_line);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    localStore.saveProperty({
      id: existing?.id || newId("property"),
      user_id: "user_local",
      name: existing?.name || "My Home",
      home_type: homeType,
      address: {
        postal_code: existing?.address.postal_code || "",
        address_line: area.trim(),
        ...(existing?.address.unit_number ? { unit_number: existing.address.unit_number } : {}),
      },
      created_at: existing?.created_at || new Date().toISOString(),
    });
    router.push("/home");
  }

  if (step === 2) {
    return (
      <main className="onboarding-page" data-node-id="107:1265">
        <form className="onboarding-details" onSubmit={submit} data-node-id="107:1266">
          <Stepper step={2} />
          <div className="onboarding-area">
            <div className="onboarding-area-content">
              <h1>Which area is<br />your home in?</h1>
              <div className="onboarding-area-field">
                <label>
                  <Image src="/onboarding/location.svg" alt="" width={18} height={20} />
                  <input
                    aria-label="Home area"
                    placeholder="Enter your area, e.g. Tampines"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    required
                  />
                </label>
                <p>You can enter any location in Singapore.</p>
              </div>
            </div>
            <button className="onboarding-continue" type="submit">Get Started</button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="onboarding-page" data-node-id="107:1221">
      <div className="onboarding-flow" data-node-id="107:1222">
        <Stepper step={1} />

        <section className="onboarding-question">
          <div className="onboarding-intro">
            <h1>What type of home is this？</h1>
            <p>This helps us tailor the best<br />solutions for you.</p>
          </div>

          <div className="home-type-list" role="radiogroup" aria-label="Home type">
            {homeTypes.map((item) => {
              const selected = item.label === homeType;
              return (
                <button
                  className={`home-type-option${selected ? " selected" : ""}`}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setHomeType(item.label)}
                  key={item.label}
                >
                  <span className="home-type-copy">
                    <span className="home-type-icon">
                      <Image src={item.icon} alt="" width={item.width} height={item.height} />
                    </span>
                    <span>{item.label}</span>
                  </span>
                  <span className={`home-type-radio${selected ? " selected" : ""}`}>
                    {selected && <Image src="/onboarding/check.svg" alt="" width={12} height={9} />}
                  </span>
                </button>
              );
            })}
          </div>

          <button className="onboarding-continue" type="button" onClick={() => setStep(2)}>Continue</button>
        </section>
      </div>
    </main>
  );
}
