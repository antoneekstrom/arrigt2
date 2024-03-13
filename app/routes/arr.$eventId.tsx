import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { getInputProps, useForm } from "@conform-to/react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { client } from "../helpers/db.server";
import { parseWithZod } from "@conform-to/zod";
import {
  ContactInfoSchema,
  PersonalInfoSchema,
} from "../../src/model/registrations";

const paramSchema = z.object({ eventId: z.string().uuid() });

const formInputSchema = z.object({
  input: z.object({
    contactInfo: ContactInfoSchema,
    personalInfo: PersonalInfoSchema.optional(),
  }),
});

export async function loader(args: LoaderFunctionArgs) {
  const { eventId } = paramSchema.parse(args.params);

  const result = await client.event.findUnique({
    where: {
      id: eventId,
    },
  });

  return json(result);
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { eventId } = paramSchema.parse(params);
  const submission = parseWithZod(await request.formData(), {
    schema: formInputSchema,
  });

  if (submission.status !== "success") {
    return json(submission.reply(), {
      status: submission.status === "error" ? 400 : 200,
    });
  }

  const result = await client.emailRegistration.registerTo({
    ...submission.value.input,
    event: eventId,
  });

  if (!result) {
    return json(submission.reply());
  }

  return json(submission.reply({ resetForm: true }));
}

export default function EventPage() {
  const eventById = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const lastResult = fetcher.data;
  const isLoading = fetcher.state !== "idle";
  const responseErrors = JSON.stringify(lastResult?.error, null, 2);

  const [form, { input }] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: formInputSchema });
    },
    shouldValidate: "onBlur",
  });

  const { contactInfo } = input.getFieldset();
  const contactFields = contactInfo.getFieldset();

  if (!eventById) {
    return null;
  }

  const { hasClosed, hasOpened, canRegisterToEvent } = eventById;

  return (
    <div>
      <Link to="/">Back to events</Link>
      <Link to="manage">Manage event</Link>
      <h1>{eventById.title}</h1>
      <h2>{eventById.location}</h2>
      {eventById.dateTime && (
        <h2>{new Date(Date.parse(eventById.dateTime)).toDateString()}</h2>
      )}

      {canRegisterToEvent && (
        <fetcher.Form
          method="post"
          autoComplete="off"
          id={form.id}
          onSubmit={form.onSubmit}
        >
          <div>
            <label htmlFor={contactFields.email.id}>Email</label>
            <input {...getInputProps(contactFields.email, { type: "email" })} />
            <div id={contactFields.email.errorId}>
              {contactFields.email.errors}
            </div>
          </div>
          <div>
            <label htmlFor={contactFields.firstName.id}>First Name</label>
            <input
              {...getInputProps(contactFields.firstName, { type: "text" })}
            />
            <div id={contactFields.firstName.errorId}>
              {contactFields.firstName.errors}
            </div>
          </div>
          <div>
            <label htmlFor={contactFields.lastName.id}>Last Name</label>
            <input
              {...getInputProps(contactFields.lastName, { type: "text" })}
            />
            <div id={contactFields.lastName.errorId}>
              {contactFields.lastName.errors}
            </div>
          </div>

          <input type="submit" value="Register" disabled={isLoading} />

          <div>{responseErrors}</div>
          {eventById.closesForRegistrationsAt && (
            <div>
              This event closes for registrations on{" "}
              {new Date(eventById.closesForRegistrationsAt).toDateString()}.
            </div>
          )}
        </fetcher.Form>
      )}
      {!hasOpened && !hasClosed && (
        <div>
          <p>Registrations are closed.</p>
          <p>
            This event opens for registrations on{" "}
            {new Date(eventById.opensForRegistrationsAt).toDateString()}.
          </p>
        </div>
      )}
      {hasClosed && (
        <div>
          <p>Registrations are closed.</p>
          {eventById.closesForRegistrationsAt && (
            <p>
              This event closed for registrations on{" "}
              {new Date(eventById.closesForRegistrationsAt).toDateString()}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
