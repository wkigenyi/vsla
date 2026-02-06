"use client";

import { useState, useEffect } from "react";
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
import { SharesStep } from "@/components/meeting/shares-step";
import { RepaymentsStep } from "@/components/meeting/repayments-step";
import { ReviewStep } from "@/components/meeting/review-step";
import { getPendingTransactionsCount, processSyncQueue } from "@/lib/sync-queue";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function MeetingSessionPage({ params }: { params: { id: string } }) {
  const groupId = parseInt(params.id);
  const { data: group, isLoading, error } = useGroup(groupId);
  const [activeTab, setActiveTab] = useState("attendance");
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const [sessionState, setSessionState] = useState<MeetingSessionState>({
    groupId,
    attendance: [],
    shares: [],
    socialFund: [],
    repayments: [],
  });

  useEffect(() => {
    const updatePendingCount = () => {
      setPendingCount(getPendingTransactionsCount());
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 1000);

    return () => clearInterval(interval);
  }, []);

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
    setSessionState((prev) => {
      const existing = prev.attendance.find((a) => a.memberId === memberId);
      if (existing) {
        return {
          ...prev,
          attendance: prev.attendance.map((a) =>
            a.memberId === memberId ? { ...a, status } : a
          ),
        };
      }
      return {
        ...prev,
        attendance: [...prev.attendance, { memberId, status }],
      };
    });
  };

  const updateShares = (memberId: number, shares: number) => {
    const SHARE_PRICE = 5000; // UGX per share
    setSessionState((prev) => {
      const existing = prev.shares.find((s) => s.memberId === memberId);
      if (existing) {
        return {
          ...prev,
          shares: prev.shares.map((s) =>
            s.memberId === memberId
              ? { ...s, shares, amount: shares * SHARE_PRICE }
              : s
          ),
        };
      }
      return {
        ...prev,
        shares: [...prev.shares, { memberId, shares, amount: shares * SHARE_PRICE }],
      };
    });
  };

  const updateSocialFund = (memberId: number, amount: number) => {
    setSessionState((prev) => {
      const existing = prev.socialFund.find((s) => s.memberId === memberId);
      if (existing) {
        return {
          ...prev,
          socialFund: prev.socialFund.map((s) =>
            s.memberId === memberId ? { ...s, amount } : s
          ),
        };
      }
      return {
        ...prev,
        socialFund: [...prev.socialFund, { memberId, amount }],
      };
    });
  };

  const updateRepayment = (memberId: number, loanId: number, amount: number) => {
    setSessionState((prev) => {
      const existing = prev.repayments.find(
        (r) => r.memberId === memberId && r.loanId === loanId
      );
      if (existing) {
        return {
          ...prev,
          repayments: prev.repayments.map((r) =>
            r.memberId === memberId && r.loanId === loanId ? { ...r, amount } : r
          ),
        };
      }
      return {
        ...prev,
        repayments: [...prev.repayments, { memberId, loanId, amount }],
      };
    });
  };

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
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground">Meeting Session</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {pendingCount} Pending
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync Now"
                )}
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="shares">Shares</TabsTrigger>
            <TabsTrigger value="repayments">Repayments</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <AttendanceStep
              members={group.members || []}
              attendance={sessionState.attendance}
              onUpdateAttendance={updateAttendance}
              onNext={() => setActiveTab("shares")}
            />
          </TabsContent>

          <TabsContent value="shares">
            <SharesStep
              members={group.members || []}
              attendance={sessionState.attendance}
              shares={sessionState.shares}
              socialFund={sessionState.socialFund}
              onUpdateShares={updateShares}
              onUpdateSocialFund={updateSocialFund}
              onNext={() => setActiveTab("repayments")}
              onBack={() => setActiveTab("attendance")}
            />
          </TabsContent>

          <TabsContent value="repayments">
            <RepaymentsStep
              members={group.members || []}
              repayments={sessionState.repayments}
              onUpdateRepayment={updateRepayment}
              onNext={() => setActiveTab("review")}
              onBack={() => setActiveTab("shares")}
            />
          </TabsContent>

          <TabsContent value="review">
            <ReviewStep
              group={group}
              sessionState={sessionState}
              onBack={() => setActiveTab("repayments")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
