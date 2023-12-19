import { describe, it } from "vitest";
import { EmailAddressMock, UUIDMock } from "graphql-scalars";
import { expectInvalid, expectValid } from "../../test/helpers";
import { emailRegistrationSchema } from "./registrations";

describe("email registration validation", () => {
  it("is invalid when personal information is missing", () => {
    const registration = {
      email: EmailAddressMock(),
      eventId: UUIDMock(),
      createdAt: new Date(Date.now()),
    };
    expectValid(emailRegistrationSchema, registration);
  });
  it("is invalid when the email is invalid", () => {
    const registration = {
      email: "invalid email",
      eventId: UUIDMock(),
      createdAt: new Date(Date.now()),
    };
    expectInvalid(emailRegistrationSchema, registration);
  });
});
