import { z } from "zod";
import { EventInputSchema } from "../../src/model/events";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { client } from "../helpers/db.server";
import { parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { Title } from "../atoms/Title";
import { InputLabel } from "../atoms/InputLabel";
import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { InputErrorList } from "../molecules/InputErrorList";

const formInputSchema = z.object({
  input: z.object({
    event: EventInputSchema,
  }),
});

export async function action({ request }: ActionFunctionArgs) {
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

  const result = await client.event.createWithAgreement(
    submission.value.input.event,
  );

  // TODO abstraction
  if (!result) {
    return json(submission.reply());
  } else {
    return redirect(`/arr/${result.id}`);
  }
}

export default function Page() {
  const lastResult = useActionData<typeof action>();

  const submit = useSubmit();
  const [form, { input }] = useForm({
    lastResult,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      console.log("form", Object.fromEntries([...formData.entries()]));
      return parseWithZod(formData, { schema: formInputSchema });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();
      console.log("yeehaw");

      if (formData.get("intent") == "publish") {
        formData.set("publishedAt", new Date(Date.now()).toString());
      }

      submit(event.currentTarget);
    },
  });

  const fields = input.getFieldset().event.getFieldset();

  return (
    <main>
      <Title>Skapa Nytt Arrangemang</Title>
      <p>På den här sidan kan du skapa ett nytt arrangemang.</p>
      <div>
        <Form method="post" autoComplete="off" {...getFormProps(form)}>
          {/* title */}
          <div className="flex flex-col">
            <InputLabel required htmlFor={fields.title.id}>
              Titel
            </InputLabel>
            <Input {...getInputProps(fields.title, { type: "text" })} />
            <InputErrorList
              id={fields.title.errorId}
              errors={fields.title.errors?.slice(0, 1)}
            />
          </div>
          {/* location */}
          <div className="flex flex-col mt-4">
            <InputLabel htmlFor={fields.location.id}>Plats</InputLabel>
            <Input {...getInputProps(fields.location, { type: "text" })} />
            <InputErrorList
              id={fields.location.errorId}
              errors={fields.location.errors}
            />
          </div>
          {/* date */}
          <div className="flex flex-col mt-4">
            <InputLabel required htmlFor={fields.dateTime.id}>
              Datum
            </InputLabel>
            <Input {...getInputProps(fields.dateTime, { type: "date" })} />
            <InputErrorList
              id={fields.dateTime.errorId}
              errors={fields.dateTime.errors}
            />
          </div>
          {/* Submit */}
          <div className="mt-16 flex flex-row gap-x-2">
            <Button type="submit" name="intent" value="publish">
              Publicera
            </Button>
            <Button type="submit" name="intent" value="draft">
              Spara utkast
            </Button>
          </div>

          <pre>
            <code>{JSON.stringify(lastResult, null, 2)}</code>
          </pre>
        </Form>
      </div>
    </main>
  );
}
