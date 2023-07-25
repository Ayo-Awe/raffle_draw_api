import { validateRequestBody } from "../../../utils/zodHelpers";
import { z } from "zod";

export const createTeamValidator = (payload: any) => {
  const schema = z.object({
    name: z.string().nonempty(),
  });

  return validateRequestBody(schema, payload);
};

export const verifyTeamValidator = (payload: any) => {
  const schema = z.object({
    accountNumber: z.string(),
    bankCode: z.string(),
  });

  return validateRequestBody(schema, payload);
};

export const updateBankAccountValidator = (payload: any) => {
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

export const createRaffleDrawValidator = (payload: any) => {
  const schema = z.object({
    ticketUnitPrice: z.number().min(100).positive(),
    logo: z.string().url(),
    ticketStock: z.number().positive().optional(),
    hasInfiniteStock: z.boolean().optional(),
    slug: z.string().min(5).max(20),
  });

  return validateRequestBody(schema, payload);
};

export const updateTeamValidator = (payload: any) => {
  const schema = z.object({
    name: z.string().nonempty().optional(),
    teamEmail: z.string().email().optional(),
  });

  return validateRequestBody(schema, payload);
};

export const updateTeamMemberValidator = (payload: any) => {
  const schema = z.object({
    role: z.enum(["admin", "member"]),
  });

  return validateRequestBody(schema, payload);
};
