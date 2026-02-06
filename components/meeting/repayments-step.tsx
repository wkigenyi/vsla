import { FineractMember, LoanRepayment } from "@/lib/types/fineract";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface RepaymentsStepProps {
  members: FineractMember[];
  repayments: LoanRepayment[];
  onUpdateRepayment: (memberId: number, loanId: number, amount: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export function RepaymentsStep({
  members,
  repayments,
  onUpdateRepayment,
  onNext,
  onBack,
}: RepaymentsStepProps) {
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const membersWithLoans = members.filter(
    (m) => m.loans && m.loans.some((l) => l.status?.active)
  );

  const getRepaymentAmount = (memberId: number, loanId: number): number => {
    return (
      repayments.find((r) => r.memberId === memberId && r.loanId === loanId)?.amount || 0
    );
  };

  const handleAmountChange = (memberId: number, loanId: number, value: string) => {
    const key = `${memberId}-${loanId}`;
    setAmounts({ ...amounts, [key]: value });

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdateRepayment(memberId, loanId, numValue);
    }
  };

  const totalRepayments = repayments.reduce((sum, r) => sum + r.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Loan Repayments</CardTitle>
        <CardDescription>
          Record loan repayments for members with active loans
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {membersWithLoans.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Loan Account</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Repayment Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersWithLoans.map((member) => {
                const activeLoans = member.loans?.filter((l) => l.status?.active) || [];
                return activeLoans.map((loan) => {
                  const key = `${member.id}-${loan.id}`;
                  const currentAmount = amounts[key] || getRepaymentAmount(member.id, loan.id).toString();
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{member.displayName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{loan.accountNo}</div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(loan.totalOutstanding)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {loan.currency.displaySymbol}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={currentAmount}
                            onChange={(e) =>
                              handleAmountChange(member.id, loan.id, e.target.value)
                            }
                            className="w-32 px-3 py-2 text-lg border rounded-md touch-manipulation focus:ring-2 focus:ring-primary"
                            placeholder="0"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                });
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No members with active loans
          </p>
        )}

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-xl font-bold">
            <span>Total Repayments:</span>
            <span className="font-mono">{formatCurrency(totalRepayments)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          Next: Review & Submit
        </Button>
      </CardFooter>
    </Card>
  );
}
