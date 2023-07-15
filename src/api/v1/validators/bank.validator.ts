import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

export const resolveBankValidator = (payload: any) => {
  const schema = z.object({
    accountNumber: z.string(),
    bankCode: z.string(),
  });

  return validateRequestBody(schema, payload);
};
