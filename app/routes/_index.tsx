import { useEffect, useId, useState } from "react";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { query } from "../query";
import { Event } from "../__generated__/graphql/graphql";
import {
  contactInfoSchema,
  emailRegistrationSchema,
} from "../../src/model/registrations";
import { parse } from "@conform-to/zod";
import { conform, useForm } from "@conform-to/react";

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

const MUTATION_REGISTER_EMAIL = /* GraphQL */ `
  mutation RegisterByEmail($input: MutationRegisterToEventByEmailInput!) {
    registerToEventByEmail(input: $input) {
      email
      event {
        id
      }
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

  const submission = parse(formData, {
    schema: emailRegistrationSchema
      .omit({ createdAt: true, personalInfoId: true })
      .merge(contactInfoSchema.omit({ id: true })),
  });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const response = await query(MUTATION_REGISTER_EMAIL, {
    input: submission.value,
  });

  return redirect(`/?value=${JSON.stringify(response)}`);
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

const EmailRegistration = (props: Pick<Event, "id">) => {
  const fetcher = useFetcher<typeof action>();
  const lastSubmission = fetcher.data;
  const id = useId();
  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onBlur",
    id,
    onValidate({ formData }) {
      return parse(formData, {
        schema: emailRegistrationSchema
          .omit({ createdAt: true, personalInfoId: true })
          .merge(contactInfoSchema.omit({ id: true })),
      });
    },
  });

  const [searchParams, setSearchParams] = useSearchParams();

  if (
    searchParams.has("value") &&
    JSON.parse(searchParams.get("value")!).data.registerToEventByEmail.event
      .id === props.id
  ) {
    return (
      <div>
        <h1>
          Registered with email{" "}
          {
            JSON.parse(searchParams.get("value")!).data.registerToEventByEmail
              .email
          }
        </h1>
        <button onClick={() => setSearchParams(new URLSearchParams())}>
          ok thank
        </button>
        <p>{searchParams.get("value")}</p>
      </div>
    );
  }

  return (
    <fetcher.Form method="post" {...form.props}>
      <input type="hidden" name="eventId" value={props.id} />
      <div>{lastSubmission?.intent}</div>
      <div>
        <label htmlFor={fields.email.id}>Email</label>
        <input {...conform.input(fields.email, { type: "email" })} />
        <div id={fields.email.errorId}>{fields.email.errors}</div>
      </div>
      <div>
        <label htmlFor={fields.firstName.id}>First Name</label>
        <input {...conform.input(fields.firstName, { type: "text" })} />
        <div id={fields.firstName.errorId}>{fields.firstName.errors}</div>
      </div>
      <div>
        <label htmlFor={fields.lastName.id}>Last Name</label>
        <input {...conform.input(fields.lastName, { type: "text" })} />
        <div id={fields.lastName.errorId}>{fields.lastName.errors}</div>
      </div>
      <button type="submit">Register</button>
    </fetcher.Form>
  );
};

const EventListItem = (props: DeepPartial<Event>) => {
  return (
    <li>
      <article>
        <h1>{props.title}</h1>
        <p>{props.dateTime?.toString()}</p>
        <p>{props.location}</p>
        <p>{props.id}</p>
        {props.id && <EmailRegistration id={props.id} />}
      </article>
    </li>
  );
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function useAllEventsSubscription(initial: DeepPartial<Event>[] = []) {
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
