import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchGroup,
  saveAttendance,
  depositToSavingsAccount,
  repayLoan,
} from "@/lib/api/fineract";
import {
  AttendancePayload,
  DepositPayload,
  RepaymentPayload,
} from "@/lib/types/fineract";

export function useGroup(groupId: number) {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => fetchGroup(groupId),
  });
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      meetingId,
      payload,
    }: {
      groupId: number;
      meetingId: number;
      payload: AttendancePayload;
    }) => saveAttendance(groupId, meetingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      payload,
    }: {
      accountId: number;
      payload: DepositPayload;
    }) => depositToSavingsAccount(accountId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}

export function useRepayLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      loanId,
      payload,
    }: {
      loanId: number;
      payload: RepaymentPayload;
    }) => repayLoan(loanId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}
