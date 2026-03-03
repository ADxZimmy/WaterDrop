"use client";

import React from 'react';
import { Bell, Clock, ShoppingBag, Users, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const notifications = [
  {
    id: 1,
    title: "Stock Alert",
    description: "Your '750ml Bottled Water' stock is below 50 units. Consider restocking.",
    time: "10 mins ago",
    type: "inventory",
    unread: true,
    icon: AlertCircle,
    color: "bg-red-100 text-red-600"
  },
  {
    id: 2,
    title: "New High Value Order",
    description: "Order #AQ-6689 from Alice Johnson for $125.00 is ready for confirmation.",
    time: "25 mins ago",
    type: "order",
    unread: true,
    icon: ShoppingBag,
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: 3,
    title: "Revenue Milestone",
    description: "Great job! You've reached your daily revenue target of $800.00.",
    time: "2 hours ago",
    type: "growth",
    unread: false,
    icon: TrendingUp,
    color: "bg-green-100 text-green-600"
  },
  {
    id: 4,
    title: "New Customer Review",
    description: "Daniel Lee left a 5-star review: 'Best water service in the area!'",
    time: "5 hours ago",
    type: "customer",
    unread: false,
    icon: Users,
    color: "bg-purple-100 text-purple-600"
  }
];

export default function VendorNotificationsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Notifications</h1>
          <p className="text-muted-foreground">Keep track of your store's performance and alerts.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="h-9 px-4 cursor-pointer hover:bg-muted">Settings</Badge>
          <Badge variant="default" className="h-9 px-4 cursor-pointer">Mark all read</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <Card key={notif.id} className={`border-none shadow-sm overflow-hidden hover:shadow-md transition-all group ${notif.unread ? 'bg-primary/5' : 'bg-white'}`}>
            <CardContent className="p-6 flex gap-6">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${notif.color}`}>
                <notif.icon className="h-7 w-7" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className={`text-lg font-bold ${notif.unread ? 'text-primary' : ''}`}>{notif.title}</h4>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {notif.time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{notif.description}</p>
                {notif.unread && (
                  <Badge className="bg-primary text-[10px] h-5 px-2">NEW</Badge>
                )}
              </div>
              <div className="flex items-center">
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
