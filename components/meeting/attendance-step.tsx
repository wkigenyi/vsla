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
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Mark Attendance</CardTitle>
        <CardDescription>
          Mark attendance for all members before proceeding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Account No</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const status = getAttendanceStatus(member.id);
              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.displayName}</TableCell>
                  <TableCell>{member.accountNo}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={status === "PRESENT" ? "default" : "outline"}
                        onClick={() => onUpdateAttendance(member.id, "PRESENT")}
                        className="touch-manipulation"
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={status === "ABSENT" ? "destructive" : "outline"}
                        onClick={() => onUpdateAttendance(member.id, "ABSENT")}
                        className="touch-manipulation"
                      >
                        Absent
                      </Button>
                      <Button
                        size="sm"
                        variant={status === "LATE" ? "secondary" : "outline"}
                        onClick={() => onUpdateAttendance(member.id, "LATE")}
                        className="touch-manipulation"
                      >
                        Late
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {members.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No members found in this group
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {allMarked ? (
            <Badge variant="default">All members marked</Badge>
          ) : (
            <Badge variant="secondary">
              {attendance.length} of {members.length} marked
            </Badge>
          )}
        </div>
        <Button onClick={onNext} disabled={!allMarked} size="lg">
          Next: Shares & Social Fund
        </Button>
      </CardFooter>
    </Card>
  );
}
