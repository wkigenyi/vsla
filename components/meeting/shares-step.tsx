import { FineractMember, MemberAttendance, SharePurchase, SocialFundContribution } from "@/lib/types/fineract";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface SharesStepProps {
  members: FineractMember[];
  attendance: MemberAttendance[];
  shares: SharePurchase[];
  socialFund: SocialFundContribution[];
  onUpdateShares: (memberId: number, shares: number) => void;
  onUpdateSocialFund: (memberId: number, amount: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const SHARE_PRICE = 5000; // UGX per share
const SOCIAL_FUND_AMOUNT = 1000; // UGX flat rate

export function SharesStep({
  members,
  attendance,
  shares,
  socialFund,
  onUpdateShares,
  onUpdateSocialFund,
  onNext,
  onBack,
}: SharesStepProps) {
  const presentMembers = members.filter((m) =>
    attendance.find((a) => a.memberId === m.id && (a.status === "PRESENT" || a.status === "LATE"))
  );

  const getShares = (memberId: number): number => {
    return shares.find((s) => s.memberId === memberId)?.shares || 0;
  };

  const getSocialFund = (memberId: number): number => {
    return socialFund.find((s) => s.memberId === memberId)?.amount || 0;
  };

  const handleSharesChange = (memberId: number, delta: number) => {
    const currentShares = getShares(memberId);
    const newShares = Math.max(0, currentShares + delta);
    onUpdateShares(memberId, newShares);
  };

  const handleSocialFundToggle = (memberId: number) => {
    const current = getSocialFund(memberId);
    onUpdateSocialFund(memberId, current > 0 ? 0 : SOCIAL_FUND_AMOUNT);
  };

  const totalShares = shares.reduce((sum, s) => sum + s.amount, 0);
  const totalSocialFund = socialFund.reduce((sum, s) => sum + s.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Shares & Social Fund</CardTitle>
        <CardDescription>
          Record share purchases and social fund contributions for present members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Share Purchases</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Share Price: {formatCurrency(SHARE_PRICE)}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presentMembers.map((member) => {
                const memberShares = getShares(member.id);
                const amount = memberShares * SHARE_PRICE;
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.displayName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleSharesChange(member.id, -1)}
                          disabled={memberShares === 0}
                          className="h-10 w-10 touch-manipulation"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-2xl font-bold w-12 text-center">
                          {memberShares}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleSharesChange(member.id, 1)}
                          className="h-10 w-10 touch-manipulation"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(amount)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Social Fund (Insurance)</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Flat Rate: {formatCurrency(SOCIAL_FUND_AMOUNT)} per member
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Contributing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presentMembers.map((member) => {
                const isContributing = getSocialFund(member.id) > 0;
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.displayName}</TableCell>
                    <TableCell>
                      <Button
                        size="lg"
                        variant={isContributing ? "default" : "outline"}
                        onClick={() => handleSocialFundToggle(member.id)}
                        className="touch-manipulation"
                      >
                        {isContributing ? "Contributing" : "Not Contributing"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total Shares:</span>
            <span className="font-mono">{formatCurrency(totalShares)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total Social Fund:</span>
            <span className="font-mono">{formatCurrency(totalSocialFund)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Total Collected:</span>
            <span className="font-mono">{formatCurrency(totalShares + totalSocialFund)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          Next: Loan Repayments
        </Button>
      </CardFooter>
    </Card>
  );
}
