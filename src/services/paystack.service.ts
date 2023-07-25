import axios from "axios";
import dotenv from "dotenv";
import { redisClient } from "../config/redis.config";
import { ServerError } from "../errors/httpErrors";
const BANK_CACHE_EXPIRATION = 60 * 60 * 24 * 1; // 1 day
const RESOLUTION_CACHE_EXPIRATION = 60 * 15; // 15 minss

dotenv.config();

const paystackSecret = process.env.PAYSTACK_SECRET!;
const PERCENTAGE_CHARGE = 0.05;

interface ResolveAccNoResponse {
  status: boolean;
  message: string;
  data: BankResolution;
}

interface BankResolution {
  account_number: string;
  account_name: string;
  bank_id: number;
}

interface CreateSubAccountResponse {
  status: true;
  message: string;
  data: {
    business_name: string;
    account_number: string;
    percentage_charge: number;
    settlement_bank: string;
    integration: number;
    domain: string;
    subaccount_code: string;
    is_verified: boolean;
    settlement_schedule: string;
    active: boolean;
    migrate: boolean;
    id: number;
    createdAt: string;
    updatedAt: string;
  };
}

type UpdateSubaccountResponse = CreateSubAccountResponse;

interface CreateSubAccountData {
  teamId: number;
  accountNumber: string;
  bankCode: string;
  businessName?: string;
  percentageCharge?: number;
}

export interface Bank {
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface BankResponseData {
  status: boolean;
  message: string;
  data: Bank[];
  meta: {
    next: string | null;
    previous: string | null;
    perPage: number;
  };
}

interface TicketMetadata {
  raffleDrawId: number;
  firstName: string;
  lastName: string;
  quantity: number;
}

export interface InitiatePaymentOptions {
  amount: number;
  email: string;
  subaccount: string;
  metadata: TicketMetadata;
}

interface InitiatePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

class PayStackService {
  private axios = axios.create({
    baseURL: "https://api.paystack.co",
    headers: { Authorization: `Bearer ${paystackSecret}` },
  });

  async resolveBank(accountNumber: string, bankCode: string) {
    const cachedResult = await redisClient.get(
      `resolve:${accountNumber}-${bankCode}`
    );

    if (cachedResult) return JSON.parse(cachedResult) as BankResolution;

    try {
      const response = await this.axios.get<ResolveAccNoResponse>(
        "/bank/resolve",
        {
          params: {
            account_number: accountNumber,
            bank_code: bankCode,
          },
        }
      );

      await redisClient.set(
        `resolve:${accountNumber}-${bankCode}`,
        JSON.stringify(response.data.data),
        {
          NX: true,
          EX: RESOLUTION_CACHE_EXPIRATION,
        }
      );

      return response.data.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createSubaccount(data: CreateSubAccountData) {
    try {
      const payload = {
        business_name: data.businessName || `team_${data.teamId}`,
        bank_code: data.bankCode,
        account_number: data.accountNumber,
        percentage_charge: data.percentageCharge || PERCENTAGE_CHARGE,
      };

      const response = await this.axios.post<CreateSubAccountResponse>(
        "/subaccount",
        payload
      );

      return response.data.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateSubaccount(
    subaccountCode: string,
    data: Omit<CreateSubAccountData, "teamId">
  ) {
    try {
      const payload = {
        business_name: data.businessName,
        settlement_bank: data.bankCode,
        account_number: data.accountNumber,
        percentage_charge: data.percentageCharge,
      };

      const response = await this.axios.put<UpdateSubaccountResponse>(
        `/subaccount/${subaccountCode}`,
        payload
      );

      return response.data.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getAllBanks() {
    const cachedBanks = await redisClient.get("banks");

    if (cachedBanks) {
      return JSON.parse(cachedBanks) as Bank[];
    }

    const banks: Bank[] = [];

    let next: string | undefined | null;

    while (next !== null) {
      const response = await this.axios.get<BankResponseData>("/bank", {
        params: {
          use_cursor: true,
          next,
          perPage: 100,
        },
      });

      const { data, meta } = response.data;
      banks.push(...data);

      next = meta.next;
    }

    await redisClient.set("banks", JSON.stringify(banks), {
      NX: true,
      EX: BANK_CACHE_EXPIRATION,
    });

    return banks;
  }

  async initiateTicketPayment(options: InitiatePaymentOptions) {
    try {
      const response = await this.axios.post<InitiatePaymentResponse>(
        "/transaction/initialize",
        {
          ...options,
          amount: options.amount * 100, // in kobo,
        }
      );
      return response.data.data.authorization_url;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export default new PayStackService();
