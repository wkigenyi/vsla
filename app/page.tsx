import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">BANKAYO Lite</CardTitle>
          <CardDescription>
            Village Savings and Loan Association Management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a group to start a meeting session
          </p>
          <Link href="/groups/1/session">
            <Button className="w-full" size="lg">
              Start Demo Meeting Session
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
