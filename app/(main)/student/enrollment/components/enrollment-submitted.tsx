import { CircleCheckBig } from "lucide-react";

export function EnrollmentSubmitted() {
  return (
    <section
      data-page="enrollment"
      aria-labelledby="enrollment-submitted-title"
      className="min-w-0 overflow-hidden rounded-lg border border-border bg-background"
    >
      <div className="flex items-center gap-4 bg-success-soft px-5 py-6 sm:px-[26px]">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background" aria-hidden="true">
          <CircleCheckBig className="size-[25px] text-success" />
        </div>
        <h2
          id="enrollment-submitted-title"
          tabIndex={-1}
          className="min-w-0 rounded-sm text-xl leading-[1.3] font-bold focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
        >
          Your enrollment has been submitted
        </h2>
      </div>
    </section>
  );
}
