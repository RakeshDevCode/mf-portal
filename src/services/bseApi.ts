import { 
  Client, 
  MutualFund, 
  Transaction, 
  PurchaseRequest, 
  RedeemRequest, 
  SwitchRequest, 
  ApiResponse 
} from '../types/transaction';

class BSEApiService {
  private baseURL = 'https://api.bsestarmf.in/v1'; // Replace with actual BSE API URL
  private authToken = ''; // This should be managed securely

  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' = 'GET', 
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        errorCode: 'NETWORK_ERROR'
      };
    }
  }

  // Client Management
  async getClients(): Promise<ApiResponse<Client[]>> {
    return this.makeRequest<Client[]>('/clients');
  }

  async getClientById(clientId: string): Promise<ApiResponse<Client>> {
    return this.makeRequest<Client>(`/clients/${clientId}`);
  }

  // Mutual Fund Information
  async getMutualFunds(): Promise<ApiResponse<MutualFund[]>> {
    return this.makeRequest<MutualFund[]>('/schemes');
  }

  async getSchemeDetails(schemeCode: string): Promise<ApiResponse<MutualFund>> {
    return this.makeRequest<MutualFund>(`/schemes/${schemeCode}`);
  }

  // Transaction Operations
  async purchaseTransaction(request: PurchaseRequest): Promise<ApiResponse<Transaction>> {
    return this.makeRequest<Transaction>('/transactions/purchase', 'POST', request);
  }

  async redeemTransaction(request: RedeemRequest): Promise<ApiResponse<Transaction>> {
    return this.makeRequest<Transaction>('/transactions/redeem', 'POST', request);
  }

  async switchTransaction(request: SwitchRequest): Promise<ApiResponse<Transaction>> {
    return this.makeRequest<Transaction>('/transactions/switch', 'POST', request);
  }

  // Transaction History
  async getTransactionHistory(clientId: string): Promise<ApiResponse<Transaction[]>> {
    return this.makeRequest<Transaction[]>(`/transactions/history/${clientId}`);
  }

  async getTransactionStatus(transactionId: string): Promise<ApiResponse<Transaction>> {
    return this.makeRequest<Transaction>(`/transactions/status/${transactionId}`);
  }

  // Portfolio
  async getClientPortfolio(clientId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/portfolio/${clientId}`);
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }
}

export const bseApiService = new BSEApiService();