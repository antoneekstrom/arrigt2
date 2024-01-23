import { z } from "zod";
import { gql } from "../../__generated__/graphql";
import { loadMutation } from "../../helpers/form.server";
import { Form, useActionData } from "@remix-run/react";
import { FieldConfig, conform, useFieldset, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { parseFormData, shouldSubmit } from "../../helpers/data.server";
import { EventSchemaWithConstraints } from "../../../src/model/events";
import { RefObject, useState } from "react";

const actionQuery = gql(`
  mutation CreateEventPageAction($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
    }
  }
`);

const eventFormDataSchema = z.object({
  input: EventSchemaWithConstraints,
});

const eventDraftformDataSchema = eventFormDataSchema.transform(({ input }) => ({
  input: { ...input, isPublishedAt: null },
}));

export async function action(args: ActionFunctionArgs) {
  const isDraft =
    (await parseFormData(args.request.clone(), eventFormDataSchema)).intent ===
    "draft";

  const result = await loadMutation(args, {
    query: actionQuery,
    formDataSchema: isDraft ? eventDraftformDataSchema : eventFormDataSchema,
  });

  if (shouldSubmit(result) && result.data !== undefined) {
    throw redirect(
      isDraft ? `/arr/manage` : `/arr/${result.data.createEvent.id}`,
    );
  }

  return json(result);
}

export default function CreateEventPage() {
  const lastSubmission = useActionData<typeof action>();

  const [form, { input }] = useForm({
    lastSubmission,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parse(formData, { schema: eventFormDataSchema });
    },
  });

  return (
    <div>
      <h1>Create Event</h1>
      <Form {...form.props} method="post">
        <h2>Details</h2>
        <CreateEventDetailsFields formRef={form.ref} input={input} />

        <h2>Registration</h2>
        <CreateEventRegistrationFields formRef={form.ref} input={input} />

        <h2>Publish</h2>
        <CreateEventPublishFields formRef={form.ref} input={input} />

        <button type="submit" name={conform.INTENT} value="draft">
          Save Draft
        </button>
        <button type="submit" name={conform.INTENT} value="create">
          Create
        </button>
      </Form>
    </div>
  );
}

type FieldsetProps = {
  formRef: RefObject<HTMLFormElement | HTMLFieldSetElement>;
  input: FieldConfig<z.infer<typeof EventSchemaWithConstraints>>;
};

function CreateEventDetailsFields({ formRef, input }: FieldsetProps) {
  const { title, dateTime, location } = useFieldset(formRef, input);

  const titleField = (
    <div>
      <label htmlFor={title.id}>Title</label>
      <input {...conform.input(title, { type: "text" })} />
      {title.error && <div>{title.error}</div>}
    </div>
  );

  const dateTimeField = (
    <div>
      <label htmlFor={dateTime.id}>Date &amp; Time</label>
      <input {...conform.input(dateTime, { type: "datetime-local" })} />
      {dateTime.error && <div>{dateTime.error}</div>}
    </div>
  );

  const locationField = (
    <div>
      <label htmlFor={location.id}>Location</label>
      <input {...conform.input(location, { type: "text" })} />
      {location.error && <div>{location.error}</div>}
    </div>
  );

  return (
    <div>
      {titleField}
      {dateTimeField}
      {locationField}
    </div>
  );
}

function CreateEventRegistrationFields({ formRef, input }: FieldsetProps) {
  const [openWhenEventPublish, setOpenWhenEventPublish] = useState(true);
  const [closeWhenEventStart, setCloseWhenEventStart] = useState(true);

  const { opensForRegistrationsAt, closesForRegistrationsAt } = useFieldset(
    formRef,
    input,
  );

  const openForRegistrationsAtField = (
    <div>
      <label htmlFor={opensForRegistrationsAt.id}>
        Opens for registrations at
      </label>
      <input
        {...conform.input(opensForRegistrationsAt, {
          type: "datetime-local",
        })}
        disabled={openWhenEventPublish}
      />
      {opensForRegistrationsAt.error && (
        <div>{opensForRegistrationsAt.error}</div>
      )}
    </div>
  );

  const closesForRegistrationField = (
    <div>
      <label htmlFor={closesForRegistrationsAt.id}>
        Closes for registrations at
      </label>
      <input
        {...conform.input(closesForRegistrationsAt, {
          type: "datetime-local",
        })}
        disabled={closeWhenEventStart}
      />
      {closesForRegistrationsAt.error && (
        <div>{closesForRegistrationsAt.error}</div>
      )}
    </div>
  );

  return (
    <div>
      <div>
        <label htmlFor="openWhenEventPublish">Open when published</label>
        <input
          type="checkbox"
          name="openWhenEventPublish"
          checked={openWhenEventPublish}
          onChange={() => setOpenWhenEventPublish((now) => !now)}
        />
        {!openWhenEventPublish && openForRegistrationsAtField}
      </div>
      <div>
        <label htmlFor="closeWhenEventStart">Close when starts</label>
        <input
          type="checkbox"
          name="closeWhenEventStart"
          checked={closeWhenEventStart}
          onChange={() => setCloseWhenEventStart((now) => !now)}
        />
        {!closeWhenEventStart && closesForRegistrationField}
      </div>
    </div>
  );
}

function CreateEventPublishFields({ formRef, input }: FieldsetProps) {
  const { isPublishedAt } = useFieldset(formRef, input);
  const [publishImmediately, setPublishImmediately] = useState(true);

  const isPublishedAtField = (
    <div>
      <label htmlFor={isPublishedAt.id}>Is published</label>
      <input
        {...conform.input(isPublishedAt, { type: "datetime-local" })}
        disabled={publishImmediately}
      />
      {isPublishedAt.error && <div>{isPublishedAt.error}</div>}
    </div>
  );

  return (
    <div>
      <label htmlFor="publishImmediately">Publish immediately</label>
      <input
        type="checkbox"
        name="publishImmediately"
        checked={publishImmediately}
        onChange={() => setPublishImmediately((now) => !now)}
      />
      {!publishImmediately && isPublishedAtField}
    </div>
  );
}
