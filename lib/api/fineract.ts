import {
  FineractGroup,
  DepositPayload,
  RepaymentPayload,
  AttendancePayload,
} from "@/lib/types/fineract";

const FINERACT_BASE_URL =
  process.env.NEXT_PUBLIC_FINERACT_API_URL || "https://demo.fineract.dev/fineract-provider/api/v1";
const FINERACT_TENANT = process.env.NEXT_PUBLIC_FINERACT_TENANT || "default";

// For demo purposes, using basic auth. In production, use proper authentication
const authHeader = "Basic " + btoa("mifos:password");

export async function fetchGroup(groupId: number): Promise<FineractGroup> {
  // For demo purposes, return mock data if API is not available
  try {
    const response = await fetch(
      `${FINERACT_BASE_URL}/groups/${groupId}?associations=clientMembers,savingsAccounts,loans`,
      {
        headers: {
          "Fineract-Platform-TenantId": FINERACT_TENANT,
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch group");
    }

    return await response.json();
  } catch (error) {
    // Return mock data for demo
    return getMockGroup(groupId);
  }
}

export async function saveAttendance(
  groupId: number,
  meetingId: number,
  payload: AttendancePayload
): Promise<any> {
  const response = await fetch(
    `${FINERACT_BASE_URL}/groups/${groupId}/meetings/${meetingId}?command=saveAttendance`,
    {
      method: "POST",
      headers: {
        "Fineract-Platform-TenantId": FINERACT_TENANT,
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to save attendance");
  }

  return await response.json();
}

export async function depositToSavingsAccount(
  accountId: number,
  payload: DepositPayload
): Promise<any> {
  const response = await fetch(
    `${FINERACT_BASE_URL}/savingsaccounts/${accountId}/transactions?command=deposit`,
    {
      method: "POST",
      headers: {
        "Fineract-Platform-TenantId": FINERACT_TENANT,
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to deposit");
  }

  return await response.json();
}

export async function repayLoan(
  loanId: number,
  payload: RepaymentPayload
): Promise<any> {
  const response = await fetch(
    `${FINERACT_BASE_URL}/loans/${loanId}/transactions?command=repayment`,
    {
      method: "POST",
      headers: {
        "Fineract-Platform-TenantId": FINERACT_TENANT,
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to repay loan");
  }

  return await response.json();
}

// Mock data for demo purposes
function getMockGroup(groupId: number): FineractGroup {
  return {
    id: groupId,
    name: "Nakaseke VSLA Group",
    accountNo: `GRP-${groupId}`,
    status: {
      id: 300,
      code: "groupStatusType.active",
      value: "Active",
    },
    active: true,
    members: [
      {
        id: 1,
        firstname: "Mary",
        lastname: "Nakato",
        displayName: "Mary Nakato",
        accountNo: "CLI-001",
        status: {
          id: 300,
          code: "clientStatusType.active",
          value: "Active",
        },
        savingsAccounts: [
          {
            id: 101,
            accountNo: "SAV-001",
            accountBalance: 50000,
            currency: {
              code: "UGX",
              name: "Ugandan Shilling",
              displaySymbol: "USh",
            },
            status: {
              id: 300,
              code: "savingsAccountStatusType.active",
              value: "Active",
            },
          },
        ],
        loans: [
          {
            id: 201,
            accountNo: "LON-001",
            principalAmount: 100000,
            principalOutstanding: 75000,
            totalOutstanding: 80000,
            currency: {
              code: "UGX",
              name: "Ugandan Shilling",
              displaySymbol: "USh",
            },
            status: {
              id: 300,
              code: "loanStatusType.active",
              value: "Active",
              active: true,
            },
          },
        ],
      },
      {
        id: 2,
        firstname: "John",
        lastname: "Okello",
        displayName: "John Okello",
        accountNo: "CLI-002",
        status: {
          id: 300,
          code: "clientStatusType.active",
          value: "Active",
        },
        savingsAccounts: [
          {
            id: 102,
            accountNo: "SAV-002",
            accountBalance: 75000,
            currency: {
              code: "UGX",
              name: "Ugandan Shilling",
              displaySymbol: "USh",
            },
            status: {
              id: 300,
              code: "savingsAccountStatusType.active",
              value: "Active",
            },
          },
        ],
        loans: [],
      },
      {
        id: 3,
        firstname: "Grace",
        lastname: "Namutebi",
        displayName: "Grace Namutebi",
        accountNo: "CLI-003",
        status: {
          id: 300,
          code: "clientStatusType.active",
          value: "Active",
        },
        savingsAccounts: [
          {
            id: 103,
            accountNo: "SAV-003",
            accountBalance: 30000,
            currency: {
              code: "UGX",
              name: "Ugandan Shilling",
              displaySymbol: "USh",
            },
            status: {
              id: 300,
              code: "savingsAccountStatusType.active",
              value: "Active",
            },
          },
        ],
        loans: [
          {
            id: 203,
            accountNo: "LON-003",
            principalAmount: 50000,
            principalOutstanding: 30000,
            totalOutstanding: 32000,
            currency: {
              code: "UGX",
              name: "Ugandan Shilling",
              displaySymbol: "USh",
            },
            status: {
              id: 300,
              code: "loanStatusType.active",
              value: "Active",
              active: true,
            },
          },
        ],
      },
      {
        id: 4,
        firstname: "Peter",
        lastname: "Mugisha",
        displayName: "Peter Mugisha",
        accountNo: "CLI-004",
        status: {
          id: 300,
          code: "clientStatusType.active",
          value: "Active",
        },
        savingsAccounts: [
          {
            id: 104,
            accountNo: "SAV-004",
            accountBalance: 120000,
            currency: {
              code: "UGX",
              name: "Ugandan Shilling",
              displaySymbol: "USh",
            },
            status: {
              id: 300,
              code: "savingsAccountStatusType.active",
              value: "Active",
            },
          },
        ],
        loans: [],
      },
    ],
  };
}
