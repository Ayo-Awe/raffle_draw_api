import { validateRequestBody } from "../../../utils/zodHelpers";
import { z } from "zod";

export const exampleValidator = (payload: any) => {
  const schema = z.object({
    name: z.string(),
  });

  return validateRequestBody(schema, payload);
};
