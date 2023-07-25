import { Request, Response } from "express";
import {
  BadRequest,
  Forbidden,
  ResourceNotFound,
  ServerError,
} from "../../../errors/httpErrors";
import raffleDrawRepository from "../../../repositories/raffleDraw.repository";
import { tryParseInt } from "../../../utils/commonHelpers";
import teamRepository from "../../../repositories/team.repository";
import paystackService, {
  InitiatePaymentOptions,
} from "../../../services/paystack.service";
import { purchaseTicketValidator } from "../validators/raffleDraw.validator";

class RaffleDrawController {
  async getRaffleDraw(req: Request, res: Response) {
    const idOrSlug = tryParseInt(req.params.idOrSlug);

    const raffleDraw = await raffleDrawRepository.getByIdOrSlug(idOrSlug);

    if (!raffleDraw) {
      throw new ResourceNotFound(
        `Raffle draw with id or slug '${idOrSlug}' not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({ raffleDraw });
  }

  async initiateTicketPurchase(req: Request, res: Response) {
    const idOrSlug = tryParseInt(req.params.idOrSlug);

    const { data, error } = purchaseTicketValidator(req.body);

    if (error) {
      throw new BadRequest(error.message, error.code);
    }

    const raffleDraw = await raffleDrawRepository.getByIdOrSlug(idOrSlug);

    if (!raffleDraw) {
      throw new ResourceNotFound(
        `Raffle draw with id or slug '${idOrSlug}' not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    if (raffleDraw.closedAt) {
      throw new Forbidden(
        "Raffle draw is closed for ticket purchases.",
        "RAFFLE_DRAW_CLOSED"
      );
    }

    const team = await teamRepository.getById(raffleDraw.teamId)!;

    if (!team) {
      // todo Replace this with proper error logging
      console.log(
        `Team '${raffleDraw.teamId}' not found when querying raffle draw ${raffleDraw.id}.`
      );
      throw new ServerError("An unexpected error occured.", "UNEXPECTED_ERROR");
    }

    const payload: InitiatePaymentOptions = {
      amount: raffleDraw.ticketUnitPrice,
      email: data.email,
      metadata: {
        firstName: data.firstName,
        lastName: data.lastName,
        raffleDrawId: raffleDraw.id,
        quantity: data.quantity,
      },
      subaccount: team.subaccountCode!,
    };

    const paymentLink = await paystackService.initiateTicketPayment(payload);

    if (!paymentLink) {
      throw new ServerError(
        "A error occured while trying to retrieve a payment link from a third-party provider.",
        "THIRD_PARTY_API_FAILURE"
      );
    }

    res.ok({ paymentLink });
  }
}

export default new RaffleDrawController();
