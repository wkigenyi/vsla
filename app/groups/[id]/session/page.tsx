"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useGroup } from "@/lib/hooks/use-fineract";
import {
  MeetingSessionState,
  AttendanceStatus,
  FineractMember,
} from "@/lib/types/fineract";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttendanceStep } from "@/components/meeting/attendance-step";
import { CollectionStep } from "@/components/meeting/collection-step";
import { OpeningBalanceStep } from "@/components/meeting/opening-balance-step";
import { ReviewStep } from "@/components/meeting/review-step";
import { DisbursementStep, DisbursementData } from "@/components/meeting/disbursement-step";
import { MemberTransactions } from "@/components/meeting/member-transaction-form";
import { getPendingTransactionsCount, processSyncQueue } from "@/lib/sync-queue";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Step = "opening" | "attendance" | "collections" | "disbursement" | "review";

export default function MeetingSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const groupId = parseInt(resolvedParams.id);
  const { data: group, isLoading, error } = useGroup(groupId);
  const [step, setStep] = useState<Step>("opening");
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Unified State
  const [attendance, setAttendance] = useState<{ memberId: number; status: AttendanceStatus }[]>([]);
  // Map of MemberID -> Transactions
  const [transactions, setTransactions] = useState<Record<number, MemberTransactions>>({});
  const [openingBalance, setOpeningBalance] = useState(0);
  const [disbursementData, setDisbursementData] = useState<DisbursementData>({
    openingBalanceCents: 0,
    expenses: [],
    amountToBankCents: 0
  });

  const [presentMembers, setPresentMembers] = useState<FineractMember[]>([]);

  useEffect(() => {
    const updatePendingCount = () => {
      setPendingCount(getPendingTransactionsCount());
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Keep disbursement data in sync with opening balance
    setDisbursementData(prev => ({ ...prev, openingBalanceCents: openingBalance }));
  }, [openingBalance]);

  useEffect(() => {
    if (group && group.members) {
      const presentMemberIds = attendance
        .filter((a) => a.status === "PRESENT")
        .map((a) => a.memberId);
      setPresentMembers(group.members.filter((m) => presentMemberIds.includes(m.id)));
    }
  }, [attendance, group]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await processSyncQueue();
      setPendingCount(getPendingTransactionsCount());
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateAttendance = (memberId: number, status: AttendanceStatus) => {
    setAttendance((prev) => {
      const existing = prev.find((a) => a.memberId === memberId);
      if (existing) {
        return prev.map((a) => (a.memberId === memberId ? { ...a, status } : a));
      }
      return [...prev, { memberId, status }];
    });
  };

  const updateTransaction = (memberId: number, data: MemberTransactions) => {
    setTransactions((prev) => ({
      ...prev,
      [memberId]: data,
    }));
  };

  const totalCollectedCents = useMemo(() => {
    return Object.values(transactions).reduce((sum, t) => {
      const shares = (t.shareCount || 0) * 5000; // Assuming 50 cents per share, so 5000 cents
      const savings = t.savingsCents || 0;
      const charges = t.charges?.reduce((cSum, c) => cSum + c.amountCents, 0) || 0;
      const loans = t.loanRepayments.reduce((lSum, l) => lSum + l.amountCents, 0);
      return sum + shares + savings + charges + loans;
    }, 0);
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Group</CardTitle>
            <CardDescription>
              Failed to load group data. Please try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
            <p className="text-muted-foreground">Meeting Session</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Badge variant="secondary" className="mr-2">{pendingCount}</Badge>
              )}
              Sync Queue
            </Button>
          </div>
        </div>

        <Tabs value={step} onValueChange={(value) => setStep(value as Step)} className="w-full">
          {step !== "opening" && (
            <TabsList className="w-full flex justify-start overflow-x-auto h-auto p-1 bg-muted/50 mb-6">
              <TabsTrigger value="opening" className="flex-1 min-w-[100px]">Start</TabsTrigger>
              <TabsTrigger value="attendance" className="flex-1 min-w-[120px]">1. Attendance</TabsTrigger>
              <TabsTrigger value="collections" className="flex-1 min-w-[120px]">2. Collections</TabsTrigger>
              <TabsTrigger value="disbursement" className="flex-1 min-w-[120px]">3. Disbursement</TabsTrigger>
              <TabsTrigger value="review" className="flex-1 min-w-[100px]">4. Review</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="opening">
            <OpeningBalanceStep
              initialBalance={openingBalance}
              onSave={(balance) => {
                setOpeningBalance(balance);
                setStep("attendance");
              }}
            />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceStep
              members={group.members || []}
              attendance={attendance}
              onUpdateAttendance={updateAttendance}
              onNext={() => setStep("collections")}
            />
          </TabsContent>

          <TabsContent value="collections">
            <CollectionStep
              members={presentMembers}
              attendance={attendance}
              transactions={transactions}
              onUpdateTransaction={updateTransaction}
              onBack={() => setStep("attendance")}
              onNext={() => setStep("disbursement")}
            />
          </TabsContent>

          <TabsContent value="disbursement">
            <DisbursementStep
              totalCollectedCents={totalCollectedCents}
              initialData={disbursementData}
              onSave={(data) => {
                setDisbursementData(data);
                setStep("review");
              }}
              onBack={() => setStep("collections")}
            />
          </TabsContent>

          <TabsContent value="review">
            <ReviewStep
              group={group}
              transactions={transactions}
              disbursementData={disbursementData}
              onBack={() => setStep("disbursement")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
