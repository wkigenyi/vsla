import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { ArrowRight } from "lucide-react";

interface OpeningBalanceStepProps {
    initialBalance: number;
    onSave: (balance: number) => void;
}

export function OpeningBalanceStep({ initialBalance, onSave }: OpeningBalanceStepProps) {
    const [balance, setBalance] = useState(initialBalance);

    return (
        <div className="max-w-md mx-auto space-y-6 pt-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                <p className="text-muted-foreground">
                    Before starting the meeting, please verify the cash in the box.
                </p>
            </div>

            <Card className="border-2 border-primary/10 shadow-lg">
                <CardHeader>
                    <CardTitle>Cash Verification</CardTitle>
                    <CardDescription>
                        Enter the total cash amount counted from the previous sitting.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label htmlFor="opening-balance">Cash in Box</Label>
                        <MoneyInput
                            id="opening-balance"
                            value={balance}
                            onChange={setBalance}
                            className="text-2xl h-14 font-medium text-center"
                            placeholder="0"
                            autoFocus
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        size="lg"
                        className="w-full text-lg h-12"
                        onClick={() => onSave(balance)}
                    >
                        Confirm & Start Meeting <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
