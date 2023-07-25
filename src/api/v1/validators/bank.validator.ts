import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

export const resolveBankValidator = (payload: any) => {
  const schema = z.object(
    {
      accountNumber: z.string({
        invalid_type_error: "Please provide a valid account number.",
        required_error: "Account number is required.",
      }),
      bankCode: z.string({
        invalid_type_error: "Please provide a valid bank code.",
        required_error: "Bank code is required.",
      }),
    },
    {
      required_error: "Missing request body",
      invalid_type_error: "Please provide a valid JSON",
    }
  );

  return validateRequestBody(schema, payload);
};
