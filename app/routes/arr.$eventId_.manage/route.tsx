import { Form, Link, useLoaderData } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { loadMutation, loadQuery } from "../../helpers/form.server";
import { z } from "zod";
import { gql } from "../../__generated__/graphql";
import { parseFormData, shouldSubmit } from "../../helpers/data.server";

const paramSchema = z.object({ eventId: z.string().uuid() });

const loaderQuery = gql(`
    query ManageEventPageLoader($eventId: UUID!) {
      eventById(eventId: $eventId) {
        id
        title
        dateTime
        closesForRegistrationsAt
        opensForRegistrationsAt
        isOpen
        registrationCount
        allergies
      }
    }
  `);

const closeEventQuery = gql(`
  mutation ManageEventPageCloseAction($eventId: UUID!) {
    action: closeEvent(eventId: $eventId) {
      id
    }
  }
`);

const openEventQuery = gql(`
  mutation ManageEventPageOpenAction($eventId: UUID!) {
    action: openEvent(eventId: $eventId) {
      id
    }
  }
`);

export async function loader(args: LoaderFunctionArgs) {
  const result = await loadQuery(args, {
    query: loaderQuery,
    paramSchema,
  });
  return json(result);
}

export async function action(args: ActionFunctionArgs) {
  const formDataSchema = z.object({
    type: z.enum(["close", "open"]),
  });

  const submission = await parseFormData(args.request.clone(), formDataSchema);

  if (!shouldSubmit(submission)) {
    return json(submission);
  }

  const query =
    submission.value.type === "close" ? closeEventQuery : openEventQuery;

  const result = await loadMutation(args, {
    query,
    paramSchema,
    formDataSchema,
  });
  return json(result);
}

export default function ManageEventPage() {
  const { data } = useLoaderData<typeof loader>();

  if (!data) {
    return <div>Something went wrong</div>;
  }

  const { isOpen } = data.eventById;

  return (
    <div>
      <Link to="./..">View event</Link>
      <h1>Manage Event {data?.eventById.title}</h1>
      <p>
        Allergies:{" "}
        {data?.eventById.allergies.length ?? 0 > 0
          ? data?.eventById.allergies.join(", ")
          : "None"}
      </p>
      <p>Registrations: {data?.eventById.registrationCount}</p>
      <Form method="post">
        {isOpen ? (
          <input type="hidden" name="type" value="close" />
        ) : (
          <input type="hidden" name="type" value="open" />
        )}
        <button type="submit">{isOpen ? "Close" : "Open"} registrations</button>
      </Form>
    </div>
  );
}
