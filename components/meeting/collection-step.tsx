import { useState } from "react";
import { FineractMember, AttendanceStatus } from "@/lib/types/fineract";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, ChevronRight, User } from "lucide-react";
import { MemberTransactionForm, MemberTransactions } from "./member-transaction-form";

interface CollectionStepProps {
    members: FineractMember[];
    attendance: { memberId: number; status: AttendanceStatus }[];
    transactions: Record<number, MemberTransactions>;
    onUpdateTransaction: (memberId: number, data: MemberTransactions) => void;
    onNext: () => void;
    onBack: () => void;
}

export function CollectionStep({
    members,
    attendance,
    transactions,
    onUpdateTransaction,
    onNext,
    onBack,
}: CollectionStepProps) {
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

    // Filter out absent members
    const presentMembers = members.filter((m) => {
        const status = attendance.find((a) => a.memberId === m.id)?.status;
        return status === "PRESENT" || status === "LATE";
    });

    const handleMemberClick = (member: FineractMember) => {
        setSelectedMemberId(member.id);
    };

    const handleSaveTransaction = (data: MemberTransactions) => {
        if (selectedMemberId === null) return;

        onUpdateTransaction(selectedMemberId, data);

        // Auto-advance logic
        const currentIndex = presentMembers.findIndex(m => m.id === selectedMemberId);
        if (currentIndex < presentMembers.length - 1) {
            setTimeout(() => {
                setSelectedMemberId(presentMembers[currentIndex + 1].id);
            }, 300); // Small delay for UX transition
        } else {
            setSelectedMemberId(null);
        }
    };

    const getTransactionSummary = (memberId: number) => {
        const data = transactions[memberId];
        if (!data) return null;

        const items = [];
        if (data.shareCount > 0) items.push(`${data.shareCount} Shares`);
        const loanTotal = data.loanRepayments.reduce((sum, r) => sum + r.amountCents, 0);
        if (loanTotal > 0) items.push(`Loans: ${loanTotal}`);

        return items.join(" • ");
    };

    const getMemberInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const selectedMember = members.find(m => m.id === selectedMemberId);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                <div>
                    <h2 className="text-xl font-semibold">Collections</h2>
                    <p className="text-sm text-muted-foreground">
                        Tap a member to record their transactions
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">
                        {Object.keys(transactions).length} / {presentMembers.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                </div>
            </div>

            <div className="grid gap-3">
                {presentMembers.map((member) => {
                    const hasData = !!transactions[member.id];
                    const summary = getTransactionSummary(member.id);

                    return (
                        <Card
                            key={member.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${hasData ? "border-primary/40 bg-primary/5" : ""
                                }`}
                            onClick={() => handleMemberClick(member)}
                        >
                            <CardContent className="p-4 flex items-center gap-4">
                                <Avatar className={hasData ? "border-2 border-primary" : ""}>
                                    <AvatarFallback>{getMemberInitials(member.displayName)}</AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{member.displayName}</div>
                                    {summary ? (
                                        <div className="text-sm text-primary font-medium truncate">
                                            {summary}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground">Pending collection</div>
                                    )}
                                </div>

                                <div className="text-muted-foreground">
                                    {hasData ? (
                                        <CheckCircle2 className="w-6 h-6 text-primary" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {presentMembers.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No members marked as Present or Late. Go back to Attendance.
                </div>
            )}

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>
                    Back to Attendance
                </Button>
                <Button onClick={onNext} disabled={Object.keys(transactions).length === 0}>
                    Review Session
                </Button>
            </div>

            {selectedMember && (
                <MemberTransactionForm
                    isOpen={!!selectedMemberId}
                    onClose={() => setSelectedMemberId(null)}
                    member={selectedMember}
                    initialData={transactions[selectedMember.id] || {
                        memberId: selectedMember.id,
                        savingsCents: 0,
                        shareCount: 0,
                        loanRepayments: [],
                    }}
                    onSave={handleSaveTransaction}
                    isLastMember={presentMembers[presentMembers.length - 1].id === selectedMember.id}
                />
            )}
        </div>
    );
}
