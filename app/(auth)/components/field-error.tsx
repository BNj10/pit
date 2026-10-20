import { CircleAlert } from "lucide-react";

export function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  return (
    <p
      id={id}
      role="alert"
      aria-atomic="true"
      className="flex min-h-[1.125rem] items-start gap-1.5 text-xs leading-body text-destructive"
    >
      {message && (
        <>
          <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" />
          <span>{message}</span>
        </>
      )}
    </p>
  );
}
