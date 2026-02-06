import React, { useState, useEffect } from "react";
import { FineractMember, FineractLoan } from "@/lib/types/fineract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MoneyInput } from "@/components/ui/money-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PiggyBank, Briefcase, Coins, AlertCircle, PieChart } from "lucide-react";

interface MemberTransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    member: FineractMember;
    initialData: MemberTransactions;
    onSave: (data: MemberTransactions) => void;
    isLastMember: boolean;
}

export interface MemberTransactions {
    memberId: number;
    savingsCents: number; // Stored in cents/lowest unit
    shareCount: number;
    charges?: { feeId: string; name: string; amountCents: number }[];
    loanRepayments: { loanId: number; amountCents: number }[];
}

export function MemberTransactionForm({
    isOpen,
    onClose,
    member,
    initialData,
    onSave,
    isLastMember,
}: MemberTransactionFormProps) {
    const [formData, setFormData] = useState<MemberTransactions>(initialData);
    const SHARE_PRICE_UGX = 5000;

    const AVAILABLE_CHARGES = [
        { id: "dev_fee", name: "Development Fee", defaultAmount: 2000 },
        { id: "membership_fee", name: "Membership Fee", defaultAmount: 5000 },
    ];

    useEffect(() => {
        setFormData(initialData);
    }, [initialData, isOpen]);

    const handleSharesChange = (count: string) => {
        const val = parseInt(count) || 0;
        setFormData((prev) => ({ ...prev, shareCount: val }));
    };

    const handleSavingsChange = (amount: string) => {
        const val = parseInt(amount) || 0;
        setFormData((prev) => ({ ...prev, savingsCents: val }));
    };

    const handleChargeToggle = (feeId: string, name: string, defaultAmount: number, checked: boolean) => {
        setFormData((prev) => {
            let newCharges = prev.charges || [];
            if (checked) {
                // Add if not exists
                if (!newCharges.find(c => c.feeId === feeId)) {
                    newCharges = [...newCharges, { feeId, name, amountCents: defaultAmount }];
                }
            } else {
                // Remove
                newCharges = newCharges.filter(c => c.feeId !== feeId);
            }
            return { ...prev, charges: newCharges };
        });
    };

    const handleLoanRepaymentChange = (loanId: number, amount: string) => {
        const val = parseInt(amount) || 0;
        setFormData((prev) => {
            const existing = prev.loanRepayments.find((r) => r.loanId === loanId);
            let newRepayments;
            if (existing) {
                newRepayments = prev.loanRepayments.map((r) =>
                    r.loanId === loanId ? { ...r, amountCents: val } : r
                );
            } else {
                newRepayments = [...prev.loanRepayments, { loanId, amountCents: val }];
            }
            return { ...prev, loanRepayments: newRepayments };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    // Helper to get loan repayment amount safely
    const getLoanRepayment = (loanId: number) => {
        return formData.loanRepayments.find((r) => r.loanId === loanId)?.amountCents || 0;
    };

    const isChargeApplied = (feeId: string) => {
        return !!formData.charges?.find((c) => c.feeId === feeId);
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[100vw] sm:w-[540px] flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>{member.displayName}</SheetTitle>
                    <SheetDescription>
                        Enter collections for this member.
                    </SheetDescription>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                            <span className="uppercase text-xs tracking-wider opacity-70">Member #</span>
                            <span className="font-mono text-foreground">{member.id}</span>
                        </span>
                        {member.accountNo && (
                            <span className="flex items-center gap-1">
                                <span className="uppercase text-xs tracking-wider opacity-70">Acc No.</span>
                                <span className="font-mono text-foreground">{member.accountNo}</span>
                            </span>
                        )}
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 -mx-6 px-8 my-4">
                    <form id="transaction-form" onSubmit={handleSubmit} className="space-y-6 pb-6">
                        {/* Shares Section */}
                        <div className="space-y-4">





                            {/* Savings Section */}
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <Coins className="w-5 h-5 text-green-600" />
                                        <CardTitle className="text-lg">Savings</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2">
                                        <Label htmlFor="savings">Amount to Save</Label>
                                        <MoneyInput
                                            id="savings"
                                            value={formData.savingsCents || 0}
                                            onChange={(val) => setFormData(prev => ({ ...prev, savingsCents: val }))}
                                            className="text-lg"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-l-4 border-l-primary">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-lg"><Label htmlFor="shares">Number of Shares (@ {SHARE_PRICE_UGX.toLocaleString()})</Label>
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="shares"
                                            type="number"
                                            min="0"
                                            value={formData.shareCount || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSharesChange(e.target.value)}
                                            className="text-lg"
                                            placeholder="0"
                                        />
                                        <div className="min-w-[100px] text-right font-mono font-medium">
                                            {((formData.shareCount || 0) * SHARE_PRICE_UGX).toLocaleString()}
                                        </div>
                                    </div>
                                </CardContent>

                            </Card>
                        </div>




                        {/* Charges Section */}
                        <Card className="border-l-4 border-l-red-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <CardTitle className="text-lg">Charges & Fees</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {AVAILABLE_CHARGES.map((charge) => (
                                        <div key={charge.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={`charge-${charge.id}`}
                                                    checked={isChargeApplied(charge.id)}
                                                    onCheckedChange={(checked) => handleChargeToggle(charge.id, charge.name, charge.defaultAmount, checked as boolean)}
                                                />
                                                <div className="grid gap-0.5">
                                                    <Label
                                                        htmlFor={`charge-${charge.id}`}
                                                        className="font-medium cursor-pointer"
                                                    >
                                                        {charge.name}
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="font-mono font-medium">
                                                {charge.defaultAmount.toLocaleString()} <span className="text-xs text-muted-foreground">UGX</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>



                        {/* Loans Section */}

                        {/* Loans Section */}
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-500" />
                                    <CardTitle className="text-lg">Loans</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {(!member.loans || member.loans.length === 0) && (
                                    <div className="text-sm text-muted-foreground italic flex items-center gap-2 py-2">
                                        <AlertCircle className="w-4 h-4" /> No active loans
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {member.loans?.map((loan) => (
                                        <div key={loan.id} className="p-4 border rounded-lg space-y-3 bg-muted/20">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-lg">Loan #{loan.accountNo}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Outstanding: <span className="font-mono text-foreground font-medium">{loan.totalOutstanding.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor={`loan-${loan.id}`}>Repayment Amount</Label>
                                                <MoneyInput
                                                    id={`loan-${loan.id}`}
                                                    value={getLoanRepayment(loan.id) || 0}
                                                    onChange={(val) => handleLoanRepaymentChange(loan.id, val.toString())}
                                                    className="text-lg"
                                                    placeholder="Enter repayment"
                                                    max={loan.totalOutstanding}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </ScrollArea>

                <div className="border-t bg-muted/20 p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-card border rounded-lg p-4 shadow-sm">
                        <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Tendered</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-primary">
                                {(
                                    (formData.shareCount || 0) * SHARE_PRICE_UGX +
                                    (formData.savingsCents || 0) +
                                    (formData.charges?.reduce((sum, c) => sum + c.amountCents, 0) || 0) +
                                    (formData.loanRepayments.reduce((sum, r) => sum + r.amountCents, 0) || 0)
                                ).toLocaleString()}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">UGX</span>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full">
                        <Button variant="outline" size="lg" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" size="lg" form="transaction-form" className="flex-[2]">
                            {isLastMember ? "Save & Finish" : "Save & Next Member"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
