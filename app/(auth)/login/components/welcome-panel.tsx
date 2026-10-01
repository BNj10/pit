import Image from "next/image";

export function WelcomePanel() {
  return (
    <aside
      aria-label="Palompon Institute of Technology"
      className="flex flex-col justify-between gap-12 bg-primary px-6 py-5 text-primary-foreground sm:px-10 lg:gap-16 lg:px-12 lg:py-12 xl:px-16"
    >
      <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-6">
        <Image
          src="/images-removebg-preview.png"
          alt="Palompon Institute of Technology seal"
          width={150}
          height={150}
          sizes="(min-width: 1024px) 150px, 56px"
          preload
          className="size-14 shrink-0 object-contain lg:size-[150px]"
        />
        <p className="text-xs leading-body font-semibold tracking-label lg:text-base">
          PALOMPON INSTITUTE
          <br />
          OF TECHNOLOGY
        </p>
      </div>

      <div className="hidden max-w-md flex-col gap-6 lg:flex">
        <span aria-hidden="true" className="h-1 w-12 bg-brand-gold" />
        <h2 className="text-4xl leading-tight font-semibold tracking-heading xl:text-display">
          Your academic
          <br />
          journey, connected.
        </h2>
        <p className="max-w-sm text-base leading-relaxed text-on-primary-muted">
          One place for enrollment, class schedules, and academic records. Stay
          connected to every step of your education.
        </p>
      </div>

      <p className="hidden text-xs leading-body text-on-primary-muted lg:block">
        Palompon, Leyte &nbsp;•&nbsp; PIT Enroll
      </p>
    </aside>
  );
}
