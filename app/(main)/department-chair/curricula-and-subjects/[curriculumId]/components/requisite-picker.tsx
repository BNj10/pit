"use client";

import { Fragment, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover } from "radix-ui";

import { Button } from "@/components/ui/button";
import { termLabel } from "@/lib/curriculum-subjects";
import type { Subject } from "@/types/curriculum-types";

interface RequisitePickerProps {
  id: string;
  /** Accessible name of the list, e.g. "Prerequisites". */
  label: string;
  /** Subjects that may be selected for the subject's current term. */
  options: readonly Subject[];
  /** Selected subjects that are no longer eligible; listed so they can be cleared. */
  ineligible: readonly Subject[];
  selectedIds: readonly string[];
  onChange: (ids: string[]) => void;
  emptyMessage: string;
  invalid?: boolean;
  describedBy?: string;
}

const ineligibleGroup = "Not in an eligible term";

export function RequisitePicker({
  id,
  label,
  options,
  ineligible,
  selectedIds,
  onChange,
  emptyMessage,
  invalid,
  describedBy,
}: RequisitePickerProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const search = query.trim().toLocaleLowerCase();
  const items = [
    ...options.map((subject) => ({ subject, group: termLabel(subject) })),
    ...ineligible.map((subject) => ({ subject, group: ineligibleGroup })),
  ].filter(({ subject }) => !search || `${subject.code} ${subject.title}`.toLocaleLowerCase().includes(search));
  const selected = [...options, ...ineligible].filter((subject) => selectedIds.includes(subject.id));
  const summary =
    selected.length === 0 ? "None selected" : selected.length === 1 ? selected[0].code : `${selected.length} selected`;
  const optionId = (index: number) => `${listId}-option-${index}`;

  function toggle(subjectId: string) {
    onChange(
      selectedIds.includes(subjectId)
        ? selectedIds.filter((selectedId) => selectedId !== subjectId)
        : [...selectedIds, subjectId],
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (items[activeIndex]) toggle(items[activeIndex].subject.id);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (!items.length) return;
    const next = (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    setActiveIndex(next);
    document.getElementById(optionId(next))?.scrollIntoView({ block: "nearest" });
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setQuery("");
          setActiveIndex(0);
        }
      }}
    >
      <Popover.Trigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="subject-requisite-trigger"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          title={selected.map((subject) => subject.code).join(", ") || undefined}
        >
          <span>{summary}</span>
          <ChevronDown aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className="subject-requisite-menu"
          aria-label={label}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="subject-requisite-search">
            <Search aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-label={`Search ${label.toLocaleLowerCase()}`}
              aria-expanded={open}
              aria-autocomplete="list"
              aria-controls={`${listId}-options`}
              aria-activedescendant={items[activeIndex] ? optionId(activeIndex) : undefined}
              autoComplete="off"
              placeholder="Search code or title…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div
            id={`${listId}-options`}
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
            className="subject-requisite-options"
          >
            {items.map(({ subject, group }, index) => {
              const checked = selectedIds.includes(subject.id);
              return (
                <Fragment key={subject.id}>
                  {group !== items[index - 1]?.group && (
                    <p className="subject-requisite-group" aria-hidden="true">{group}</p>
                  )}
                  <button
                    id={optionId(index)}
                    type="button"
                    role="option"
                    aria-selected={checked}
                    aria-label={`${subject.code} ${subject.title}, ${group}`}
                    tabIndex={-1}
                    className="subject-requisite-option"
                    data-active={index === activeIndex}
                    data-ineligible={group === ineligibleGroup || undefined}
                    onPointerMove={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => toggle(subject.id)}
                  >
                    <span className="subject-requisite-check">{checked && <Check aria-hidden="true" />}</span>
                    <span className="subject-requisite-code">{subject.code}</span>
                    <span className="subject-requisite-title">{subject.title}</span>
                  </button>
                </Fragment>
              );
            })}
          </div>
          {items.length === 0 && (
            <p className="subject-requisite-empty" role="status">
              {search ? "No subjects match your search." : emptyMessage}
            </p>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
