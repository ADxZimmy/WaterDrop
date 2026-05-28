import Link from "next/link";
import { MapPin, Settings, ShoppingBag, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sessionActions = [
  {
    title: "Marketplace",
    description: "Browse approved vendors from your customer workspace.",
    href: "/dashboard/customer/marketplace",
    icon: Store,
  },
  {
    title: "Orders",
    description: "Review recent purchases and active deliveries.",
    href: "/dashboard/customer/orders",
    icon: ShoppingBag,
  },
  {
    title: "Track",
    description: "Jump into the latest live delivery status.",
    href: "/dashboard/customer/track-order",
    icon: Truck,
  },
  {
    title: "Addresses",
    description: "Keep delivery locations ready for fast checkout.",
    href: "/dashboard/customer/settings/addresses",
    icon: MapPin,
  },
];

export default function CustomerSessionPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-xl shadow-primary/10 lg:p-10">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-foreground/70">
              Customer session
            </p>
            <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Continue shopping and tracking without leaving your dashboard.
            </h1>
            <p className="text-sm leading-6 text-primary-foreground/80 sm:text-base">
              This protected session page is the customer-safe landing point for desktop and mobile navigation.
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
          <Link href="/dashboard/customer/marketplace">
            <Button className="h-12 rounded-xl px-6">Open Marketplace</Button>
          </Link>
          <Link href="/dashboard/customer/settings">
            <Button variant="outline" className="h-12 rounded-xl px-6">
              <Settings className="mr-2 h-4 w-4" />
              Customer Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
