import Link from "next/link";
import { History, Navigation, Settings, Truck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sessionActions = [
  {
    title: "Current Work",
    description: "See assigned deliveries and next actions.",
    href: "/dashboard/driver",
    icon: Truck,
  },
  {
    title: "Earnings",
    description: "Review commissions, payouts, and ledger activity.",
    href: "/dashboard/driver/earnings",
    icon: Wallet,
  },
  {
    title: "Trip History",
    description: "Check completed and attempted delivery activity.",
    href: "/dashboard/driver/history",
    icon: History,
  },
  {
    title: "Profile",
    description: "Manage driver account and security settings.",
    href: "/dashboard/driver/profile",
    icon: Settings,
  },
];

export default function DriverSessionPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] bg-gradient-to-br from-primary to-cyan-600 p-6 text-white shadow-xl shadow-primary/10 lg:p-10">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">
              Driver session
            </p>
            <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Jump back into deliveries, earnings, and proof-of-delivery work.
            </h1>
            <p className="text-sm leading-6 text-white/80 sm:text-base">
              This protected session page gives driver navigation a stable role-owned landing point.
            </p>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sessionActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="h-full border-none shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex h-full flex-col gap-5 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-headline text-xl font-bold">{action.title}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/driver">
            <Button className="h-12 rounded-xl px-6">
              <Navigation className="mr-2 h-4 w-4" />
              Open Driver Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/driver/earnings">
            <Button variant="outline" className="h-12 rounded-xl px-6">
              Earnings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
