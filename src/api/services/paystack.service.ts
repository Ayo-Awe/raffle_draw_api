import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const paystackSecret = process.env.PAYSTACK_SECRET!;
const PERCENTAGE_CHARGE = 0.05;

interface ResolveAccNoResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
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

class PayStackService {
  private axios = axios.create({
    baseURL: "https://api.paystack.co",
    headers: { Authorization: `Bearer ${paystackSecret}` },
  });

  async verifyBank(accountNumber: string, bankCode: string) {
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
}

export default new PayStackService();
