import { useEffect, useState } from "react";
import { getClient } from "../ws.ts";

type Event = { id: string; title: string };

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => {
    const client = getClient();
    (async () => {
      const subscription = client.iterate({
        query: `
        subscription AllEvents {
          allEvents { title, id }
        }
      `,
      });
      for await (const result of subscription) {
        const events = result.data;
        console.log(events);
        const guard = (obj: unknown): obj is { allEvents: unknown } =>
          obj !== undefined &&
          obj !== null &&
          typeof obj === "object" &&
          Object.hasOwn(obj, "allEvents");
        if (guard(events) && Array.isArray(events.allEvents)) {
          setEvents(events.allEvents);
        }
      }
    })();
  }, []);
  return (
    <div>
      <h1>events</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>{event.title}</li>
        ))}
      </ul>
    </div>
  );
}
