import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

export const purchaseTicketValidator = (payload: any) => {
  const schema = z.object({
    quantity: z
      .number({
        invalid_type_error: "Please provide a valid number",
        required_error: "Quantity is required",
      })
      .int("Quantity must be an integer.")
      .min(1, "Quantity must be greater than 0"),
    email: z
      .string({
        invalid_type_error: "Please provide a valid email",
        required_error: "Email is required",
      })
      .email("Please provide a valid email"),
    firstName: z
      .string({
        invalid_type_error: "Please provide a valid first name",
        required_error: "First name is required",
      })
      .nonempty("Please provide a valid first name"),
    lastName: z
      .string({
        invalid_type_error: "Please provide a valid last name",
        required_error: "Last name is required",
      })
      .nonempty("Please provide a valid last name"),
  });

  return validateRequestBody(schema, payload);
};
