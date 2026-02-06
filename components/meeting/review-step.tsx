import { FineractMember, MeetingSessionState } from "@/lib/types/fineract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberTransactions } from "./member-transaction-form";
import { DisbursementData } from "./disbursement-step";
import { Separator } from "@/components/ui/separator";

interface ReviewStepProps {
  group: any;
  transactions: Record<number, MemberTransactions>;
  disbursementData: DisbursementData;
  onBack: () => void;
}

export function ReviewStep({ group, transactions, disbursementData, onBack }: ReviewStepProps) {
  const transactionValues = Object.values(transactions);
  const totalShares = transactionValues.reduce((sum, t) => sum + (t.shareCount || 0), 0);
  const totalSharesValue = totalShares * 5000; // Hardcoded strictly for now

  const totalSavings = transactionValues.reduce((sum, t) => sum + (t.savingsCents || 0), 0);

  const totalCharges = transactionValues.reduce((sum, t) => {
    return sum + (t.charges?.reduce((cSum, c) => cSum + c.amountCents, 0) || 0);
  }, 0);

  const totalLoans = transactionValues.reduce((sum, t) => {
    return sum + t.loanRepayments.reduce((lSum, l) => lSum + l.amountCents, 0);
  }, 0);

  const totalCollected = totalSharesValue + totalSavings + totalCharges + totalLoans;

  const totalExpenses = disbursementData.expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const cashToTreasurer = (disbursementData.openingBalanceCents + totalCollected) - totalExpenses - disbursementData.amountToBankCents;

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-safe">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Session Review</h2>
        <p className="text-muted-foreground">Confirm all totals before closing.</p>
      </div>

      {/* Primary Reconciliation Card */}
      <Card className="border-2 border-primary/20 shadow-lg bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg uppercase tracking-wider text-muted-foreground font-semibold">Net Cash Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Opening Balance</span>
              <span className="font-mono">{disbursementData.openingBalanceCents.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total Collected</span>
              <span className="font-mono text-green-600">+{totalCollected.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Expenses</span>
              <span className="font-mono text-red-500">-{totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Banked</span>
              <span className="font-mono text-red-500">-{disbursementData.amountToBankCents.toLocaleString()}</span>
            </div>
          </div>
          <Separator className="bg-primary/20" />
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-lg">Cash to Treasurer</span>
            <span className="font-bold text-3xl text-primary">{cashToTreasurer.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">UGX</span></span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdowns */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Collections</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Share Capital ({totalShares})</span>
              <span className="font-mono">{totalSharesValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Savings</span>
              <span className="font-mono">{totalSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Charges & Fees</span>
              <span className="font-mono">{totalCharges.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loan Repayments</span>
              <span className="font-mono">{totalLoans.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold pt-1">
              <span>Total In</span>
              <span>{totalCollected.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Outflows</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Meeting Expenses</span>
              <span className="font-mono">{totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Banked Amount</span>
              <span className="font-mono">{disbursementData.amountToBankCents.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold pt-1">
              <span>Total Out</span>
              <span>{(totalExpenses + disbursementData.amountToBankCents).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button size="lg" className="w-full text-lg h-12 shadow-md" onClick={() => alert("Submit Implementation Pending")}>
          Close Session
        </Button>
        <Button variant="ghost" className="w-full" onClick={onBack}>
          Back to Disbursements
        </Button>
      </div>
    </div>
  );
}
