"use client";

import React from 'react';
import Link from 'next/link';
import { Bell, Clock, Info, CheckCircle2, ChevronRight, Package, DollarSign } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const notifications = [
  {
    id: 1,
    title: "New Delivery Assigned",
    description: "You have been assigned order #AQ-5521. Head to Aqua Pure Factory for pickup.",
    time: "2 mins ago",
    type: "order",
    href: "/dashboard/driver",
    unread: true,
    icon: Package,
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: 2,
    title: "Withdrawal Successful",
    description: "Your withdrawal request for $150.00 has been processed successfully.",
    time: "1 hour ago",
    type: "payment",
    href: "/dashboard/driver/withdrawals",
    unread: false,
    icon: DollarSign,
    color: "bg-green-100 text-green-600"
  },
  {
    id: 3,
    title: "System Maintenance",
    description: "WaterDrop will undergo brief maintenance tonight at 12:00 AM.",
    time: "4 hours ago",
    type: "info",
    href: "#",
    unread: false,
    icon: Info,
    color: "bg-yellow-100 text-yellow-600"
  },
  {
    id: 4,
    title: "New Achievement!",
    description: "Congratulations! You've completed 50 deliveries this week.",
    time: "Yesterday",
    type: "success",
    href: "/dashboard/driver/profile",
    unread: false,
    icon: CheckCircle2,
    color: "bg-purple-100 text-purple-600"
  }
];

export default function DriverNotificationsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your latest activities.</p>
        </div>
        <Badge variant="outline" className="h-8 cursor-pointer hover:bg-muted">Mark all as read</Badge>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Link key={notif.id} href={notif.href}>
            <Card className={`border-none shadow-sm overflow-hidden hover:shadow-md transition-all group mb-3 ${notif.unread ? 'bg-primary/5 border-l-4 border-primary' : 'bg-white border-l-4 border-transparent'}`}>
              <CardContent className="p-4 flex gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.color}`}>
                  <notif.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-sm ${notif.unread ? 'text-primary' : ''}`}>{notif.title}</h4>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {notif.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.description}</p>
                  {notif.unread && (
                    <Badge className="bg-primary h-1.5 w-1.5 p-0 rounded-full mt-2"></Badge>
                  )}
                </div>
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
