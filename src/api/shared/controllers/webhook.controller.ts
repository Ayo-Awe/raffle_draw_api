import { Request, Response } from "express";
import { clerkSecret } from "../../../config/clerk.config";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/clerk-sdk-node";
import db from "../../../db";
import { users } from "../../../db/schema";

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
}

export default new WebhookController();
