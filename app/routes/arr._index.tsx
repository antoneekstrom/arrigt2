import { Link, useLoaderData } from "@remix-run/react";
import { client } from "../helpers/db.server";
import { EventSummary } from "../molecules/EventSummary";

export async function loader() {
  const allPublishedEvents = await client.event.findMany(); // TODO abstraction
  return {
    allPublishedEvents,
  };
}

export default function Page() {
  const { allPublishedEvents } = useLoaderData<typeof loader>();

  return (
    <main id="main">
      <ul>
        {allPublishedEvents.map((event) => (
          <li key={event.id}>
            <EventSummary {...event} />
          </li>
        ))}
      </ul>
      <Link to="/arr/new">New arr</Link>
    </main>
  );
}
