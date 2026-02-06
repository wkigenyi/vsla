import { FineractMember, MemberAttendance, AttendanceStatus } from "@/lib/types/fineract";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AttendanceStepProps {
  members: FineractMember[];
  attendance: MemberAttendance[];
  onUpdateAttendance: (memberId: number, status: AttendanceStatus) => void;
  onNext: () => void;
}

export function AttendanceStep({
  members,
  attendance,
  onUpdateAttendance,
  onNext,
}: AttendanceStepProps) {
  const getAttendanceStatus = (memberId: number): AttendanceStatus | undefined => {
    return attendance.find((a) => a.memberId === memberId)?.status;
  };

  const allMarked = members.length > 0 && members.every((m) => getAttendanceStatus(m.id));

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
        <CardHeader className="px-0 sm:px-6">
          <CardTitle>Attendance</CardTitle>
          <CardDescription>
            Mark attendance for {members.length} members
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="grid gap-3">
            {members.length === 0 && (
              <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg">
                No members found in this group.
              </div>
            )}
            {members.map((member) => {
              const status = getAttendanceStatus(member.id);
              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card rounded-xl border shadow-sm gap-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {member.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-base">{member.displayName}</div>
                      {member.accountNo && (
                        <div className="text-xs text-muted-foreground">
                          Acc: {member.accountNo}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant={status === "PRESENT" ? "default" : "outline"}
                      onClick={() => onUpdateAttendance(member.id, "PRESENT")}
                      className={`h-12 sm:h-9 font-medium ${status === "PRESENT" ? "bg-green-600 hover:bg-green-700 rings-2 ring-green-600 ring-offset-2" : "hover:text-green-600 hover:border-green-600"}`}
                    >
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "ABSENT" ? "default" : "outline"}
                      onClick={() => onUpdateAttendance(member.id, "ABSENT")}
                      className={`h-12 sm:h-9 font-medium ${status === "ABSENT" ? "bg-red-600 hover:bg-red-700 ring-2 ring-red-600 ring-offset-2" : "hover:text-red-600 hover:border-red-600"}`}
                    >
                      Absent
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "LATE" ? "default" : "outline"}
                      onClick={() => onUpdateAttendance(member.id, "LATE")}
                      className={`h-12 sm:h-9 font-medium ${status === "LATE" ? "bg-amber-500 hover:bg-amber-600 ring-2 ring-amber-500 ring-offset-2" : "hover:text-amber-600 hover:border-amber-600"}`}
                    >
                      Late
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-10 sm:static sm:bg-transparent sm:border-0 sm:p-6 flex justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground hidden sm:block">
            {allMarked ? (
              <span className="text-green-600 flex items-center gap-1 font-medium">
                All marked
              </span>
            ) : (
              <span>{attendance.length} / {members.length} marked</span>
            )}
          </div>
          <Button
            onClick={onNext}
            disabled={!allMarked}
            size="lg"
            className="w-full sm:w-auto shadow-lg sm:shadow-none"
          >
            Continue to Collections
          </Button>
        </CardFooter>
      </Card>
      {/* Spacer for fixed footer on mobile */}
      <div className="h-24 sm:hidden" />
    </div>
  );
}
