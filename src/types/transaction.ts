export interface Client {
  id: string;
  name: string;
  panCard: string;
  email: string;
  phone: string;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  bankDetails: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
}

export interface MutualFund {
  schemeCode: string;
  schemeName: string;
  amcCode: string;
  amcName: string;
  nav: number;
  minAmount: number;
  maxAmount: number;
  category: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface Transaction {
  id: string;
  clientId: string;
  transactionType: 'PURCHASE' | 'REDEEM' | 'SWITCH';
  schemeCode: string;
  amount?: number;
  units?: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  orderNumber?: string;
  timestamp: Date;
  remarks?: string;
}

export interface PurchaseRequest {
  clientId: string;
  schemeCode: string;
  amount: number;
  paymentMode: 'NETBANKING' | 'UPI' | 'DEBIT_CARD';
  sipFlag: boolean;
  sipFrequency?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export interface RedeemRequest {
  clientId: string;
  schemeCode: string;
  redeemType: 'AMOUNT' | 'UNITS' | 'ALL';
  amount?: number;
  units?: number;
}

export interface SwitchRequest {
  clientId: string;
  fromSchemeCode: string;
  toSchemeCode: string;
  switchType: 'AMOUNT' | 'UNITS' | 'ALL';
  amount?: number;
  units?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errorCode?: string;
}