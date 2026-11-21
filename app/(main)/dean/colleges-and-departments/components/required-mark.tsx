/** Visual required-field marker; the input's `required` attribute conveys it to assistive technology. */
export function RequiredMark() {
  return <span aria-hidden="true" className="text-destructive">*</span>;
}
