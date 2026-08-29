"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { localStore, type RepairRequest } from "@/lib/local-store";
import { ProblemBriefCard } from "./ProblemBriefCard";

export function ClarificationForm() {
  const { requestId } = useParams<{ requestId: string }>();
  const router = useRouter();
  const [item, setItem] = useState<RepairRequest>();
  const [answers, setAnswers] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const value = localStore.request(requestId);
    setItem(value);
    setAnswers(value?.analysis?.missing_questions.map(() => "") || []);
  }, [requestId]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  useEffect(() => {
    if (item?.analysis && item.analysis.missing_questions.length === 0) {
      router.replace(`/repair/${requestId}/review`);
    }
  }, [item, requestId, router]);

  if (!item?.analysis) return <main className="brief-shell analysis-review-page agent-flow-page"><div className="requests-empty">Request not found.</div></main>;

  const questions = item.analysis.missing_questions;
  const currentQuestion = questions[questionIndex];
  const currentAnswer = answers[questionIndex] || "";
  const brief = item.analysis.problem_brief;
  const firstPhoto = item.evidence.photos[0];
  const remainingPhotos = Math.max(0, item.evidence.photos.length - 1);

  async function submitAnswers() {
    setBusy(true);
    setError("");
    const newAnswers = questions.map((question, index) => ({ question, answer: answers[index].trim() }));
    const clarification_history = [...(item!.clarification_history || []), ...newAnswers];
    try {
      const response = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: item!.id,
          property: localStore.selectedProperty(),
          description: item!.description,
          category_hint: item!.category_hint,
          existing_problem_brief: item!.analysis!.problem_brief,
          clarification_history,
          clarification: newAnswers.map(({ question, answer }) => `${question}: ${answer}`).join("\n"),
        }),
      });
      if (!response.ok) throw new Error();
      const analysis = await response.json();
      const next = { ...item!, analysis, clarification_history, status: analysis.is_complete ? "review" as const : "collecting_info" as const };
      localStore.saveRequest(next);
      if (analysis.is_complete) {
        router.replace(`/repair/${item!.id}/review`);
        return;
      }
      setItem(next);
      setAnswers(analysis.missing_questions.map(() => ""));
      setQuestionIndex(0);
      setBusy(false);
    } catch {
      setBusy(false);
      setError("We couldn't update the brief. Please try again.");
    }
  }

  function continueQuestion(event: React.FormEvent) {
    event.preventDefault();
    if (!currentAnswer.trim() || busy) return;
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((index) => index + 1);
      return;
    }
    void submitAnswers();
  }

  return (
    <main className="brief-shell analysis-review-page agent-flow-page clarification-page">
      <div className="clarification-background" aria-hidden="true">
        <div className="analysis-user-message">
          {firstPhoto
            ? <span className="analysis-message-photo"><img src={firstPhoto.thumbnail_url || firstPhoto.storage_url} alt="" />{remainingPhotos > 0 && <i>+{remainingPhotos}</i>}</span>
            : <span className="analysis-message-photo" />}
          <p>{item.description}</p>
        </div>
        <ProblemBriefCard variant="analysis" brief={brief} photos={item.evidence.photos} />
      </div>

      <div className="clarification-overlay">
        <form className="clarification-sheet" onSubmit={continueQuestion} role="dialog" aria-modal="true" aria-labelledby="clarification-question">
          <div className="clarification-handle" aria-hidden />
          <div className="clarification-sheet-head">
            <div>
              <p>Help us fill the gap</p>
              <span>Question {questionIndex + 1} of {questions.length}</span>
            </div>
            <div className="clarification-progress" aria-hidden>{questions.map((_, index) => <i className={index <= questionIndex ? "active" : ""} key={index} />)}</div>
          </div>

          <section className="clarification-question-wrap" key={currentQuestion}>
            <h1 id="clarification-question">{currentQuestion}</h1>
            <p>Answer only what you know. A short response is enough.</p>
            <textarea autoFocus aria-label="Your answer" placeholder="Type your answer..." value={currentAnswer} onChange={(event) => setAnswers((old) => old.map((answer, index) => index === questionIndex ? event.target.value : answer))} />
          </section>

          {error && <p className="clarification-error" role="alert">{error}</p>}
          <div className="clarification-actions">
            {questionIndex > 0 && <button className="clarification-back" type="button" onClick={() => setQuestionIndex((index) => index - 1)}><ArrowLeft size={17} /> Back</button>}
            <button className="clarification-continue" type="submit" disabled={!currentAnswer.trim() || busy}>
              {busy ? "Updating..." : questionIndex === questions.length - 1 ? "Update brief" : "Continue"}
              {!busy && <ArrowRight size={17} />}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
