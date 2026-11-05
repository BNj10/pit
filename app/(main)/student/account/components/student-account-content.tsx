"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Camera, GraduationCap, KeyRound, LockKeyhole, Mail, MapPin, Pencil, Save, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { StudentAccount, StudentContactDetails } from "@/types/student-account-types";
import { ChangePasswordDialog } from "./change-password-dialog";
import { ProfilePhotoDialog } from "./profile-photo-dialog";

export function StudentAccountContent({ account }: { account: StudentAccount }) {
  const [contact, setContact] = useState(account.contact);
  const [draft, setDraft] = useState(account.contact);
  const [editing, setEditing] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const photoButtonRef = useRef<HTMLButtonElement>(null);
  const displayed = editing ? draft : contact;

  function updateField(field: keyof StudentContactDetails, value: string | null) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function startEditing() {
    setDraft(contact);
    setNotice("");
    setEditing(true);
    requestAnimationFrame(() => titleRef.current?.focus());
  }

  function finishEditing() {
    setEditing(false);
    requestAnimationFrame(() => editButtonRef.current?.focus());
  }

  function closePhoto() {
    setPhotoOpen(false);
    requestAnimationFrame(() => photoButtonRef.current?.focus());
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContact({
      ...draft,
      currentAddress: draft.currentAddress.trim(),
      permanentAddress: draft.permanentAddress.trim(),
      email: draft.email.trim(),
      mobile: draft.mobile.trim(),
    });
    setNotice("Profile updated for this preview. Changes reset when you leave or reload this page.");
    finishEditing();
  }

  return (
    <form onSubmit={saveProfile} data-page="student-account" className="flex min-w-0 flex-col gap-6" aria-labelledby="student-account-title">
      <header className="flex flex-wrap items-center justify-between gap-5">
        <div className="min-w-0 flex-1 basis-72">
          <h2 ref={titleRef} tabIndex={-1} id="student-account-title" className="w-fit rounded-sm text-[28px] leading-[1.45] font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            {editing ? "Edit profile" : "Student account"}
          </h2>
          <p className="mt-1.5 text-[13px] leading-[1.45] text-muted-foreground">
            {editing ? "Update your address and contact details. Your student identity is read-only." : "Your personal profile and contact information."}
          </p>
        </div>
        {editing ? (
          <div className="flex flex-wrap gap-2.5">
            <Button type="submit" className="h-10 gap-2 rounded-md px-4 text-xs font-semibold max-sm:h-11"><Save aria-hidden="true" />Save changes</Button>
            <Button type="button" variant="outline" onClick={finishEditing} className="h-10 gap-2 rounded-md px-4 text-xs font-semibold max-sm:h-11"><X aria-hidden="true" />Cancel</Button>
          </div>
        ) : (
          <Button ref={editButtonRef} type="button" onClick={startEditing} className="h-10 gap-2 rounded-md px-4 text-xs font-semibold max-sm:h-11"><Pencil aria-hidden="true" />Edit profile</Button>
        )}
      </header>

      <div role="status" aria-live="polite" aria-atomic="true" className={cn("text-sm text-primary", !notice && "sr-only")}>{notice}</div>

      <section aria-label="Student identity" className="flex items-center gap-4 rounded-[10px] bg-primary p-5 text-primary-foreground sm:gap-6 sm:p-7">
        {editing ? (
          <button ref={photoButtonRef} type="button" aria-label="Edit profile photo" aria-haspopup="dialog" onClick={() => setPhotoOpen(true)} className="relative shrink-0 rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary-foreground">
            <AccountAvatar photoUrl={displayed.photoUrl} initials={account.initials} />
            <span className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full border-2 border-primary bg-primary-foreground text-primary"><Camera className="size-3.5" aria-hidden="true" /></span>
          </button>
        ) : <AccountAvatar photoUrl={displayed.photoUrl} initials={account.initials} />}
        <div className="min-w-0">
          <p className="text-xl leading-[1.45] font-semibold wrap-anywhere sm:text-[26px]">{account.name}</p>
          <p className="mt-1.5 text-[13px] leading-[1.45] text-on-primary-muted">Student ID · {account.studentId}</p>
        </div>
      </section>

      <section aria-labelledby="account-academic-heading" className="rounded-lg border border-border p-6">
        <SectionHeading id="account-academic-heading" icon={<GraduationCap />} title="Academic information" />
        <dl className="mt-5 grid gap-6 sm:grid-cols-2 xl:min-h-[50px] xl:grid-cols-4">
          {[['Program', account.program], ['Student status', account.status], ['Batch', account.batch], ['Year level', account.yearLevel]].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-[11px] leading-[1.3] text-muted-foreground">{label}</dt>
              <dd className={cn("mt-2 text-sm leading-[1.3] font-medium wrap-anywhere", label === "Program" && "font-semibold")}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid items-start gap-6 md:grid-cols-2">
        <section aria-labelledby="account-address-heading" className="min-w-0 rounded-lg border border-border p-6">
          <SectionHeading id="account-address-heading" icon={<MapPin />} title={editing ? "Personal details" : "Address details"} />
          <dl className="mt-5 flex flex-col gap-5">
            <ContactField label="Current address" id="account-current-address" value={displayed.currentAddress} editing={editing}>
              <Textarea id="account-current-address" name="currentAddress" autoComplete="street-address" value={draft.currentAddress} onChange={(event) => updateField("currentAddress", event.target.value)} maxLength={500} placeholder="Enter your current address" className="min-h-[88px] rounded-md border-border p-3 text-base md:text-xs" />
            </ContactField>
            <ContactField label="Permanent address" id="account-permanent-address" value={displayed.permanentAddress} editing={editing}>
              <Textarea id="account-permanent-address" name="permanentAddress" value={draft.permanentAddress} onChange={(event) => updateField("permanentAddress", event.target.value)} maxLength={500} className="min-h-[88px] rounded-md border-border p-3 text-base md:text-xs" />
            </ContactField>
          </dl>
        </section>
        <section aria-labelledby="account-contact-heading" className="min-w-0 rounded-lg border border-border p-6">
          <SectionHeading id="account-contact-heading" icon={<Mail />} title="Contact details" />
          <dl className="mt-5 flex flex-col gap-5">
            <ContactField label="Email address" id="account-email" value={displayed.email} editing={editing}>
              <Input id="account-email" name="email" type="email" autoComplete="email" required maxLength={254} value={draft.email} onChange={(event) => updateField("email", event.target.value)} className="h-[42px] rounded-md border-border px-3 text-base md:text-xs" />
            </ContactField>
            <ContactField label="Mobile number" id="account-mobile" value={displayed.mobile} editing={editing}>
              <Input id="account-mobile" name="mobile" type="tel" autoComplete="tel" maxLength={30} value={draft.mobile} onChange={(event) => updateField("mobile", event.target.value)} className="h-[42px] rounded-md border-border px-3 text-base md:text-xs" />
            </ContactField>
          </dl>
        </section>
      </div>

      <section aria-labelledby="account-security-heading" className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-[22px]">
        <LockKeyhole className="size-[22px] shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1 basis-48">
          <h3 id="account-security-heading" className="text-base leading-[1.2] font-semibold">Account security</h3>
          <p className="mt-[5px] text-xs leading-[1.3] text-muted-foreground">Keep your account secure with a strong, unique password.</p>
        </div>
        <ChangePasswordDialog>
          <Button type="button" variant="outline" className="h-10 gap-2 rounded-md border-primary px-4 text-xs font-semibold text-primary hover:text-primary max-sm:h-11"><KeyRound aria-hidden="true" />Change password</Button>
        </ChangePasswordDialog>
      </section>

      {photoOpen && <ProfilePhotoDialog photoUrl={draft.photoUrl} onClose={closePhoto} onSave={(photoUrl) => { updateField("photoUrl", photoUrl); closePhoto(); }} />}
    </form>
  );
}

function AccountAvatar({ photoUrl, initials }: { photoUrl: string | null; initials: string }) {
  return (
    <Avatar className="size-[76px] after:border-0">
      {photoUrl && <AvatarImage src={photoUrl} alt="" />}
      <AvatarFallback className="bg-primary-foreground/13 text-2xl font-semibold text-primary-foreground">{initials}</AvatarFallback>
    </Avatar>
  );
}

function SectionHeading({ id, icon, title }: { id: string; icon: ReactNode; title: string }) {
  return <h3 id={id} className="flex items-center gap-2.5 text-[17px] leading-[1.45] font-semibold [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-primary"><span aria-hidden="true">{icon}</span>{title}</h3>;
}

function ContactField({ label, id, value, editing, children }: { label: string; id: string; value: string; editing: boolean; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 border-b border-border pb-4">
      <dt className="text-[11px] leading-[1.45] font-medium text-muted-foreground">{editing ? <label htmlFor={id}>{label}</label> : label}</dt>
      <dd className={cn("min-w-0 text-sm leading-[1.45] font-medium wrap-anywhere", !value && !editing && "font-normal text-muted-foreground")}>{editing ? children : value || "Not added"}</dd>
    </div>
  );
}
