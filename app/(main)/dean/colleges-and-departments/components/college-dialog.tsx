"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info, LoaderCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateCollegeInput } from "@/lib/college-management";
import { validateDirectoryLogo } from "@/lib/department-management";
import type { CollegeDialogProps, DirectoryIconName, DirectoryIdentity } from "@/types/college-management-types";
import { DirectoryIdentityField } from "./directory-identity-field";
import { RequiredMark } from "./required-mark";

// Follows the Add department dialog design (jz5lq). Mount a fresh draft for each opening.
export function CollegeDialog(props: CollegeDialogProps) {
  return props.open ? <CollegeDialogContent {...props} /> : null;
}

function CollegeDialogContent({ open, onOpenChange, colleges, onSave }: CollegeDialogProps) {
  const id = useId();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<DirectoryIconName>("building-2");
  const [logo, setLogo] = useState<{ file: File; url: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [pending, setPending] = useState(false);
  const submissionRef = useRef(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dirty = Boolean(name || code || description || logo) || icon !== "building-2";

  useEffect(() => {
    const url = logo?.url;
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [logo]);

  function requestOpenChange(nextOpen: boolean) {
    if (submissionRef.current) return;
    if (!nextOpen && dirty && !window.confirm("Discard this college draft? Your changes will be lost.")) return;
    onOpenChange(nextOpen);
  }

  function clearLogo() {
    setLogo(null);
    setErrors((previous) => ({ ...previous, logo: "" }));
  }

  function selectLogo(file: File) {
    if (submissionRef.current) return;
    const error = validateDirectoryLogo(file) ?? "";
    setErrors((previous) => ({ ...previous, logo: error }));
    if (error) return;
    setLogo({ file, url: URL.createObjectURL(file) });
  }

  function focusErrors() {
    requestAnimationFrame(() => errorSummaryRef.current?.focus());
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionRef.current) return;
    const identity: DirectoryIdentity = logo ? { kind: "logo", file: logo.file } : { kind: "icon", icon };
    const input = { name: name.trim(), code: code.trim(), description: description.trim(), identity };
    const nextErrors: Record<string, string> = { ...validateCollegeInput(input, colleges) };
    if (errors.logo) nextErrors.logo = errors.logo;
    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) { focusErrors(); return; }
    submissionRef.current = true;
    setPending(true);
    try {
      await onSave(input);
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error && error.message ? error.message : "Could not create the college. Please try again.");
      focusErrors();
    } finally {
      submissionRef.current = false;
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={requestOpenChange}>
      <DialogContent showCloseButton={false} className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-xl border border-border bg-background p-0 ring-0 sm:max-w-[560px]" onEscapeKeyDown={(event) => { if (pending) event.preventDefault(); }} onPointerDownOutside={(event) => { if (pending) event.preventDefault(); }}>
        <header className="flex shrink-0 items-start justify-between gap-3.5 border-b border-border p-6">
          <div className="space-y-1.5"><DialogTitle className="text-[22px] leading-tight font-bold">Add college</DialogTitle><DialogDescription className="text-xs leading-relaxed">Create a college to organize its departments.</DialogDescription></div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close dialog" disabled={pending} onClick={() => requestOpenChange(false)} className="-mt-2 -mr-2 size-10 rounded-md text-muted-foreground"><X aria-hidden="true" className="size-5" /></Button>
        </header>
        <form noValidate onSubmit={submit} aria-busy={pending} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 space-y-5 overflow-y-auto p-6">
            <p className="text-[11px] text-muted-foreground">Fields marked <span className="text-destructive">*</span> are required.</p>
            {(Object.values(errors).some(Boolean) || submitError) && <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="space-y-2 rounded-md border border-destructive-border bg-destructive-soft p-3 text-xs text-destructive outline-none focus:ring-2 focus:ring-destructive">
              <p className="font-semibold">{submitError || "Please correct the following fields."}</p>
              {Object.entries(errors).filter(([, message]) => message).map(([field, message]) => <p key={field}><a href={`#${id}-${field}`} className="underline" onClick={(event) => { event.preventDefault(); document.getElementById(`${id}-${field}`)?.focus(); }}>{message}</a></p>)}
            </div>}
            <fieldset disabled={pending} className="min-w-0 space-y-5 disabled:opacity-70">
              <div className="space-y-2">
                <Label htmlFor={`${id}-name`} className="gap-1 text-xs font-semibold">College name <RequiredMark /></Label>
                <Input id={`${id}-name`} required value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter full college name" autoComplete="off" aria-invalid={Boolean(errors.name)} aria-describedby={`${id}-name-hint${errors.name ? ` ${id}-name-error` : ""}`} className="h-11 rounded-md border-border text-[13px] md:text-[13px]" />
                <p id={`${id}-name-hint`} className="text-[11px] text-muted-foreground">Use the official name of the college.</p>
                {errors.name && <p id={`${id}-name-error`} className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-code`} className="gap-1 text-xs font-semibold">College code <RequiredMark /></Label>
                <Input id={`${id}-code`} required value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. COTE" autoComplete="off" aria-invalid={Boolean(errors.code)} aria-describedby={`${id}-code-hint${errors.code ? ` ${id}-code-error` : ""}`} className="h-11 rounded-md border-border text-[13px] md:text-[13px]" />
                <p id={`${id}-code-hint`} className="text-[11px] text-muted-foreground">Enter a unique code for this college.</p>
                {errors.code && <p id={`${id}-code-error`} className="text-xs text-destructive">{errors.code}</p>}
              </div>
              <DirectoryIdentityField
                id={id}
                subject="college"
                icon={icon}
                logoUrl={logo?.url}
                logoName={logo?.file.name}
                error={errors.logo}
                disabled={pending}
                onIconSelect={(next) => { setIcon(next); clearLogo(); }}
                onLogoSelect={selectLogo}
                onLogoRemove={clearLogo}
              />
              <div className="space-y-2"><Label htmlFor={`${id}-description`} className="text-xs font-semibold">Description (optional)</Label><Textarea id={`${id}-description`} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a brief description of this college" className="min-h-[88px] resize-y rounded-md border-border text-[13px] md:text-[13px]" /></div>
            </fieldset>
            <p className="flex items-start gap-2.5 rounded-md bg-primary-soft p-3.5 text-xs text-primary"><Info aria-hidden="true" className="size-4 shrink-0" />The new college will appear in the Colleges directory. Add its departments from Manage departments.</p>
          </div>
          <footer className="flex shrink-0 flex-wrap justify-end gap-2.5 border-t border-border px-6 py-[18px]">
            <Button type="button" variant="outline" disabled={pending} onClick={() => requestOpenChange(false)} className="h-10 rounded-md px-[18px] text-xs font-semibold">Cancel</Button>
            <Button type="submit" disabled={pending} className="h-10 gap-2 rounded-md px-[18px] text-xs font-semibold">{pending ? "Creating…" : "Create college"}{pending ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <Plus aria-hidden="true" />}</Button>
            <span role="status" className="sr-only">{pending ? "Creating college. Please wait." : ""}</span>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
