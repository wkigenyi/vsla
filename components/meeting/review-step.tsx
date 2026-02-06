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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-right font-bold text-lg">
              {totalCollected.toLocaleString()}
            </div>

            <div className="text-muted-foreground">Opening Balance</div>
            <div className="text-right font-medium">
              {disbursementData.openingBalanceCents.toLocaleString()}
            </div>

            <div className="text-muted-foreground text-red-500">Less Expenses</div>
            <div className="text-right font-medium text-red-500">
              ({totalExpenses.toLocaleString()})
            </div>

            <div className="text-muted-foreground text-red-500">Banked</div>
            <div className="text-right font-medium text-red-500">
              ({disbursementData.amountToBankCents.toLocaleString()})
            </div>

            <div className="font-bold text-primary">Cash to Treasurer</div>
            <div className="text-right font-bold text-xl text-primary">
              {cashToTreasurer.toLocaleString()}
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Share Capital ({totalShares})</div>
            <div className="text-right">{totalSharesValue.toLocaleString()}</div>

            <div>Savings</div>
            <div className="text-right">{totalSavings.toLocaleString()}</div>

            <div>Charges & Fees</div>
            <div className="text-right">{totalCharges.toLocaleString()}</div>

            <div>Loan Repayments</div>
            <div className="text-right">{totalLoans.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Collections
        </Button>
        <Button onClick={() => alert("Submit Implementation Pending")}>
          Submit Session
        </Button>
      </div>
    </div>
  );
}
