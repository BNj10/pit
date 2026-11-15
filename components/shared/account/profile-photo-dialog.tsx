"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Upload, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const acceptedTypes = ["image/png", "image/jpeg", "image/webp"];
const maxBytes = 2 * 1024 * 1024;
const footerButton = "h-10 rounded-md px-4 text-xs font-semibold max-sm:h-11";

export interface ProfilePhotoDialogProps {
  /** The photo in the current profile draft; null shows the placeholder. */
  photoUrl: string | null;
  onClose: () => void;
  /** Receives the chosen photo, or null when the photo was removed. */
  onSave: (photoUrl: string | null) => void;
}

// Shared by every account page. Self-contained styling (no globals.css rules)
// keeps it portable across portals. Mount it only while open so each opening
// starts from the current draft; the photo stays local until the profile saves.
export function ProfilePhotoDialog({ photoUrl, onClose, onSave }: ProfilePhotoDialogProps) {
  const [preview, setPreview] = useState(photoUrl);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const readerRef = useRef<FileReader | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Abort a pending read when the dialog closes so a late result is ignored.
  useEffect(() => () => {
    readerRef.current?.abort();
    readerRef.current = null;
  }, []);

  function selectImage(file: File | undefined) {
    if (!file) return;
    readerRef.current?.abort();
    readerRef.current = null;
    setReading(false);
    setError("");
    if (!acceptedTypes.includes(file.type)) {
      setError("Choose a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > maxBytes) {
      setError("Choose an image that is 2 MB or smaller.");
      return;
    }

    setReading(true);
    const reader = new FileReader();
    readerRef.current = reader;
    reader.onload = async () => {
      try {
        if (typeof reader.result !== "string") throw new Error("Invalid image data");
        // Decode first so a renamed or corrupt file is rejected instead of
        // showing a broken avatar.
        const image = new globalThis.Image();
        image.src = reader.result;
        await image.decode();
        if (readerRef.current === reader) setPreview(reader.result);
      } catch {
        if (readerRef.current === reader) setError("This image could not be displayed. Choose another image.");
      } finally {
        if (readerRef.current === reader) setReading(false);
      }
    };
    reader.onerror = () => {
      if (readerRef.current !== reader) return;
      setError("This image could not be read. Choose another image.");
      setReading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border border-border bg-background p-0 sm:max-w-[520px] [&>[data-slot=dialog-close]]:top-[18px] [&>[data-slot=dialog-close]]:right-4 [&>[data-slot=dialog-close]]:size-11">
        <div className="flex flex-col gap-1.5 border-b border-border p-6 pr-16">
          <DialogTitle className="text-xl leading-normal font-semibold">Edit profile photo</DialogTitle>
          <DialogDescription className="text-xs">Choose an image for your account.</DialogDescription>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-col items-center gap-3 rounded-lg py-5">
            <Avatar className="size-28 after:border-0">
              {preview && <AvatarImage src={preview} alt="Profile photo preview" />}
              <AvatarFallback className="bg-primary-soft text-primary"><UserRound className="size-11" aria-hidden="true" /></AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">{preview ? "Profile photo preview" : "No profile photo yet"}</p>
          </div>

          <div
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              selectImage(event.dataTransfer.files[0]);
            }}
            className={cn(
              "rounded-lg border border-border p-5 transition-colors",
              dragging && "border-primary bg-primary-soft",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(",")}
              aria-label="Choose profile image"
              aria-describedby="account-photo-format"
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => {
                selectImage(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="ghost"
              disabled={reading}
              onClick={() => fileInputRef.current?.click()}
              className="h-auto w-full flex-col gap-2.5 rounded-md p-0 py-1 text-primary hover:text-primary"
            >
              <Upload className="size-[22px]" aria-hidden="true" /><span className="text-[13px] font-semibold">Choose image</span>
            </Button>
            <p className="mt-2.5 text-center text-xs text-muted-foreground">or drag and drop it here</p>
            <p id="account-photo-format" className="mt-2.5 text-center text-[11px] text-muted-foreground">PNG, JPG or WebP · Max 2 MB</p>
          </div>

          <p role="status" className={reading ? "text-xs text-muted-foreground" : "sr-only"}>{reading ? "Reading image…" : ""}</p>
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          <p className="flex items-start gap-2 text-[11px] text-muted-foreground"><Info className="size-[15px] shrink-0" aria-hidden="true" />Use a square image. Your photo appears in a circular frame.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 border-t border-border px-6 py-[18px]">
          <Button
            type="button"
            variant="ghost"
            disabled={!preview || reading}
            onClick={() => { setPreview(null); setError(""); }}
            className="mr-auto h-10 rounded-md px-0 text-xs text-muted-foreground max-sm:h-11"
          >
            Remove photo
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" className={footerButton}>Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            disabled={reading || Boolean(error) || preview === photoUrl}
            onClick={() => onSave(preview)}
            className={footerButton}
          >
            Save photo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
