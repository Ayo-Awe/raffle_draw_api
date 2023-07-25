import { Request, Response } from "express";
import { clerkSecret } from "../../../config/clerk.config";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/clerk-sdk-node";
import db from "../../../db";
import { users } from "../../../db/schema";
import * as crypto from "crypto";
import { withTransaction } from "../../../utils/repostioryHelpers";
import contestantRepository from "../../../repositories/contestant.repository";
import transactionRepository from "../../../repositories/transaction.repository";
import ticketRepository, {
  NewTicket,
} from "../../../repositories/ticket.repository";
import { range } from "lodash";
import emailService from "../../../services/email.service";
import raffleDrawRepository from "../../../repositories/raffleDraw.repository";

class WebhookController {
  async clerkHandler(req: Request, res: Response) {
    const wh = new Webhook(clerkSecret);
    let payload;
    try {
      // @ts-ignore
      payload = wh.verify(req.body, req.headers);
    } catch (error) {
      // for security reasons it's better to return a 200
      return res.sendStatus(200);
    }

    const { data, type } = payload as WebhookEvent;

    switch (type) {
      case "user.created":
        const emailObject = data.email_addresses.find(
          (em) => em.id === data.primary_email_address_id
        )!;

        const user = {
          firstName: data.first_name,
          lastName: data.last_name,
          email: emailObject.email_address,
          clerkId: data.id,
        };

        await db.insert(users).values([user]).onConflictDoNothing();
    }

    res.sendStatus(200);
  }

  async paystackHandler(req: Request, res: Response) {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.ok({});
    }

    const event = req.body;

    const existingTransaction = await transactionRepository.getByReference(
      event.data.reference
    );

    if (existingTransaction) return res.ok({});

    if (event.event === "charge.success") {
      await withTransaction(async (tx) => {
        const contestantRepo = contestantRepository.withTransaction(tx);
        const transactionRepo = transactionRepository.withTransaction(tx);
        const ticketRepo = ticketRepository.withTransaction(tx);

        const contestant = await contestantRepo.create({
          email: event.data.customer.email,
          firstName: event.data.metadata.firstName,
          lastName: event.data.metadata.lastName,
          raffleDrawId: event.data.metadata.raffleDrawId,
        });

        const transaction = await transactionRepo.create({
          amountPaid: event.data.amount / 100,
          reference: event.data.reference,
          contestantId: contestant.id,
          purchasedAt: new Date(event.data.paid_at),
        });

        const ticketsPayload: NewTicket[] = range(
          event.data.metadata.quantity
        ).map(() => ({ transactionId: transaction.id }));

        const tickets = await ticketRepo.createBulk(ticketsPayload);

        const raffleDraw = await raffleDrawRepository.getById(
          contestant.raffleDrawId
        );

        await emailService.sendTickets(
          tickets.map((t) => ({
            ticketNumber: t.id,
            email: contestant.email,
            raffleDrawName: raffleDraw.name,
          }))
        );
      });
    }

    res.ok({});
  }
}

export default new WebhookController();
