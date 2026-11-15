import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import type { StudentRecordsPaginationProps } from "@/types/student-records-exports";

export function StudentRecordsPagination({ page, pageCount, visibleCount, totalCount, onPageChange }: StudentRecordsPaginationProps) {
  const pageNumbers = new Set([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) { pageNumbers.add(2); pageNumbers.add(3); }
  if (page >= pageCount - 2) { pageNumbers.add(pageCount - 1); pageNumbers.add(pageCount - 2); }
  const visiblePages = [...pageNumbers].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);
  const items = visiblePages.flatMap<number | string>((value, index) => {
    const previous = visiblePages[index - 1];
    if (index === 0 || value - previous === 1) return [value];
    if (value - previous === 2) return [value - 1, value];
    return [`ellipsis-${value}`, value];
  });

  return (
    <div className="student-records-footer">
      <p className="student-records-count" role="status" aria-live="polite" aria-atomic="true">
        Showing {visibleCount} of {totalCount} admitted students
        <span className="sr-only">. Page {page} of {pageCount}.</span>
      </p>
      <Pagination className="student-records-pagination" aria-label="Student pages">
        <PaginationContent>
          <PaginationItem>
            <Button variant="outline" size="icon" aria-label="Go to previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft aria-hidden="true" />
            </Button>
          </PaginationItem>
          {items.map((item) => (
            <PaginationItem key={item}>
              {typeof item === "number" ? (
                <Button
                  variant={item === page ? "default" : "outline"}
                  size="icon"
                  aria-label={`Go to page ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </Button>
              ) : <PaginationEllipsis className="student-records-page-ellipsis" />}
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button variant="outline" size="icon" aria-label="Go to next page" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>
              <ChevronRight aria-hidden="true" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
