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

export function shouldSubmit<TSubmission extends Submission>(
  submission: TSubmission,
): submission is TSubmission & {
  intent: "submit";
  value: NonNullable<TSubmission["value"]>;
} {
  return (
    submission.intent !== "validate" &&
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
