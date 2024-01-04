import { z } from "zod";
import { gql } from "../../__generated__/graphql";
import { loadMutation } from "../../helpers/form.server";
import { Form, useActionData } from "@remix-run/react";
import { conform, useFieldset, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { createEventInputSchema } from "../../../src/schema/validation";
import { shouldSubmit } from "../../helpers/data.server";

const actionQuery = gql(`
  mutation CreateEventPageAction($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
    }
  }
`);

const formDataSchema = z.object({
  input: createEventInputSchema,
});

export async function action(args: ActionFunctionArgs) {
  const result = await loadMutation(args, {
    query: actionQuery,
    formDataSchema,
  });

  if (shouldSubmit(result)) {
    throw redirect("/");
  }

  return json(result);
}

export default function CreateEventPage() {
  const lastSubmission = useActionData<typeof action>();

  const [form, { input }] = useForm({
    lastSubmission,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parse(formData, { schema: formDataSchema });
    },
  });

  const { title, dateTime, location } = useFieldset(form.ref, input);

  return (
    <div>
      <h1>Create Event</h1>
      <Form method="post">
        <div>
          <label htmlFor={title.id}>Title</label>
          <input {...conform.input(title, { type: "text" })} />
          {title.error && <div>{title.error}</div>}
        </div>
        <div>
          <label htmlFor={dateTime.id}>Date &amp; Time</label>
          <input {...conform.input(dateTime, { type: "datetime-local" })} />
        </div>
        <div>
          <label htmlFor={location.id}>Location</label>
          <input {...conform.input(location, { type: "text" })} />
        </div>
        <div>
          <button type="submit">Create</button>
          {form.error && <div>{form.error}</div>}
          {form.errors && <div>{form.errors}</div>}
          {lastSubmission?.error && (
            <div>{JSON.stringify(lastSubmission.error)}</div>
          )}
        </div>
      </Form>
    </div>
  );
}
