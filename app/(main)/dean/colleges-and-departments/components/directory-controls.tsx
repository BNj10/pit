"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { DirectoryPaginationProps, DirectorySearchProps, DirectorySelectProps } from "@/types/college-management-types";

export function DirectorySearch({ label, placeholder, value, onChange, compact }: DirectorySearchProps) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}
        className={cn("h-11 rounded-md border-border bg-background pl-9 text-[13px] shadow-none md:text-[13px]", compact && "h-10 md:h-8 md:text-[11px]")} />
    </label>
  );
}

export function DirectorySelect({ label, value, onChange, options, className }: DirectorySelectProps) {
  return (
    <label className={cn("relative block min-w-0", className)}>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-md border border-border bg-background pr-9 pl-3 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-10">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
    </label>
  );
}

export function DirectoryPagination({ page, pageSize, total, noun, onPageChange }: DirectoryPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => start + index);

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 md:px-6">
      <p className="text-xs text-muted-foreground" role="status">
        Showing {total === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} of {total} {noun}
      </p>
      <Pagination aria-label={`${noun} pages`} className="mx-0 w-auto">
        <PaginationContent className="gap-1">
          <PaginationItem><Button type="button" variant="outline" aria-label="Previous page" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="h-10 rounded-md px-2 text-xs"><ChevronLeft aria-hidden="true" /><span className="hidden sm:inline">Previous</span></Button></PaginationItem>
          {pages.map((number) => (
            <PaginationItem key={number}><Button type="button" variant={number === currentPage ? "default" : "outline"} aria-label={`Page ${number}`} aria-current={number === currentPage ? "page" : undefined} onClick={() => onPageChange(number)} className="size-10 rounded-md p-0 text-xs">{number}</Button></PaginationItem>
          ))}
          <PaginationItem><Button type="button" variant="outline" aria-label="Next page" disabled={currentPage === pageCount} onClick={() => onPageChange(currentPage + 1)} className="h-10 rounded-md px-2 text-xs"><span className="hidden sm:inline">Next</span><ChevronRight aria-hidden="true" /></Button></PaginationItem>
        </PaginationContent>
      </Pagination>
    </footer>
  );
}
