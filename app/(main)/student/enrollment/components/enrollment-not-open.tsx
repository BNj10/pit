import { CalendarClock, Info } from "lucide-react";

export function EnrollmentNotOpen() {
  return (
    <section
      className="enrollment-not-open"
      aria-labelledby="enrollment-not-open-title"
      aria-describedby="enrollment-not-open-schedule"
    >
      <div className="enrollment-not-open-message">
        <div className="enrollment-not-open-icon" aria-hidden="true">
          <CalendarClock />
        </div>
        <h2 id="enrollment-not-open-title">Enrollment is not yet open</h2>
        <div className="enrollment-not-open-notice">
          <Info aria-hidden="true" />
          <p id="enrollment-not-open-schedule">Opening schedule to be announced</p>
        </div>
      </div>
    </section>
  );
}
