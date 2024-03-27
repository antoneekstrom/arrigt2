import { Event } from "@prisma/client";

type DateToString<T> = {
  [K in keyof T]: T[K] extends Date | null
    ? string | null
    : T[K] extends Date
      ? string
      : T[K];
};

export function EventSummary({
  id,
  title,
  dateTime,
  location,
  organizer,
}: DateToString<Event>) {
  return (
    <article>
      <a href={`/arr/${id}`}>
        <h1 className="font-serif text-2xl">{title}</h1>
      </a>
      <dl>
        {dateTime && (
          <div className="flex">
            <dt>{new Date(dateTime).toDateString()}</dt>
            <dd className="order-first">
              <span className="material-symbols-rounded">event</span>
            </dd>
          </div>
        )}
        {location && (
          <div className="flex">
            <dt>{location}</dt>
            <dd className="order-first">
              <span className="material-symbols-rounded">pin_drop</span>
            </dd>
          </div>
        )}
        {organizer && (
          <dt>
            <dt>{organizer}</dt>
            <dd>organizer</dd>
          </dt>
        )}
      </dl>
    </article>
  );
}
