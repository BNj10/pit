"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Check, LockKeyhole, Mail, MapPin, Pencil, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import { useDeanAccount } from "@/components/shared/account/dean-account-provider";
import { ProfilePhotoDialog } from "@/components/shared/account/profile-photo-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChangePasswordDialog } from "./change-password-dialog";

export function DeanAccount({ editing = false }: { editing?: boolean }) {
  const { user, details, saveDetails } = useDeanAccount();
  const router = useRouter();
  const [draft, setDraft] = useState(details);
  const [photoOpen, setPhotoOpen] = useState(false);
  const photoButtonRef = useRef<HTMLButtonElement>(null);
  const profile = editing ? draft : details;
  const initials = user.initials ?? user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    saveDetails({
      ...draft,
      currentAddress: draft.currentAddress.trim(),
      permanentAddress: draft.permanentAddress.trim(),
      email: draft.email.trim(),
      mobile: draft.mobile.trim(),
    });
    toast.success("Profile updated for this session.");
    router.push("/dean/account");
  }

  function closePhoto() {
    setPhotoOpen(false);
    // Return focus to the camera button once the dialog has unmounted.
    requestAnimationFrame(() => photoButtonRef.current?.focus());
  }

  return (
    <main className="dean-account-page" aria-labelledby="dean-account-title">
      <header className="account-page-heading">
        <div>
          <h2 id="dean-account-title">{editing ? "Edit profile" : "College Dean account"}</h2>
          <p>{editing ? "Update your address and contact details. Your College Dean identity is read-only." : "Your personal profile and contact information."}</p>
        </div>
        <div className="account-page-actions">
          {editing ? <>
            <Button type="submit" form="dean-profile-form" className="account-button"><Check aria-hidden="true" />Save changes</Button>
            <Button asChild variant="outline" className="account-button"><Link href="/dean/account"><X aria-hidden="true" />Cancel</Link></Button>
          </> : <Button asChild className="account-button"><Link href="/dean/account/edit-profile"><Pencil aria-hidden="true" />Edit profile</Link></Button>}
        </div>
      </header>

      <form id="dean-profile-form" onSubmit={save}>
        <section className="account-identity" aria-label="College Dean identity">
          <div className="account-avatar-wrap">
            <Avatar className={`account-avatar${editing ? " account-avatar-editing" : ""}`}>
              {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {editing && (
              <button ref={photoButtonRef} type="button" className="account-photo-button" aria-label="Edit profile photo" aria-haspopup="dialog" onClick={() => setPhotoOpen(true)}>
                <Camera aria-hidden="true" />
              </button>
            )}
          </div>
          <div><h3>{user.name}</h3><p>{user.description}{editing ? " · Personal profile" : ""}</p></div>
        </section>

        <div className="account-details-grid">
          <section className="account-details-card" aria-labelledby="account-address-heading">
            <h3 id="account-address-heading">{editing ? <UserRound aria-hidden="true" /> : <MapPin aria-hidden="true" />}{editing ? "Personal details" : "Address details"}</h3>
            {editing ? <>
              <div className="account-detail-row"><label htmlFor="account-current-address">Current address</label><Textarea id="account-current-address" name="currentAddress" placeholder="Enter your current address" autoComplete="section-current street-address" maxLength={500} value={draft.currentAddress} onChange={(event) => setDraft({ ...draft, currentAddress: event.target.value })} /></div>
              <div className="account-detail-row"><label htmlFor="account-permanent-address">Permanent address</label><Textarea id="account-permanent-address" name="permanentAddress" placeholder="Enter your permanent address" autoComplete="section-permanent street-address" maxLength={500} value={draft.permanentAddress} onChange={(event) => setDraft({ ...draft, permanentAddress: event.target.value })} /></div>
            </> : <dl>
              <div className="account-detail-row"><dt>Current address</dt><dd>{profile.currentAddress || "Not added"}</dd></div>
              <div className="account-detail-row"><dt>Permanent address</dt><dd>{profile.permanentAddress || "Not added"}</dd></div>
            </dl>}
          </section>
          <section className="account-details-card" aria-labelledby="account-contact-heading">
            <h3 id="account-contact-heading"><Mail aria-hidden="true" />Contact details</h3>
            {editing ? <>
              <div className="account-detail-row"><label htmlFor="account-email">Email address</label><Input id="account-email" name="email" type="email" placeholder="Enter your email address" autoComplete="email" maxLength={254} value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></div>
              <div className="account-detail-row"><label htmlFor="account-mobile">Mobile number</label><Input id="account-mobile" name="mobile" type="tel" placeholder="Enter your mobile number" autoComplete="tel" pattern={String.raw`[+0-9\(\) .\-]{7,25}`} title="Enter 7 to 25 characters using digits, spaces, +, parentheses or hyphens." maxLength={25} value={draft.mobile} onChange={(event) => setDraft({ ...draft, mobile: event.target.value })} /></div>
            </> : <dl>
              <div className="account-detail-row"><dt>Email address</dt><dd>{profile.email || "Not added"}</dd></div>
              <div className="account-detail-row"><dt>Mobile number</dt><dd>{profile.mobile || "Not added"}</dd></div>
            </dl>}
          </section>
        </div>
      </form>

      <section className="account-security" aria-labelledby="account-security-heading">
        <LockKeyhole aria-hidden="true" />
        <div><h3 id="account-security-heading">Account security</h3><p>{editing ? "Save or cancel your profile changes before changing your password." : "Keep your account secure with a strong, unique password."}</p></div>
        <ChangePasswordDialog disabled={editing} />
      </section>

      {photoOpen && (
        <ProfilePhotoDialog
          photoUrl={draft.avatarUrl}
          onClose={closePhoto}
          onSave={(avatarUrl) => {
            setDraft((current) => ({ ...current, avatarUrl }));
            closePhoto();
          }}
        />
      )}
    </main>
  );
}
