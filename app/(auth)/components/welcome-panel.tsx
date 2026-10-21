import Image from "next/image";

export function WelcomePanel() {
  return (
    <aside
      aria-label="Palompon Institute of Technology"
      className="flex flex-col justify-between gap-12 bg-primary px-6 py-5 text-primary-foreground sm:px-10 lg:gap-16 lg:p-14"
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
        <p className="text-xs leading-body font-semibold tracking-label lg:text-[17px] lg:tracking-[1.5px]">
          PALOMPON INSTITUTE
          <br />
          OF TECHNOLOGY
        </p>
      </div>

      <div className="hidden max-w-md flex-col gap-6 lg:flex">
        <span aria-hidden="true" className="h-1 w-12 bg-brand-gold" />
        <h2 className="text-4xl leading-[1.18] font-semibold tracking-heading xl:text-display xl:tracking-[-1.2px]">
          Your academic
          <br />
          journey, connected.
        </h2>
        <p className="text-base leading-[1.75] text-on-primary-muted">
          One place for enrollment, class schedules, and academic records. Stay
          connected to every step of your education.
        </p>
      </div>

      <p className="hidden text-xs leading-body text-on-primary-muted lg:block">
        Palompon, Leyte &nbsp;•&nbsp; University Portal
      </p>
    </aside>
  );
}
