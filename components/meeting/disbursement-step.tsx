import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface Expense {
    id: string;
    description: string;
    category: string;
    amountCents: number;
}

const EXPENSE_CATEGORIES = [
    "Transport",
    "Stationery",
    "Refreshments",
    "Airtime",
    "Other"
];

export interface DisbursementData {
    openingBalanceCents: number;
    expenses: Expense[];
    amountToBankCents: number;
}

interface DisbursementStepProps {
    totalCollectedCents: number;
    initialData: DisbursementData;
    onSave: (data: DisbursementData) => void;
    onBack: () => void;
}

export function DisbursementStep({ totalCollectedCents, initialData, onSave, onBack }: DisbursementStepProps) {
    const [openingBalance, setOpeningBalance] = useState(initialData.openingBalanceCents);
    const [expenses, setExpenses] = useState<Expense[]>(initialData.expenses);
    const [amountToBank, setAmountToBank] = useState(initialData.amountToBankCents);

    const handleAddExpense = () => {
        setExpenses([...expenses, { id: crypto.randomUUID(), category: "", description: "", amountCents: 0 }]);
    };

    const handleRemoveExpense = (id: string) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const handleExpenseChange = (id: string, field: keyof Expense, value: any) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amountCents, 0);
    const cashOnHand = openingBalance + totalCollectedCents;
    const cashToTreasurer = cashOnHand - totalExpenses - amountToBank;

    const handleContinue = () => {
        onSave({
            openingBalanceCents: openingBalance,
            expenses,
            amountToBankCents: amountToBank
        });
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Disbursements & Banking</h2>
                <div className="text-sm text-right">
                    <div className="text-muted-foreground">Total Collected</div>
                    <div className="font-bold text-lg text-primary">{totalCollectedCents.toLocaleString()} UGX</div>
                </div>
            </div>

            <Card className="bg-muted/30 border-dashed">
                <CardHeader className="py-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle className="text-base">Opening Balance Verified</CardTitle>
                            <CardDescription>Cash from previous session</CardDescription>
                        </div>
                        <div className="text-xl font-mono font-bold">
                            {openingBalance.toLocaleString()} UGX
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Meeting Expenses</CardTitle>
                        <CardDescription>Record any money spent during this meeting.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddExpense}>
                        <Plus className="w-4 h-4 mr-2" /> Add Expense
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {expenses.length === 0 && (
                        <div className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-lg">
                            No expenses recorded.
                        </div>
                    )}
                    {expenses.map((expense) => (
                        <div key={expense.id} className="flex flex-col md:flex-row gap-3 items-start p-4 border rounded-md bg-muted/10">
                            <div className="grid gap-4 flex-1 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Category</Label>
                                        <Select
                                            value={expense.category}
                                            onValueChange={(val) => handleExpenseChange(expense.id, "category", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EXPENSE_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Amount</Label>
                                        <MoneyInput
                                            value={expense.amountCents}
                                            onChange={(val) => handleExpenseChange(expense.id, "amountCents", val)}
                                            placeholder="Amount"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description / Comments</Label>
                                    <Input
                                        placeholder="Additional details (optional)..."
                                        value={expense.description}
                                        onChange={(e) => handleExpenseChange(expense.id, "description", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex md:block justify-end w-full md:w-auto mt-2 md:mt-8">
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveExpense(expense.id)} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {expenses.length > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-medium text-sm">Total Expenses</span>
                            <span className="font-bold text-red-600">-{totalExpenses.toLocaleString()} UGX</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Banking</CardTitle>
                    <CardDescription>How much money is being sent to the bank?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label htmlFor="banking">Amount to Bank</Label>
                        <MoneyInput
                            id="banking"
                            value={amountToBank}
                            onChange={setAmountToBank}
                            className="text-lg"
                            placeholder="Enter amount"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-muted/30 border-primary/20">
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Opening Balance</span>
                            <span>{openingBalance.toLocaleString()} UGX</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Collected</span>
                            <span>{totalCollectedCents.toLocaleString()} UGX</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Less Expenses</span>
                            <span className="text-red-500">({totalExpenses.toLocaleString()}) UGX</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Less Banked</span>
                            <span className="text-red-500">({amountToBank.toLocaleString()}) UGX</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-baseline">
                            <span className="font-bold text-lg">Cash to Treasurer</span>
                            <span className="font-bold text-2xl text-primary">{cashToTreasurer.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">UGX</span></span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
                <Button variant="outline" size="lg" onClick={onBack}>
                    Back to Collection
                </Button>
                <Button size="lg" onClick={handleContinue} className="gap-2">
                    Review Session <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
