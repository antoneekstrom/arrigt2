import { Submission } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { z } from "zod";

export async function parseFormData<TResult>(
  request: Request,
  schema: z.ZodSchema<TResult>,
): Promise<Submission<TResult>> {
  const formData = await request.formData();
  return parse(formData, { schema });
}

export function shouldSubmit<T>(
  submission: Submission<T>,
): submission is Submission<T> & { intent: "submit"; value: T } {
  return (
    submission.intent === "submit" &&
    submission.value !== undefined &&
    submission.value !== null
  );
}

export function throwResponseError(response: {
  errors?: readonly { message: string }[];
}) {
  if (response.errors) {
    throw new Error(response.errors.map((error) => error.message).join(", "));
  }
}
