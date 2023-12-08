import { useEffect, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { query } from "../query";
import { Event } from "../__generated__/graphql/graphql";

const SUBSCRIPTION_ALL_EVENTS = /* GraphQL */ `
  subscription SubscribeToAllEvents {
    allEvents {
      title
      id
      dateTime
      location
    }
  }
`;

const QUERY_ALL_EVENTS = /* GraphQL */ `
  query AllEvents {
    allEvents {
      title
      id
      dateTime
      location
    }
  }
`;

const MUTATION_EDIT_EVENT = /* GraphQL */ `
  mutation EditEvent($input: MutationEditEventInput!) {
    editEvent(input: $input) {
      id
      title
    }
  }
`;

function validateAllEventsData(data: unknown): data is { allEvents: Event[] } {
  if (data === undefined || data === null) {
    return false;
  }

  if (typeof data !== "object" || !Object.hasOwn(data, "allEvents")) {
    return false;
  }

  return Array.isArray((data as { allEvents: unknown }).allEvents);
}

export async function loader() {
  const { data } = await query(QUERY_ALL_EVENTS);

  if (!validateAllEventsData(data)) {
    return false;
  }

  return json(data);
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get("id");
  const title = formData.get("title");
  const { data } = await query(MUTATION_EDIT_EVENT, { input: { id, title } });
  return json(data as Event);
}

export default function Events() {
  const data = useLoaderData<typeof loader>();
  const initialEvents = (data && data.allEvents) || [];
  const events = useAllEventsSubscription(initialEvents);

  return (
    <div>
      <h1>events</h1>
      <ul>
        {events.map((event) => (
          <EventListItem {...event} key={event.id} />
        ))}
      </ul>
    </div>
  );
}

const EventListItem = (props: Partial<Event>) => {

  return (
    <li>
      <article>
        <h1>{props.title}</h1>
        <p>{props.dateTime?.toString()}</p>
        <p>{props.location}</p>
        <p>{props.id}</p>
      </article>
    </li>
  );
};

function useAllEventsSubscription(initial: Partial<Event>[] = []) {
  const [events, setEvents] = useState(initial);
  useEffect(() => {
    const url = new URL("http://localhost:4000/graphql");

    url.searchParams.append("query", SUBSCRIPTION_ALL_EVENTS);
    const source = new EventSource(url);

    source.addEventListener("next", (e) => {
      const { data } = JSON.parse(e.data);
      if (validateAllEventsData(data)) {
        setEvents(data.allEvents);
      }
    });

    source.addEventListener("complete", () => {
      source.close();
    });

    return () => source.close();
  }, []);

  return events;
}
