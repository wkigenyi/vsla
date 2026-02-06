import { useState } from "react";
import { FineractMember, AttendanceStatus } from "@/lib/types/fineract";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, ChevronRight, User } from "lucide-react";
import { MemberTransactionForm, MemberTransactions } from "./member-transaction-form";
import { cn } from "@/lib/utils";

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

            <div className="space-y-2">
                {presentMembers.map((member) => {
                    const hasData = !!transactions[member.id];
                    const summary = getTransactionSummary(member.id);

                    return (
                        <div
                            key={member.id}
                            onClick={() => handleMemberClick(member)}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer active:scale-[0.98]",
                                hasData
                                    ? "bg-primary/5 border-primary/20"
                                    : "bg-card hover:bg-muted/50 border-transparent shadow-sm"
                            )}
                        >
                            <Avatar className={cn("h-12 w-12 border-2", hasData ? "border-primary" : "border-muted")}>
                                <AvatarFallback className="font-bold text-lg">{getMemberInitials(member.displayName)}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0 grid gap-1">
                                <div className="font-semibold text-base truncate">{member.displayName}</div>
                                {summary ? (
                                    <div className="text-sm text-primary font-medium truncate flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> {summary}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Pending collection
                                    </div>
                                )}
                            </div>

                            <div className="text-muted-foreground">
                                {hasData ? (
                                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        </div>
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
