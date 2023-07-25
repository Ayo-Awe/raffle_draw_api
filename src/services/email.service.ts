import emailQueue from "../queues/email.queue";
import { EmailJobData } from "../workers/email.worker";

interface TicketEmailData {
  email: string;
  ticketNumber: string | number;
  raffleDrawName: string;
}

class EmailService {
  async sendTicket(data: TicketEmailData) {
    const jobData: EmailJobData = {
      subject: "Ticket Purchase",
      template: "ticket_purchase",
      to: data.email,
      variables: {
        ticketNumber: data.ticketNumber,
        raffleDrawName: data.raffleDrawName,
      },
    };
    await emailQueue.add("send-ticket", jobData);
  }

  async sendTickets(data: TicketEmailData[]) {
    const jobs = data.map((d) => ({
      name: "send-ticket",
      data: {
        subject: "Ticket Purchase",
        template: "ticket_purchase",
        to: d.email,
        variables: {
          ticketNumber: d.ticketNumber,
          raffleDrawName: d.raffleDrawName,
        },
      },
    }));

    await emailQueue.addBulk(jobs);
  }
}

export default new EmailService();
