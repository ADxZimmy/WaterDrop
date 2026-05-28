"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import type {
  DeliveryProof,
  DriverAssignment,
  OrderDeliveryException,
  OrderExecutionEvent,
  OrderDriverPayout,
  OrderItem,
  OrderStatus,
  PaymentMethod,
} from "@/lib/domain/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getOrderExecutionEventDescription, getOrderExecutionEventLabel } from "@/lib/orders/execution";
import {
  ORDER_STATUS_STEPS,
  canCancelOrder,
  getNextProgressStatus,
  getOrderStatusLabel,
  getPaymentMethodLabel,
} from "@/lib/orders/status";
import { cn } from "@/lib/utils";

type VendorOrderRecord = {
  id: string;
  customerUid: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vendorName?: string;
  items: OrderItem[];
  subtotalNaira: number;
  deliveryFeeNaira: number;
  totalNaira: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  deliveryAddress?: string;
  driverAssignment?: DriverAssignment;
  driverPayout?: OrderDriverPayout;
  executionEvents: OrderExecutionEvent[];
  deliveryProof?: DeliveryProof;
  deliveryException?: OrderDeliveryException;
  deliveredAt?: number;
  createdAt: number;
  updatedAt: number;
};

type VendorDriverRecord = {
  uid: string;
  name: string;
  status: "pending" | "active" | "inactive";
  vehicleType?: string;
  licensePlate?: string;
  activeOrdersCount: number;
};

function getStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "accepted":
      return "bg-blue-100 text-blue-700";
    case "preparing":
      return "bg-indigo-100 text-indigo-700";
    case "out_for_delivery":
      return "bg-purple-100 text-purple-700";
    case "delivered":
      return "bg-emerald-100 text-emerald-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getPrimaryAction(status: OrderStatus) {
  const nextStatus = getNextProgressStatus(status);
  if (!nextStatus) {
    return null;
  }

  const labels: Record<OrderStatus, string> = {
    pending: "Review",
    accepted: "Accept order",
    preparing: "Start preparing",
    out_for_delivery: "Dispatch order",
    delivered: "Mark delivered",
    cancelled: "Cancel order",
  };

  return {
    nextStatus,
    label: labels[nextStatus],
  };
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [order, setOrder] = useState<VendorOrderRecord | null>(null);
  const [drivers, setDrivers] = useState<VendorDriverRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [exceptionMessage, setExceptionMessage] = useState("");

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      return null;
    }

    const response = await fetch(`/api/vendor/orders/${orderId}`, { method: "GET" });
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error ?? "Unable to load order.");
    }

    const payload = await response.json();
    return (payload.order ?? null) as VendorOrderRecord | null;
  }, [orderId]);

  useEffect(() => {
    let isMounted = true;

    const syncOrder = async () => {
      try {
        const nextOrder = await loadOrder();
        if (isMounted) {
          setOrder(nextOrder);
        }
      } catch (error) {
        if (isMounted) {
          setOrder(null);
          toast({
            title: "Order unavailable",
            description: error instanceof Error ? error.message : "Unable to load order.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void syncOrder();
    return () => {
      isMounted = false;
    };
  }, [loadOrder, toast]);

  useEffect(() => {
    let isMounted = true;

    const loadDrivers = async () => {
      try {
        const response = await fetch("/api/vendor/drivers", { method: "GET" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load drivers.");
        }

        if (isMounted) {
          setDrivers((payload?.drivers ?? []) as VendorDriverRecord[]);
        }
      } catch {
        if (isMounted) {
          setDrivers([]);
        }
      }
    };

    void loadDrivers();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeIndex = useMemo(() => {
    if (!order || order.status === "cancelled") {
      return -1;
    }

    return ORDER_STATUS_STEPS.findIndex((step) => step.key === order.status);
  }, [order]);

  const primaryAction =
    order && order.deliveryException?.state !== "open" ? getPrimaryAction(order.status) : null;
  const selectableDrivers = drivers.filter(
    (driverRecord) =>
      driverRecord.status === "active" || driverRecord.uid === order?.driverAssignment?.driverUid
  );

  const handleStatusUpdate = async (nextStatus: OrderStatus) => {
    if (!orderId) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to update order.");
      }

      const payload = await response.json();
      setOrder(payload.order ?? null);
      toast({
        title: "Order updated",
        description: `Order ${orderId.slice(0, 8)} is now ${getOrderStatusLabel(nextStatus).toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to update order.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResolveDeliveryException = async (
    resolution: "reschedule" | "return_to_vendor"
  ) => {
    if (!orderId) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryExceptionResolution: resolution,
          customerMessage: exceptionMessage.trim() ? exceptionMessage.trim() : undefined,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to resolve delivery exception.");
      }

      setOrder(payload.order ?? null);
      setExceptionMessage("");
      toast({
        title: "Exception handled",
        description:
          resolution === "reschedule"
            ? "The order is back in preparing for another delivery attempt."
            : "The order is back in preparing while items return from the route.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Unable to resolve delivery exception.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignDriver = async (value: string) => {
    if (!orderId) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedDriverUid: value === "unassigned" ? null : value,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to assign driver.");
      }

      setOrder(payload.order ?? null);
      toast({
        title: "Driver assignment updated",
        description:
          value === "unassigned"
            ? "The order is no longer assigned to a driver."
            : "The selected driver is now responsible for this order.",
      });
    } catch (error) {
      toast({
        title: "Assignment failed",
        description:
          error instanceof Error ? error.message : "Unable to assign driver.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <ListPageSkeleton rows={4} className="max-w-5xl md:px-8" />;
  }

  if (!order) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Card className="border-none shadow-sm p-8 text-center">
          <CardContent className="p-0 space-y-3">
            <h2 className="text-xl font-bold">Order not found</h2>
            <p className="text-muted-foreground">This order is no longer available in your vendor queue.</p>
            <Button className="rounded-xl" onClick={() => router.push("/dashboard/vendor/orders")}>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold font-headline">Order {order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-NG", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <Badge
          className={cn(
            "sm:ml-auto px-4 py-1 text-sm font-bold border-none w-fit",
            getStatusBadgeClass(order.status)
          )}
        >
          {getOrderStatusLabel(order.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 p-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center text-primary font-bold">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₦{item.unitPriceNaira.toLocaleString()} per unit
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-sm">
                      ₦{(item.unitPriceNaira * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₦{order.subtotalNaira.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">₦{order.deliveryFeeNaira.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₦{order.totalNaira.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Fulfillment Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {order.status === "cancelled" ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
                  <p className="font-bold">This order has been cancelled.</p>
                  <p className="text-sm mt-1">
                    The order will no longer progress through the delivery workflow.
                  </p>
                </div>
              ) : null}

              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-muted-foreground/20">
                {ORDER_STATUS_STEPS.map((step, index) => {
                  const done = activeIndex >= 0 && index <= activeIndex;
                  const active = index === activeIndex;

                  return (
                    <div key={step.key} className="relative flex items-start gap-8 pl-10">
                      <div
                        className={cn(
                          "absolute left-[-2px] h-4 w-4 rounded-full border-4 border-white shadow-sm",
                          done ? "bg-primary ring-4 ring-primary/20" : "bg-muted-foreground"
                        )}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className={cn("font-bold text-sm", active && "text-primary")}>
                            {step.title}
                          </h4>
                          {active ? (
                            <span className="text-xs text-primary font-medium">Current step</span>
                          ) : done ? (
                            <span className="text-xs text-muted-foreground">Completed</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Execution Events</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {order.executionEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-muted-foreground">
                  No execution events have been recorded yet.
                </div>
              ) : (
                order.executionEvents
                  .slice()
                  .sort((left, right) => right.occurredAt - left.occurredAt)
                  .map((event) => (
                    <div key={event.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4">
                      <Clock3 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">
                          {getOrderExecutionEventLabel(event.type)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getOrderExecutionEventDescription(event)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.occurredAt).toLocaleString("en-NG", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {order.deliveryException?.state === "open" && order.status === "out_for_delivery" ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-950">Open delivery exception</p>
                      <p className="text-sm text-amber-900 mt-1">
                        The driver reported a failed attempt. Choose how to continue before marking
                        delivered or dispatching again.
                      </p>
                    </div>
                  </div>
                  <Textarea
                    className="rounded-xl min-h-[88px] bg-white border-amber-200"
                    placeholder="Optional note to the customer (shown in their order view)"
                    value={exceptionMessage}
                    onChange={(event) => setExceptionMessage(event.target.value)}
                    disabled={isUpdating}
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      className="flex-1 rounded-xl"
                      disabled={isUpdating}
                      onClick={() => void handleResolveDeliveryException("reschedule")}
                    >
                      Reschedule delivery
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-amber-300"
                      disabled={isUpdating}
                      onClick={() => void handleResolveDeliveryException("return_to_vendor")}
                    >
                      Return to vendor
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Assigned driver
                </p>
                <Select
                  value={order.driverAssignment?.driverUid ?? "unassigned"}
                  onValueChange={(value) => void handleAssignDriver(value)}
                  disabled={isUpdating || order.status === "delivered" || order.status === "cancelled"}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {selectableDrivers.map((driverRecord) => (
                      <SelectItem key={driverRecord.uid} value={driverRecord.uid}>
                        {driverRecord.name} • {driverRecord.activeOrdersCount} active
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {order.driverAssignment
                    ? `Currently assigned to ${order.driverAssignment.driverName}.`
                    : "Assign a driver before dispatching this order."}
                </p>
              </div>

              {primaryAction ? (
                <Button
                  className="w-full h-11 rounded-xl gap-2"
                  disabled={isUpdating}
                  onClick={() => void handleStatusUpdate(primaryAction.nextStatus)}
                >
                  {primaryAction.nextStatus === "out_for_delivery" ? (
                    <Truck className="h-4 w-4" />
                  ) : primaryAction.nextStatus === "delivered" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Package className="h-4 w-4" />
                  )}
                  {isUpdating ? "Saving..." : primaryAction.label}
                </Button>
              ) : (
                <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                  This order has reached a final status and no further actions are available.
                </div>
              )}

              {canCancelOrder(order.status) && (
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  disabled={isUpdating}
                  onClick={() => void handleStatusUpdate("cancelled")}
                >
                  <XCircle className="h-4 w-4" />
                  Cancel order
                </Button>
              )}

              <div className="rounded-xl border border-border p-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  Last updated {formatDistanceToNow(order.updatedAt, { addSuffix: true })}
                </div>
              </div>

              {order.driverPayout ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Driver payout snapshot: ₦{order.driverPayout.amountNaira.toLocaleString("en-NG")} • {order.driverPayout.status}
                </div>
              ) : null}
              {order.deliveryProof ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-semibold">Proof of delivery</p>
                  <p className="mt-1">Recipient: {order.deliveryProof.recipientName}</p>
                  <p>
                    Confirmed{" "}
                    {new Date(order.deliveryProof.confirmedAt).toLocaleString("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  {order.deliveryProof.note ? (
                    <p className="mt-1">{order.deliveryProof.note}</p>
                  ) : null}
                </div>
              ) : order.status === "delivered" ? (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                  This order is delivered, but no driver-side proof-of-delivery record was stored.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {order.customerName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">Customer UID: {order.customerUid.slice(0, 8)}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Phone</p>
                    <p className="text-sm">{order.customerPhone ?? "No phone number saved"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Email</p>
                    <p className="text-sm">{order.customerEmail ?? "No email saved"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" /> Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Address</p>
                  <p className="text-sm">{order.deliveryAddress ?? "Delivery address unavailable"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Driver</p>
                  <p className="text-sm">
                    {order.driverAssignment?.driverName ?? "No driver assigned"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Receipt className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Payment Method</p>
                  <p className="text-sm">{getPaymentMethodLabel(order.paymentMethod)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
