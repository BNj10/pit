"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Info, LoaderCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateDepartmentInput, validateDirectoryLogo } from "@/lib/department-management";
import type { DepartmentDialogProps, DirectoryIdentity, DirectoryIconName } from "@/types/college-management-types";
import { DirectoryIdentityField } from "./directory-identity-field";
import { RequiredMark } from "./required-mark";

// References: jz5lq / MwjdT. Mount a fresh draft for each opened department.
export function DepartmentDialog(props: DepartmentDialogProps) {
  return props.open ? <DepartmentDialogContent key={props.department?.id ?? "new"} {...props} /> : null;
}

function DepartmentDialogContent(props: DepartmentDialogProps) {
  const { open, onOpenChange, colleges, departments, department, defaultCollegeId } = props;
  const editing = Boolean(department);
  const id = useId();
  const initialCollegeId = department?.collegeId ?? defaultCollegeId ?? colleges[0]?.id ?? "";
  const [collegeId, setCollegeId] = useState(initialCollegeId);
  const [name, setName] = useState(department?.name ?? "");
  const [code, setCode] = useState(department?.code ?? "");
  const [description, setDescription] = useState(department?.description ?? "");
  const [icon, setIcon] = useState<DirectoryIconName>(department?.icon ?? "building-2");
  const [useExistingLogo, setUseExistingLogo] = useState(Boolean(department?.logoUrl));
  const [logo, setLogo] = useState<{ file: File; url: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [pending, setPending] = useState(false);
  const submissionRef = useRef(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const selectedCollege = colleges.find((college) => college.id === collegeId);
  const logoUrl = logo?.url ?? (useExistingLogo ? department?.logoUrl : undefined);
  const dirty = collegeId !== initialCollegeId || name !== (department?.name ?? "") || code !== (department?.code ?? "")
    || description !== (department?.description ?? "") || Boolean(logo) || icon !== (department?.icon ?? "building-2")
    || useExistingLogo !== Boolean(department?.logoUrl);

  useEffect(() => {
    const url = logo?.url;
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [logo]);

  function requestOpenChange(nextOpen: boolean) {
    if (submissionRef.current) return;
    if (!nextOpen && dirty && !window.confirm("Discard this department draft? Your changes will be lost.")) return;
    onOpenChange(nextOpen);
  }

  function clearLogo() {
    setLogo(null);
    setUseExistingLogo(false);
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
    const details = { collegeId, name: name.trim(), code: code.trim(), description: description.trim() };
    const identity: DirectoryIdentity | undefined = logo ? { kind: "logo", file: logo.file }
      : useExistingLogo ? undefined : { kind: "icon", icon };
    const nextErrors = validateDepartmentInput({ ...details, identity }, colleges, departments, department?.id);
    if (errors.logo) nextErrors.logo = errors.logo;
    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) { focusErrors(); return; }
    submissionRef.current = true;
    setPending(true);
    try {
      if (props.department) await props.onSave({ ...details, identity });
      else await props.onSave({ ...details, identity: identity ?? { kind: "icon", icon } });
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error && error.message ? error.message : `Could not ${editing ? "update" : "create"} the department. Please try again.`);
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
          <div className="space-y-1.5"><DialogTitle className="text-[22px] leading-tight font-bold">{editing ? "Edit department" : "Add department"}</DialogTitle><DialogDescription className="text-xs leading-relaxed">{editing ? "Update the information for this existing department." : selectedCollege ? `Add a department to ${selectedCollege.name}.` : "Add a department to a college."}</DialogDescription></div>
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
                <Label htmlFor={`${id}-college`} className="gap-1 text-xs font-semibold">College <RequiredMark /></Label>
                <div className="relative"><select id={`${id}-college`} required value={collegeId} onChange={(event) => setCollegeId(event.target.value)} aria-invalid={Boolean(errors.college)} aria-describedby={`${id}-college-hint${errors.college ? ` ${id}-college-error` : ""}`} className="h-11 w-full appearance-none rounded-md border border-border bg-background pr-9 pl-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive">
                  {colleges.length === 0 && <option value="">No colleges available</option>}
                  {colleges.map((college) => <option key={college.id} value={college.id}>{college.name}</option>)}
                </select><ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" /></div>
                <p id={`${id}-college-hint`} className="text-[11px] text-muted-foreground">Select the college this department belongs to.</p>
                {errors.college && <p id={`${id}-college-error`} className="text-xs text-destructive">{errors.college}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-name`} className="gap-1 text-xs font-semibold">Department name <RequiredMark /></Label>
                <Input id={`${id}-name`} required value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter full department name" autoComplete="off" aria-invalid={Boolean(errors.name)} aria-describedby={`${id}-name-hint${errors.name ? ` ${id}-name-error` : ""}`} className="h-11 rounded-md border-border text-[13px] md:text-[13px]" />
                <p id={`${id}-name-hint`} className="text-[11px] text-muted-foreground">Use the official name of the department.</p>
                {errors.name && <p id={`${id}-name-error`} className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-code`} className="gap-1 text-xs font-semibold">Department code <RequiredMark /></Label>
                <Input id={`${id}-code`} required value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. EE" autoComplete="off" aria-invalid={Boolean(errors.code)} aria-describedby={`${id}-code-hint${errors.code ? ` ${id}-code-error` : ""}`} className="h-11 rounded-md border-border text-[13px] md:text-[13px]" />
                <p id={`${id}-code-hint`} className="text-[11px] text-muted-foreground">Enter a unique code for this department.</p>
                {errors.code && <p id={`${id}-code-error`} className="text-xs text-destructive">{errors.code}</p>}
              </div>
              <DirectoryIdentityField
                id={id}
                subject="department"
                editing={editing}
                icon={icon}
                logoUrl={logoUrl}
                logoName={logo?.file.name}
                error={errors.logo}
                disabled={pending}
                onIconSelect={(next) => { setIcon(next); clearLogo(); }}
                onLogoSelect={selectLogo}
                onLogoRemove={clearLogo}
              />
              <div className="space-y-2"><Label htmlFor={`${id}-description`} className="text-xs font-semibold">Description (optional)</Label><Textarea id={`${id}-description`} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={editing ? undefined : "Add a brief description of this department"} className="min-h-[88px] resize-y rounded-md border-border text-[13px] md:text-[13px]" /></div>
            </fieldset>
            <p className="flex items-start gap-2.5 rounded-md bg-primary-soft p-3.5 text-xs text-primary"><Info aria-hidden="true" className="size-4 shrink-0" />{editing ? "Changes update department details only. Existing faculty and student records are preserved." : "The new department will appear in this college’s department directory."}</p>
          </div>
          <footer className="flex shrink-0 flex-wrap justify-end gap-2.5 border-t border-border px-6 py-[18px]">
            <Button type="button" variant="outline" disabled={pending} onClick={() => requestOpenChange(false)} className="h-10 rounded-md px-[18px] text-xs font-semibold">Cancel</Button>
            <Button type="submit" disabled={pending || colleges.length === 0} className="h-10 gap-2 rounded-md px-[18px] text-xs font-semibold">{pending ? (editing ? "Saving…" : "Creating…") : (editing ? "Save changes" : "Create department")}{pending ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : editing ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}</Button>
            <span role="status" className="sr-only">{pending ? `${editing ? "Saving" : "Creating"} department. Please wait.` : ""}</span>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
