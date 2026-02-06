import { useState } from "react";
import { FineractGroup, MeetingSessionState } from "@/lib/types/fineract";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { addToSyncQueue } from "@/lib/sync-queue";
import { Check, AlertCircle } from "lucide-react";

interface ReviewStepProps {
  group: FineractGroup;
  sessionState: MeetingSessionState;
  onBack: () => void;
}

export function ReviewStep({ group, sessionState, onBack }: ReviewStepProps) {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const presentMembers = sessionState.attendance.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length;
  const absentMembers = sessionState.attendance.filter((a) => a.status === "ABSENT").length;

  const totalShares = sessionState.shares.reduce((sum, s) => sum + s.amount, 0);
  const totalSocialFund = sessionState.socialFund.reduce((sum, s) => sum + s.amount, 0);
  const totalRepayments = sessionState.repayments.reduce((sum, r) => sum + r.amount, 0);
  const totalCashCollected = totalShares + totalSocialFund + totalRepayments;

  const handleSubmit = () => {
    // Add transactions to sync queue
    const today = new Date().toISOString().split("T")[0];

    // Queue attendance
    if (sessionState.meetingId) {
      const attendancePayload = {
        clientsAttendance: sessionState.attendance.map((a) => ({
          clientId: a.memberId,
          attendanceType: a.status === "PRESENT" ? 1 : a.status === "ABSENT" ? 2 : 3,
        })),
      };

      addToSyncQueue({
        type: "ATTENDANCE",
        endpoint: `/groups/${group.id}/meetings/${sessionState.meetingId}?command=saveAttendance`,
        method: "POST",
        body: attendancePayload,
      });
    }

    // Queue share deposits
    sessionState.shares.forEach((share) => {
      if (share.amount > 0) {
        const member = group.members?.find((m) => m.id === share.memberId);
        const savingsAccountId = member?.savingsAccounts?.[0]?.id;

        if (savingsAccountId) {
          addToSyncQueue({
            type: "DEPOSIT",
            endpoint: `/savingsaccounts/${savingsAccountId}/transactions?command=deposit`,
            method: "POST",
            body: {
              transactionDate: today,
              transactionAmount: share.amount,
              dateFormat: "yyyy-MM-dd",
              locale: "en",
              note: `${share.shares} shares purchased`,
            },
          });
        }
      }
    });

    // Queue social fund contributions
    sessionState.socialFund.forEach((contribution) => {
      if (contribution.amount > 0) {
        const member = group.members?.find((m) => m.id === contribution.memberId);
        const savingsAccountId = member?.savingsAccounts?.[0]?.id;

        if (savingsAccountId) {
          addToSyncQueue({
            type: "DEPOSIT",
            endpoint: `/savingsaccounts/${savingsAccountId}/transactions?command=deposit`,
            method: "POST",
            body: {
              transactionDate: today,
              transactionAmount: contribution.amount,
              dateFormat: "yyyy-MM-dd",
              locale: "en",
              note: "Social fund contribution",
            },
          });
        }
      }
    });

    // Queue loan repayments
    sessionState.repayments.forEach((repayment) => {
      if (repayment.amount > 0) {
        addToSyncQueue({
          type: "REPAYMENT",
          endpoint: `/loans/${repayment.loanId}/transactions?command=repayment`,
          method: "POST",
          body: {
            transactionDate: today,
            transactionAmount: repayment.amount,
            dateFormat: "yyyy-MM-dd",
            locale: "en",
          },
        });
      }
    });

    setIsSubmitted(true);
    setIsSubmitDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Step 4: Review & Submit</CardTitle>
          <CardDescription>
            Review all meeting data before submitting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Attendance Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Attendance</h3>
            <div className="flex gap-4">
              <Badge variant="default" className="text-base py-2 px-4">
                Present: {presentMembers}
              </Badge>
              <Badge variant="destructive" className="text-base py-2 px-4">
                Absent: {absentMembers}
              </Badge>
            </div>
          </div>

          {/* Financial Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Financial Summary</h3>
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shares Purchased:</span>
                <span className="font-mono font-semibold">{formatCurrency(totalShares)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Social Fund:</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(totalSocialFund)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Repayments:</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(totalRepayments)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-bold text-lg">Total Cash Collected:</span>
                <span className="font-mono font-bold text-lg text-primary">
                  {formatCurrency(totalCashCollected)}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Transaction Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Share Transactions:</span>
                <span className="font-semibold">
                  {sessionState.shares.filter((s) => s.amount > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Social Fund Transactions:</span>
                <span className="font-semibold">
                  {sessionState.socialFund.filter((s) => s.amount > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Repayment Transactions:</span>
                <span className="font-semibold">
                  {sessionState.repayments.filter((r) => r.amount > 0).length}
                </span>
              </div>
            </div>
          </div>

          {isSubmitted && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">Meeting Session Submitted</p>
                <p className="text-sm text-green-700">
                  Transactions have been queued and will sync when online
                </p>
              </div>
            </div>
          )}

          {!isSubmitted && totalCashCollected === 0 && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                No transactions recorded. Please go back and record meeting activities.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={onBack} variant="outline" size="lg" disabled={isSubmitted}>
            Back
          </Button>
          <Button
            onClick={() => setIsSubmitDialogOpen(true)}
            size="lg"
            disabled={isSubmitted}
          >
            Submit Meeting Session
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this meeting session? This will queue all
              transactions for processing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-semibold">Total Amount: {formatCurrency(totalCashCollected)}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {sessionState.shares.filter((s) => s.amount > 0).length +
                sessionState.socialFund.filter((s) => s.amount > 0).length +
                sessionState.repayments.filter((r) => r.amount > 0).length}{" "}
              transactions will be queued
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Confirm & Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
