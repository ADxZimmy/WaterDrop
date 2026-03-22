"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ChevronRight, Package, Truck } from 'lucide-react';
import type { OrderStatus } from "@/lib/domain/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ORDER_ACTIVE_STATUSES, getOrderStatusLabel } from "@/lib/orders/status";

type OrderRecord = {
  id: string;
  vendorName?: string;
  totalNaira: number;
  status: OrderStatus;
  executionEvents?: Array<{
    type: string;
    occurredAt: number;
    note?: string;
  }>;
  items: Array<{ name: string; quantity: number }>;
  createdAt: number;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const response = await fetch('/api/orders', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Unable to load orders.');
        }

        const payload = await response.json();
        if (isMounted) {
          setOrders(payload.orders ?? []);
        }
      } catch {
        if (isMounted) {
          setOrders([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-headline">My Orders</h1>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        ) : orders.length === 0 ? (
          <Card className="border-none shadow-sm p-8 text-center">
            <CardContent className="p-0 space-y-3">
              <h2 className="text-xl font-bold">No orders yet</h2>
              <p className="text-muted-foreground">Your completed and active orders will appear here.</p>
              <Link href="/">
                <Button className="rounded-xl">Browse Vendors</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isActive = ORDER_ACTIVE_STATUSES.has(order.status);
              const hasFailedAttempt = (order.executionEvents ?? []).some(
                (event) => event.type === "delivery_failed_attempt"
              );
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <Link key={order.id} href={`/dashboard/customer/orders/${order.id}`}>
                  <Card className={`border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group mb-4 ${isActive ? 'bg-primary/5 border border-primary/20' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 animate-pulse' : 'bg-muted text-muted-foreground'}`}>
                            {isActive ? <Truck className="h-6 w-6" /> : <Package className="h-6 w-6" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{order.vendorName ?? 'Water Vendor'}</h4>
                            <p className="text-xs text-muted-foreground">{orderDate} • {order.id}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={isActive ? 'bg-primary text-white border-none' : 'bg-green-50 text-green-700 border-green-200'}
                        >
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </div>
                      {hasFailedAttempt ? (
                        <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Delivery exception recorded. Open the order for details.
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                          </p>
                          <p className="font-bold text-primary">₦{order.totalNaira.toLocaleString()}</p>
                        </div>
                        {isActive ? (
                          <Button variant="default" size="sm" className="h-8 gap-1 rounded-lg">
                            Track Live <ChevronRight className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="h-8 gap-1 rounded-lg">
                            View Order <ChevronRight className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
