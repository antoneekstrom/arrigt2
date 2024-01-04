import { gql } from "../../__generated__/graphql";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { loadMutation, loadQuery } from "../../helpers/form.server";
import { z } from "zod";
import { conform, useFieldset, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  contactInfoInputSchema,
  personalInfoInputSchema,
} from "../../../src/schema/validation";

const paramSchema = z.object({ eventId: z.string().uuid() });

const formInputSchema = z.object({
  input: z.object({
    contactInfo: contactInfoInputSchema,
    personalInfo: personalInfoInputSchema.optional(),
  }),
});

const actionQuery = gql(`
mutation EventPageAction($eventId: UUID!, $input: EmailRegistrationInput!) {
  registerByEmail(eventId: $eventId, input: $input) {
    contactInfo {
      email
    }
  }
}
`);

const loaderQuery = gql(`
    query EventPageLoader($eventId: UUID!) {
      eventById(eventId: $eventId) {
        id
        title
        location
        dateTime
        closesForRegistrationsAt
        opensForRegistrationsAt
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
  const result = await loadMutation(args, {
    query: actionQuery,
    formDataSchema: formInputSchema,
    paramSchema,
  });
  return json(result);
}

export default function EventPage() {
  const { data } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const lastSubmission = fetcher.data;
  const isLoading = fetcher.state !== "idle";
  const responseErrors = JSON.stringify(lastSubmission?.error, null, 2);

  const closesAt = new Date(
    Date.parse(data?.eventById.closesForRegistrationsAt || ""),
  );
  const opensAt = new Date(
    Date.parse(data?.eventById.opensForRegistrationsAt || ""),
  );
  const isOpen = opensAt.getTime() < Date.now();

  const [form, { input }] = useForm({
    lastSubmission,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parse(formData, { schema: formInputSchema });
    },
  });

  const { contactInfo } = useFieldset(form.ref, input);
  const contactFields = useFieldset(form.ref, contactInfo);

  return (
    <div>
      <Link to="/">Back to events</Link>
      <h1>{data?.eventById.title}</h1>
      <h2>{data?.eventById.location}</h2>
      {data?.eventById.dateTime && (
        <h2>{new Date(Date.parse(data?.eventById.dateTime)).toDateString()}</h2>
      )}

      {isOpen ? (
        <fetcher.Form method="post" autoComplete="off" {...form.props}>
          <div>
            <label htmlFor={contactFields.email.id}>Email</label>
            <input {...conform.input(contactFields.email, { type: "email" })} />
            <div id={contactFields.email.errorId}>
              {contactFields.email.errors}
            </div>
          </div>
          <div>
            <label htmlFor={contactFields.firstName.id}>First Name</label>
            <input
              {...conform.input(contactFields.firstName, { type: "text" })}
            />
            <div id={contactFields.firstName.errorId}>
              {contactFields.firstName.errors}
            </div>
          </div>
          <div>
            <label htmlFor={contactFields.lastName.id}>Last Name</label>
            <input
              {...conform.input(contactFields.lastName, { type: "text" })}
            />
            <div id={contactFields.lastName.errorId}>
              {contactFields.lastName.errors}
            </div>
          </div>

          <input type="submit" value="Register" disabled={isLoading} />

          <div>{responseErrors}</div>
          <div>
            {lastSubmission?.value && (
              <span>
                Signed up successfully with email{" "}
                {lastSubmission.value.input.contactInfo.email}. You can always
                sign up again with the same email address to update details of
                your submission.
              </span>
            )}
          </div>
          <div>
            This event closes for registrations on {closesAt.toDateString()}.
          </div>
        </fetcher.Form>
      ) : (
        <div>
          This event opens for registrations on {opensAt.toDateString()}.
        </div>
      )}
    </div>
  );
}
