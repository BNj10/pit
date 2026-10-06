import Image from "next/image";
import Link from "next/link";

interface PortalBrandProps {
  audience: string;
  href: string;
  onNavigate?: () => void;
}

export function PortalBrand({ audience, href, onNavigate }: PortalBrandProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={`University Portal — ${audience}`}
      className="flex h-[72px] min-w-0 flex-1 shrink-0 items-center gap-2.5 pl-4 text-sidebar-foreground outline-sidebar-ring lg:gap-3 lg:px-6"
    >
      <Image
        src="/images-removebg-preview.png"
        alt=""
        width={36}
        height={36}
        className="size-9 shrink-0 object-contain"
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-base leading-[19px] font-bold">University Portal</span>
        <span className="text-[10px] leading-3 font-semibold tracking-[0.06em] text-sidebar-label">
          {audience}
        </span>
      </span>
    </Link>
  );
}
