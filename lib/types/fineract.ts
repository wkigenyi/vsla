// Fineract API Type Definitions

export interface FineractMember {
  id: number;
  firstname: string;
  lastname: string;
  displayName: string;
  accountNo?: string;
  status?: {
    id: number;
    code: string;
    value: string;
  };
  savingsAccounts?: FineractSavingsAccount[];
  loans?: FineractLoan[];
}

export interface FineractGroup {
  id: number;
  name: string;
  accountNo: string;
  status: {
    id: number;
    code: string;
    value: string;
  };
  active: boolean;
  activationDate?: number[];
  members?: FineractMember[];
}

export interface FineractSavingsAccount {
  id: number;
  accountNo: string;
  accountBalance: number;
  currency: {
    code: string;
    name: string;
    displaySymbol: string;
  };
  status: {
    id: number;
    code: string;
    value: string;
  };
}

export interface FineractLoan {
  id: number;
  accountNo: string;
  principalAmount: number;
  principalOutstanding: number;
  totalOutstanding: number;
  currency: {
    code: string;
    name: string;
    displaySymbol: string;
  };
  status: {
    id: number;
    code: string;
    value: string;
    active?: boolean;
  };
}

// Meeting Session State Types

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface MemberAttendance {
  memberId: number;
  status: AttendanceStatus;
}

export interface SharePurchase {
  memberId: number;
  shares: number;
  amount: number;
}

export interface SocialFundContribution {
  memberId: number;
  amount: number;
}

export interface LoanRepayment {
  memberId: number;
  loanId: number;
  amount: number;
}

export interface MeetingSessionState {
  groupId: number;
  meetingId?: number;
  attendance: MemberAttendance[];
  shares: SharePurchase[];
  socialFund: SocialFundContribution[];
  repayments: LoanRepayment[];
}

// Sync Queue Types

export interface QueuedTransaction {
  id: string;
  type: "ATTENDANCE" | "DEPOSIT" | "REPAYMENT";
  endpoint: string;
  method: "POST" | "PUT";
  body: any;
  createdAt: number;
  retryCount: number;
  status: "PENDING" | "PROCESSING" | "FAILED";
}

// API Request/Response Types

export interface AttendancePayload {
  clientsAttendance: Array<{
    clientId: number;
    attendanceType: number; // 1=PRESENT, 2=ABSENT, 3=LATE
  }>;
}

export interface DepositPayload {
  transactionDate: string;
  transactionAmount: number;
  paymentTypeId?: number;
  note?: string;
  dateFormat: string;
  locale: string;
}

export interface RepaymentPayload {
  transactionDate: string;
  transactionAmount: number;
  paymentTypeId?: number;
  note?: string;
  dateFormat: string;
  locale: string;
}
