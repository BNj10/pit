import { BookOpen, BriefcaseBusiness, Building2, Cog, ConciergeBell, Cpu, FlaskConical, GraduationCap, HeartPulse, Monitor, Palette, Wrench, Zap } from "lucide-react";
import type { DirectoryIconName } from "@/types/college-management-types";

const icons = {
  "building-2": Building2, "graduation-cap": GraduationCap, "book-open": BookOpen,
  "flask-conical": FlaskConical, cpu: Cpu, palette: Palette, briefcase: BriefcaseBusiness,
  "heart-pulse": HeartPulse, "concierge-bell": ConciergeBell, zap: Zap, cog: Cog,
  wrench: Wrench, monitor: Monitor,
};

export function DirectoryIcon({ name, className = "size-5" }: { name: DirectoryIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" className={className} />;
}
