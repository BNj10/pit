"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover } from "radix-ui";

import { Button } from "@/components/ui/button";

interface DepartmentFilterProps {
  departments: readonly string[];
  value: string;
  onChange: (value: string) => void;
  note?: string;
}

export function DepartmentFilter({
  departments,
  value,
  onChange,
  note = "Filters instructors in the current evaluation window.",
}: DepartmentFilterProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const options = ["All departments", ...departments].filter((department) =>
    department.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const activeOptionId = options[activeIndex] ? `${id}-option-${activeIndex}` : undefined;

  function select(department: string) {
    onChange(department === "All departments" ? "all" : department);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (options[activeIndex]) select(options[activeIndex]);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (!options.length) return;
    const next = (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
    setActiveIndex(next);
    document.getElementById(`${id}-option-${next}`)?.scrollIntoView({ block: "nearest" });
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setQuery("");
          setActiveIndex(value === "all" ? 0 : Math.max(0, departments.indexOf(value) + 1));
        }
      }}
    >
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          className="instructor-department-trigger"
          aria-label={`Filter by department: ${value === "all" ? "All departments" : value}`}
        >
          <span>{value === "all" ? "All departments" : value}</span>
          <ChevronDown aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="instructor-department-menu"
          aria-label="Filter instructors by department"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="instructor-department-search">
            <Search aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-label="Search departments"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-controls={`${id}-options`}
              aria-activedescendant={activeOptionId}
              autoComplete="off"
              placeholder="Search departments…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <p id={`${id}-label`} className="instructor-department-label">Available departments</p>
          <div
            id={`${id}-options`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="instructor-department-options"
          >
            {options.map((department, index) => {
              const selected = department === (value === "all" ? "All departments" : value);
              return (
                <button
                  key={department}
                  id={`${id}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={-1}
                  className="instructor-department-option"
                  data-active={index === activeIndex}
                  onPointerMove={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => select(department)}
                >
                  <span className="instructor-department-check">
                    {selected && <Check aria-hidden="true" />}
                  </span>
                  {department}
                </button>
              );
            })}
          </div>
          {options.length === 0 && (
            <p className="instructor-department-empty" role="status">No departments found.</p>
          )}
          <p className="instructor-department-note">{note}</p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
