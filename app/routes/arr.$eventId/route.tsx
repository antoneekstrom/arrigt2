import { gql } from "../../__generated__/graphql";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { loadMutation, loadQuery } from "../../helpers/form.server";
import { z } from "zod";
import { conform, useFieldset, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  ContactInfoSchema,
  PersonalInfoSchema,
} from "../../../src/model/registrations";

const paramSchema = z.object({ eventId: z.string().uuid() });

const formInputSchema = z.object({
  input: z.object({
    contactInfo: ContactInfoSchema,
    personalInfo: PersonalInfoSchema.optional(),
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
        canRegisterTo
        hasClosed
        hasOpened
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

  const [form, { input }] = useForm({
    lastSubmission,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parse(formData, { schema: formInputSchema });
    },
  });

  const { contactInfo } = useFieldset(form.ref, input);
  const contactFields = useFieldset(form.ref, contactInfo);

  if (!data) {
    return null;
  }

  const { hasClosed, hasOpened, canRegisterTo } = data.eventById;

  return (
    <div>
      <Link to="/">Back to events</Link>
      <Link to="manage">Manage event</Link>
      <h1>{data?.eventById.title}</h1>
      <h2>{data?.eventById.location}</h2>
      {data?.eventById.dateTime && (
        <h2>{new Date(Date.parse(data?.eventById.dateTime)).toDateString()}</h2>
      )}

      {canRegisterTo && (
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
          {data.eventById.closesForRegistrationsAt && (
            <div>
              This event closes for registrations on{" "}
              {new Date(data.eventById.closesForRegistrationsAt).toDateString()}
              .
            </div>
          )}
        </fetcher.Form>
      )}
      {!hasOpened && !hasClosed && (
        <div>
          <p>Registrations are closed.</p>
          <p>
            This event opens for registrations on{" "}
            {new Date(data.eventById.opensForRegistrationsAt).toDateString()}.
          </p>
        </div>
      )}
      {hasClosed && (
        <div>
          <p>Registrations are closed.</p>
          {data.eventById.closesForRegistrationsAt && (
            <p>
              This event closed for registrations on{" "}
              {new Date(data.eventById.closesForRegistrationsAt).toDateString()}
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
