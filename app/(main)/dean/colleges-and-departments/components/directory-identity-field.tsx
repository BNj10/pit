"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DirectoryIconName, DirectoryIdentityFieldProps } from "@/types/college-management-types";
import { DirectoryIcon } from "./directory-icon";

const iconOptions: readonly { value: DirectoryIconName; label: string }[] = [
  { value: "building-2", label: "Building" }, { value: "graduation-cap", label: "Graduation cap" },
  { value: "book-open", label: "Book" }, { value: "flask-conical", label: "Science" },
  { value: "cpu", label: "Technology" }, { value: "palette", label: "Arts" },
  { value: "briefcase", label: "Business" }, { value: "heart-pulse", label: "Health" },
];

// Icon or official logo for a college or department (reference: jz5lq / MwjdT).
export function DirectoryIdentityField({
  id, subject, editing = false, icon, logoUrl, logoName, error, disabled = false, onIconSelect, onLogoSelect, onLogoRemove,
}: DirectoryIdentityFieldProps) {
  const [dragging, setDragging] = useState(false);
  const title = subject === "college" ? "College" : "Department";
  const selectedIconLabel = iconOptions.find((option) => option.value === icon)?.label
    ?? icon.replaceAll("-", " ").replace(/^\w/, (letter) => letter.toUpperCase());

  function selectFile(file: File | undefined) {
    if (file && !disabled) onLogoSelect(file);
  }

  return (
    <fieldset className="min-w-0 space-y-3">
      <legend className="mb-3 text-xs font-semibold">{title} icon / logo</legend>
      <div className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-soft text-primary">
        {logoUrl ? <Image src={logoUrl} alt={`Selected ${subject} logo`} width={44} height={44} unoptimized className="size-full object-contain" /> : <DirectoryIcon name={icon} className="size-6" />}
      </span><div className="space-y-1"><p className="text-xs font-medium">{editing ? `Current ${subject} identity` : `Choose how your ${subject} appears`}</p><p className="text-[11px] text-muted-foreground">{editing ? "Choose another system icon or upload a logo." : "Use a system icon or upload your official logo."}</p></div></div>
      <div className={cn("space-y-2.5 rounded-md border p-3", logoUrl ? "border-border" : "border-primary")}>
        <div className="flex flex-wrap justify-between gap-2"><p id={`${id}-icons-label`} className="text-xs font-semibold">System icons</p><p className="text-[10px] font-medium text-primary" role="status">{logoUrl ? "Official logo selected" : `${selectedIconLabel} selected`}</p></div>
        <div role="group" aria-labelledby={`${id}-icons-label`} className="grid grid-cols-4 gap-2 sm:grid-cols-8 sm:gap-2.5">
          {iconOptions.map((option) => <button key={option.value} type="button" aria-label={`Use ${option.label} icon`} aria-pressed={!logoUrl && icon === option.value} onClick={() => onIconSelect(option.value)} className="flex h-10 items-center justify-center rounded-[5px] border border-border text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary-soft aria-pressed:text-primary"><DirectoryIcon name={option.value} className="size-[18px]" /></button>)}
        </div>
      </div>
      <div onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]); }}>
        <input id={`${id}-logo`} type="file" accept="image/png,image/jpeg,image/webp" className="peer sr-only" aria-describedby={`${id}-logo-hint${error ? ` ${id}-logo-error` : ""}`} aria-invalid={Boolean(error)} onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ""; }} />
        <label htmlFor={`${id}-logo`} className={cn("flex min-h-[62px] cursor-pointer items-center gap-3 rounded-md border border-border p-3.5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:pointer-events-none", dragging && "border-primary bg-primary-soft")}>
          <ImageUp aria-hidden="true" className="size-[22px] shrink-0 text-muted-foreground" /><span className="min-w-0 space-y-1"><span className="block text-xs font-semibold text-primary">{logoUrl ? "Replace official logo" : "Upload official logo"}</span><span id={`${id}-logo-hint`} className="block text-[10px] text-muted-foreground">Click or drag a file · PNG, JPG, WebP · Max 2 MB</span></span>
        </label>
        {logoUrl && <div className="mt-2 flex items-center justify-between gap-2"><p className="min-w-0 truncate text-xs text-muted-foreground">{logoName ?? "Current official logo"}</p><Button type="button" variant="ghost" onClick={onLogoRemove} className="h-9 rounded-md text-xs">Remove logo</Button></div>}
        {error && <p id={`${id}-logo-error`} className="mt-2 text-xs text-destructive">{error}</p>}
      </div>
    </fieldset>
  );
}
