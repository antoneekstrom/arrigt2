import { useFetcher, useLoaderData } from "@remix-run/react";
import { getInputProps, useForm } from "@conform-to/react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { client } from "../helpers/db.server";
import { parseWithZod } from "@conform-to/zod";
import { AttendeeInputSchema } from "../../src/model/registrations";
import { Input } from "../atoms/Input";
import { InputLabel } from "../atoms/InputLabel";
import { EventSummary } from "../molecules/EventSummary";

const paramSchema = z.object({ eventId: z.string().uuid() });

const formInputSchema = z.object({
  input: z.object({
    attendee: AttendeeInputSchema,
  }),
});

export async function loader(args: LoaderFunctionArgs) {
  const { eventId } = paramSchema.parse(args.params); // TODO abstraction

  const result = await client.event.findUnique({
    where: {
      id: eventId,
    },
  });

  return json(result);
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { eventId } = paramSchema.parse(params);

  // TODO abstraction
  const submission = parseWithZod(await request.formData(), {
    schema: formInputSchema,
  });

  // TODO abstraction
  if (submission.status !== "success") {
    return json(submission.reply(), {
      status: submission.status === "error" ? 400 : 200,
    });
  }

  const result = await client.registration.createWithEmail(
    eventId,
    submission.value.input.attendee,
  );

  // TODO abstraction
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

  const { attendee } = input.getFieldset();
  const attendeeFields = attendee.getFieldset();

  if (!eventById) {
    return null;
  }

  const { canRegisterTo } = eventById;

  return (
    <div>
      <EventSummary {...eventById} />

      {canRegisterTo && (
        <fetcher.Form
          method="post"
          autoComplete="off"
          id={form.id}
          onSubmit={form.onSubmit}
        >
          <div>
            <InputLabel htmlFor={attendeeFields.email.id}>Email</InputLabel>
            <Input
              {...getInputProps(attendeeFields.email, { type: "email" })}
            />
            <div id={attendeeFields.email.errorId}>
              {attendeeFields.email.errors}
            </div>
          </div>
          <div>
            <InputLabel htmlFor={attendeeFields.firstName.id}>
              First Name
            </InputLabel>
            <Input
              {...getInputProps(attendeeFields.firstName, { type: "text" })}
            />
            <div id={attendeeFields.firstName.errorId}>
              {attendeeFields.firstName.errors}
            </div>
          </div>
          <div>
            <InputLabel htmlFor={attendeeFields.lastName.id}>
              Last Name
            </InputLabel>
            <Input
              {...getInputProps(attendeeFields.lastName, { type: "text" })}
            />
            <div id={attendeeFields.lastName.errorId}>
              {attendeeFields.lastName.errors}
            </div>
          </div>

          <input type="submit" value="Register" disabled={isLoading} />

          <div>{responseErrors}</div>
        </fetcher.Form>
      )}
    </div>
  );
}
