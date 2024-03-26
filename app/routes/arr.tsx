import { Link, useLoaderData } from "@remix-run/react";
import { client } from "../helpers/db.server";

export async function loader() {
  const allPublishedEvents = await client.event.findMany(); // TODO abstraction
  return {
    allPublishedEvents,
  };
}

export default function Home() {
  const { allPublishedEvents } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>arrIgT</h1>
      <ul>
        {allPublishedEvents.map((event) => (
          <li key={event.id}>
            <a href={`/arr/${event.id}`}>{event.title}</a>
          </li>
        ))}
      </ul>
      <Link to="/arr/new">New arr</Link>
    </div>
  );
}
