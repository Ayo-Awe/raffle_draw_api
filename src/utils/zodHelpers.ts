import { ZodSchema, ZodTypeDef } from "zod";

import { BadRequestErrorCode } from "../errors/httpErrors";

export function validateRequestBody<T, U extends ZodTypeDef>(
  schema: ZodSchema<T, U, T>,
  payload: any
) {
  const result = schema.safeParse(payload);

  if (result.success) return { data: result.data };
  const { errors } = result.error;

  const isMissingFieldError =
    errors[0].code === "invalid_type" &&
    (errors[0].received === "undefined" || errors[0].received === "null");

  let code: BadRequestErrorCode = isMissingFieldError
    ? "MISSING_REQUIRED_FIELD"
    : "INVALID_REQUEST_PARAMETERS";

  return { error: { code, message: errors[0].message } };
}
