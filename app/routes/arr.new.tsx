import { z } from "zod";
import { EventInputSchema } from "../../src/model/events";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { client } from "../helpers/db.server";
import { Title } from "../atoms/Title";
import {
  Button,
  DateField,
  DateInput,
  DateSegment,
  FieldError,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import { zodResolver } from "@hookform/resolvers/zod";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { Controller } from "react-hook-form";
import { Form } from "@remix-run/react";
import { CalendarDate } from "@internationalized/date";

const formInputSchema = z.object({
  input: z.object({
    event: EventInputSchema,
  }),
});

const resolver = zodResolver(formInputSchema);

export async function action({ request }: ActionFunctionArgs) {
  // TODO abstraction
  const submission = await getValidatedFormData<
    z.infer<typeof formInputSchema>
  >(request, resolver);

  // TODO abstraction
  if (submission.errors) {
    return json({
      errors: submission.errors,
      defaultValues: submission.receivedValues,
    });
  }

  const result = await client.event.createWithAgreement(
    submission.data.input.event,
  );

  if (!result) {
    return json(submission.data, { status: 500 });
  } else {
    return redirect(`/arr/${result.id}`);
  }
}

export default function Page() {
  const { handleSubmit, control } = useRemixForm<
    z.infer<typeof formInputSchema>
  >({
    resolver,
    mode: "onBlur",
    defaultValues: {
      input: {
        event: {
          dateTime: new Date(),
        },
      },
    },
  });

  return (
    <main>
      <header>
        <Title>Skapa Nytt Arrangemang</Title>
        <p>På den här sidan kan du skapa ett nytt arrangemang.</p>
      </header>

      <Form
        method="post"
        autoComplete="off"
        onSubmit={handleSubmit}
        // validationErrors={errors.input?.event}
      >
        {/* title */}
        <Controller
          control={control}
          name="input.event.title"
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <TextField
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              validationBehavior="aria"
              isInvalid={invalid}
            >
              <Label>Titel</Label>
              <Input ref={ref} />
              <FieldError>{error?.message}</FieldError>
            </TextField>
          )}
        ></Controller>
        {/* dateTime */}
        <Controller
          control={control}
          name="input.event.dateTime"
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <DateField
              name={name}
              value={
                new CalendarDate(
                  value.getFullYear(),
                  value.getMonth(),
                  value.getDate(),
                )
              }
              onChange={onChange}
              onBlur={onBlur}
              // Let React Hook Form handle validation instead of the browser.
              validationBehavior="aria"
              isInvalid={invalid}
            >
              <Label>Datum</Label>
              <DateInput ref={ref}>
                {(segment) => <DateSegment segment={segment} />}
              </DateInput>
              <FieldError>{error?.message}</FieldError>
            </DateField>
          )}
        ></Controller>
        <Button type="submit">Publicera</Button>
      </Form>
    </main>
  );
}
