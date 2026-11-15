"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup } from "@/components/ui/radio-group";
import { studentGradeOptions } from "@/types/student-grades-exports";
import type { GradeDialogProps } from "@/types/student-grades-exports";

export function GradeDialog({ period, value, onSave, onClose, returnFocusRef }: GradeDialogProps) {
  const [selectedGrade, setSelectedGrade] = useState(value);
  const isEditing = value !== null;
  const periodLabel = period === "midterm" ? "Midterm" : "Finals";

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="student-grade-dialog"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <form onSubmit={(event) => {
          event.preventDefault();
          if (selectedGrade !== null) onSave(selectedGrade);
        }}>
          <DialogHeader className="student-grade-dialog-header">
            <DialogTitle>{isEditing ? "Edit student grade" : "Add student grade"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Choose a ${periodLabel.toLowerCase()} grade for this subject.`
                : `Choose a ${periodLabel.toLowerCase()} grade to record for this subject.`}
            </DialogDescription>
          </DialogHeader>
          <div className="student-grade-dialog-body">
            <div className="student-grade-dialog-label">
              <span id="student-grade-options-label">{periodLabel} grade</span>
              <span>{value === null ? "Not yet graded" : `Current: ${typeof value === "number" ? value.toFixed(2) : value}`}</span>
            </div>
            <RadioGroup
              className="student-grade-options"
              aria-labelledby="student-grade-options-label"
              value={selectedGrade === null ? "" : String(selectedGrade)}
              onValueChange={(next) => {
                const grade = studentGradeOptions.find((option) => String(option) === next);
                if (grade !== undefined) setSelectedGrade(grade);
              }}
            >
              <div className="student-grade-numeric-options">
                {studentGradeOptions.filter((grade) => typeof grade === "number").map((grade) => (
                  <RadioGroupPrimitive.Item key={grade} value={String(grade)} asChild>
                    <Button type="button" variant="outline" className="student-grade-option">
                      {grade.toFixed(2)}
                      {selectedGrade === grade && <Check aria-hidden="true" />}
                    </Button>
                  </RadioGroupPrimitive.Item>
                ))}
              </div>
              <p className="student-grade-outcomes-label">Other outcomes</p>
              <div className="student-grade-other-options">
                {studentGradeOptions.filter((grade) => typeof grade === "string").map((grade) => (
                  <RadioGroupPrimitive.Item key={grade} value={grade} asChild>
                    <Button type="button" variant="outline" className="student-grade-option student-grade-outcome">
                      {grade}
                      <span>{grade === "INC" ? "Incomplete" : "Dropped"}</span>
                      {selectedGrade === grade && <Check aria-hidden="true" />}
                    </Button>
                  </RadioGroupPrimitive.Item>
                ))}
              </div>
            </RadioGroup>
          </div>
          <DialogFooter className="student-grade-dialog-footer">
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" disabled={selectedGrade === null}>
              {isEditing ? "Save grade" : "Add grade"}
              {isEditing ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
