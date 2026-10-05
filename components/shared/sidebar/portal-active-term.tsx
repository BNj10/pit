interface PortalActiveTermProps {
  activeTerm: string;
}

export function PortalActiveTerm({ activeTerm }: PortalActiveTermProps) {
  return (
    <section aria-label="Active academic term" className="flex shrink-0 flex-col gap-2 border-y border-sidebar-border bg-sidebar-foreground/4 px-6 py-4">
      <span className="text-[10px] leading-3 font-semibold tracking-[0.06em] text-sidebar-label">
        ACTIVE TERM
      </span>
      <span className="text-[13px] leading-4 font-semibold text-sidebar-foreground">
        {activeTerm}
      </span>
    </section>
  );
}
