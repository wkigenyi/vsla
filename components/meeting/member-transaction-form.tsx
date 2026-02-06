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
import { cn } from "@/lib/utils";

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
                        <Card className="border-none shadow-sm bg-card ring-1 ring-border">
                            <CardHeader className="pb-2 bg-muted/30 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <PieChart className="w-4 h-4 text-primary" />
                                        </div>
                                        <CardTitle className="text-base font-semibold">Shares</CardTitle>
                                    </div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        @ {SHARE_PRICE_UGX.toLocaleString()}/=
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="shares" className="sr-only">Number of Shares</Label>
                                        <Input
                                            id="shares"
                                            type="number"
                                            min="0"
                                            value={formData.shareCount || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSharesChange(e.target.value)}
                                            className="text-2xl h-14 font-medium text-center"
                                            placeholder="0"
                                        />
                                        <div className="text-xs text-center text-muted-foreground mt-1">
                                            Enter quantity
                                        </div>
                                    </div>
                                    <div className="text-2xl font-light text-muted-foreground">×</div>
                                    <div className="flex-1 bg-muted/30 rounded-lg h-14 flex flex-col items-center justify-center border border-muted">
                                        <span className="text-lg font-bold">
                                            {((formData.shareCount || 0) * SHARE_PRICE_UGX).toLocaleString()}
                                        </span>
                                        <span className="text-[10px] uppercase text-muted-foreground">Total (UGX)</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Savings Section */}
                        <Card className="border-none shadow-sm bg-card ring-1 ring-border">
                            <CardHeader className="pb-2 bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <Coins className="w-4 h-4 text-green-600" />
                                    </div>
                                    <CardTitle className="text-base font-semibold">Savings</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="savings" className="sr-only">Amount to Save</Label>
                                    <MoneyInput
                                        id="savings"
                                        value={formData.savingsCents || 0}
                                        onChange={(val) => setFormData(prev => ({ ...prev, savingsCents: val }))}
                                        className="text-2xl h-14 font-medium"
                                        placeholder="Amount"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Charges Section */}
                        <Card className="border-none shadow-sm bg-card ring-1 ring-border">
                            <CardHeader className="pb-2 bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                    <CardTitle className="text-base font-semibold">Charges & Fees</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid gap-3">
                                    {AVAILABLE_CHARGES.map((charge) => (
                                        <div
                                            key={charge.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer",
                                                isChargeApplied(charge.id)
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted bg-card hover:bg-muted/50"
                                            )}
                                            onClick={() => handleChargeToggle(charge.id, charge.name, charge.defaultAmount, !isChargeApplied(charge.id))}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={`charge-${charge.id}`}
                                                    checked={isChargeApplied(charge.id)}
                                                    onCheckedChange={() => { }} // Handled by div click
                                                    className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                />
                                                <div className="grid gap-0.5">
                                                    <Label
                                                        htmlFor={`charge-${charge.id}`}
                                                        className="font-medium cursor-pointer pointer-events-none text-base"
                                                    >
                                                        {charge.name}
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="font-mono font-medium">
                                                {charge.defaultAmount.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Loans Section */}
                        <Card className="border-none shadow-sm bg-card ring-1 ring-border">
                            <CardHeader className="pb-2 bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Briefcase className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <CardTitle className="text-base font-semibold">Loans</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {(!member.loans || member.loans.length === 0) && (
                                    <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                                        No active loans
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {member.loans?.map((loan) => (
                                        <div key={loan.id} className="p-4 border rounded-xl space-y-3 bg-card shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold">Loan #{loan.accountNo}</div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        Outstanding: <span className="font-mono text-foreground font-medium bg-muted px-1.5 py-0.5 rounded">{loan.totalOutstanding.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor={`loan-${loan.id}`}>Repayment</Label>
                                                <MoneyInput
                                                    id={`loan-${loan.id}`}
                                                    value={getLoanRepayment(loan.id) || 0}
                                                    onChange={(val) => handleLoanRepaymentChange(loan.id, val.toString())}
                                                    className="text-xl h-12"
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

                <div className="border-t bg-background p-4 sm:p-6 space-y-4 pb-safe">
                    <div className="flex justify-between items-center bg-muted/50 rounded-xl p-4">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total</span>
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
                        <Button variant="outline" size="lg" onClick={onClose} className="flex-1 h-12 text-base">
                            Cancel
                        </Button>
                        <Button type="submit" size="lg" form="transaction-form" className="flex-[2] h-12 text-base font-semibold shadow-md">
                            {isLastMember ? "Finish Collection" : "Save & Next"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
