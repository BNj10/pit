"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DirectoryDetails } from "./college-management-provider";

export function DirectoryDetailsDialog({
  open,
  onOpenChange,
  kind,
  initialValues,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: "college" | "department";
  initialValues?: DirectoryDetails;
  onSave: (details: DirectoryDetails) => void;
}) {
  const id = useId();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [code, setCode] = useState(initialValues?.code ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [error, setError] = useState("");
  const dirty = name !== (initialValues?.name ?? "") || code !== (initialValues?.code ?? "") || description !== (initialValues?.description ?? "");

  function requestOpenChange(nextOpen: boolean) {
    if (!nextOpen && dirty && !window.confirm("Discard this draft? Your changes will be lost.")) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={requestOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{kind === "college" ? "Add college" : "Edit department"}</DialogTitle>
          <DialogDescription>{kind === "college" ? "Create a college to organize its departments." : "Update this department’s name, code, and description."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => {
          event.preventDefault();
          try {
            onSave({ name, code, description });
            onOpenChange(false);
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Unable to save. Please try again.");
          }
        }} className="space-y-5">
          {error && <p role="alert" className="rounded-md bg-destructive-soft p-3 text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>{kind === "college" ? "College" : "Department"} name *</Label>
            <Input id={`${id}-name`} required value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-code`}>{kind === "college" ? "College" : "Department"} code *</Label>
            <Input id={`${id}-code`} required value={code} onChange={(event) => setCode(event.target.value)} autoComplete="off" aria-describedby={`${id}-code-hint`} />
            <p id={`${id}-code-hint`} className="text-xs text-muted-foreground">Use a unique code, such as {kind === "college" ? "COTE" : "EE"}.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-description`}>Description (optional)</Label>
            <Textarea id={`${id}-description`} value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => requestOpenChange(false)}>Cancel</Button>
            <Button type="submit">{kind === "college" ? "Add college" : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
