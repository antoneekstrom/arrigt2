import { ActionFunctionArgs, json } from "@remix-run/node";
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
import { z } from "zod";
import { EventInputSchema } from "../../src/model/events";
import { Form, useActionData } from "@remix-run/react";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";

const formInputSchema = z.object({
  input: z.object({
    event: EventInputSchema,
  }),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    data,
    errors,
    receivedValues: defaultValues,
  } = await getValidatedFormData<z.infer<typeof formInputSchema>>(
    request,
    zodResolver(formInputSchema),
  );

  return json({
    errors,
    defaultValues,
    data,
  });
}

export default function Test() {
  const lastSubmission = useActionData<typeof action>();

  const { handleSubmit, control } = useRemixForm<
    z.infer<typeof formInputSchema>
  >({
    mode: "onBlur",
    resolver: zodResolver(formInputSchema),
    defaultValues: {
      input: {
        event: {
          title: "",
        },
      },
    },
  });

  return (
    <main>
      <header>
        <Title>Test</Title>
      </header>
      <Form
        autoComplete="off"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        {/* <input
          className="border-2"
          type="text"
          {...register("input.event.title")}
        />
        {errors.input?.event?.title && errors.input.event.title.message}
        <input
          className="border-2"
          type="datetime-local"
          {...register("input.event.dateTime")}
        />
        {errors.input?.event?.dateTime && errors.input.event.dateTime.message} */}
        <Controller
          control={control}
          name="input.event.title"
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { error, invalid },
          }) => (
            <TextField
              className="flex flex-col"
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              validationBehavior="aria"
              isInvalid={invalid}
            >
              <Label>Titel</Label>
              <Input className="border-2" ref={ref} />
              <FieldError>{error?.message ?? ""}</FieldError>
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="input.event.dateTime"
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { error, invalid },
          }) => (
            <DateField
              className="flex flex-col"
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              validationBehavior="aria"
              isInvalid={invalid}
            >
              <Label>Titel</Label>
              <DateInput className="border-2" ref={ref}>
                {(segment) => <DateSegment segment={segment} />}
              </DateInput>
              <FieldError>{error?.message ?? ""}</FieldError>
            </DateField>
          )}
        />

        <Button type="submit" name="cool2" className="border-2">
          Skicka2
        </Button>
        <Button type="submit" name="cool" className="border-2">
          Skicka
        </Button>
      </Form>
      <pre>{JSON.stringify(lastSubmission, null, 2)}</pre>
    </main>
  );
}
