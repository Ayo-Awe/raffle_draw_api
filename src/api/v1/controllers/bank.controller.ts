import { Request, Response } from "express";
import paystackService from "../../../services/paystack.service";
import { BadRequest } from "../../../errors/httpErrors";
import { resolveBankValidator } from "../validators/bank.validator";

class BankController {
  async getAllBanks(req: Request, res: Response) {
    const banks = await paystackService.getAllBanks();

    res.ok({ banks });
  }

  async resolveBankAccount(req: Request, res: Response) {
    const { data, error } = resolveBankValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const account = await paystackService.resolveBank(
      data.accountNumber,
      data.bankCode
    );

    if (!account) {
      throw new BadRequest(
        "Couldn't resolve bank account",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    res.ok({ account });
  }
}

export default new BankController();
