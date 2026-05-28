"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus, CreditCard, Truck, MapPin, CheckCircle2, Zap, ShoppingBag } from 'lucide-react';
import type { CustomerAddress, PaymentMethod } from "@/lib/domain/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CartSkeleton } from "@/components/ui/loading-skeletons";
import { formatCustomerAddress, getDefaultCustomerAddress } from "@/lib/customer/preferences";
import { useToast } from "@/hooks/use-toast";
import { getPaymentMethodLabel } from "@/lib/orders/status";

type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceNaira: number;
};

type CartResponse = {
  cart: null | {
    vendorName: string;
    items: CartItem[];
  };
};

type OrderResponse = {
  order: {
    id: string;
  };
};

type CustomerPreferencesResponse = {
  preferences: null | {
    addresses: CustomerAddress[];
    preferredPaymentMethod: PaymentMethod;
  };
};

export default function CartPage() {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'priority'>('standard');
  const [cart, setCart] = useState<CartResponse["cart"]>(null);
  const [customerPreferences, setCustomerPreferences] = useState<CustomerPreferencesResponse["preferences"]>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cod');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadPageData = async () => {
      try {
        const [cartResponse, preferencesResponse] = await Promise.all([
          fetch('/api/cart', { method: 'GET' }),
          fetch('/api/customer/preferences', { method: 'GET' }),
        ]);

        if (!cartResponse.ok) {
          throw new Error('Unable to load cart.');
        }

        const cartPayload: CartResponse = await cartResponse.json();
        if (isMounted) {
          setCart(cartPayload.cart);
        }

        if (preferencesResponse.ok) {
          const preferencesPayload: CustomerPreferencesResponse = await preferencesResponse.json();
          const defaultAddress = getDefaultCustomerAddress(
            preferencesPayload.preferences?.addresses ?? []
          );

          if (isMounted) {
            setCustomerPreferences(preferencesPayload.preferences);
            setSelectedAddressId(defaultAddress?.id ?? null);
            setSelectedPaymentMethod(
              preferencesPayload.preferences?.preferredPaymentMethod ?? 'cod'
            );
          }
        }
      } catch (error) {
        if (isMounted) {
          setCart(null);
          toast({
            title: 'Cart Unavailable',
            description: error instanceof Error ? error.message : 'Unable to load cart.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPageData();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const subtotal = useMemo(
    () => (cart?.items ?? []).reduce((acc, item) => acc + item.unitPriceNaira * item.quantity, 0),
    [cart]
  );
  const deliveryFee = deliveryOption === 'standard' ? 0 : 1000;
  const total = subtotal + deliveryFee;
  const selectedAddress =
    customerPreferences?.addresses.find((address) => address.id === selectedAddressId) ??
    getDefaultCustomerAddress(customerPreferences?.addresses ?? []);

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to update cart.');
      }

      const payload: CartResponse = await response.json();
      setCart(payload.cart);
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Unable to update cart.',
        variant: 'destructive',
      });
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to remove item.');
      }

      const payload: CartResponse = await response.json();
      setCart(payload.cart);
    } catch (error) {
      toast({
        title: 'Remove Failed',
        description: error instanceof Error ? error.message : 'Unable to remove item.',
        variant: 'destructive',
      });
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: 'Address Required',
        description: 'Add and select a delivery address before placing your order.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryFeeNaira: deliveryFee,
          paymentMethod: selectedPaymentMethod,
          deliveryAddress: formatCustomerAddress(selectedAddress),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to place order.');
      }

      const payload: OrderResponse = await response.json();
      setOrderId(payload.order.id);
      setCart(null);
      setStep('success');

      if (
        customerPreferences &&
        customerPreferences.preferredPaymentMethod !== selectedPaymentMethod
      ) {
        const preferencesResponse = await fetch('/api/customer/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addresses: customerPreferences.addresses,
            preferredPaymentMethod: selectedPaymentMethod,
          }),
        });

        if (preferencesResponse.ok) {
          const preferencesPayload: CustomerPreferencesResponse =
            await preferencesResponse.json();
          setCustomerPreferences(preferencesPayload.preferences);
        }
      }
    } catch (error) {
      toast({
        title: 'Checkout Failed',
        description: error instanceof Error ? error.message : 'Unable to place order.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 animate-bounce">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold font-headline mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-8 max-w-xs">Your water order has been created and queued for fulfillment.</p>
        <div className="space-y-4 w-full max-w-xs">
          <Link href="/dashboard/customer/track-order">
            <Button className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/20">Track Order Now</Button>
          </Link>
          <Link href="/dashboard/customer/marketplace">
            <Button variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground">Go back to Marketplace</Button>
          </Link>
        </div>
        {orderId && <p className="mt-4 text-xs text-muted-foreground">Order ID: {orderId}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => step === 'checkout' ? setStep('cart') : router.push('/dashboard/customer/marketplace')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-headline">{step === 'cart' ? 'Shopping Cart' : 'Checkout'}</h1>
        </div>

        {!cart || cart.items.length === 0 ? (
          <Card className="overflow-hidden border-none bg-white shadow-sm">
            <CardContent className="space-y-6 p-8 text-center sm:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-headline">Your cart is ready for water</h2>
                <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
                  Choose a verified vendor, add the products you need, and come back here for a faster checkout.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/dashboard/customer/marketplace">
                  <Button className="h-12 w-full rounded-xl">Browse Vendors</Button>
                </Link>
                <Link href="/dashboard/customer/orders">
                  <Button variant="outline" className="h-12 w-full rounded-xl">
                    View My Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : step === 'cart' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Vendor</p>
              <p className="font-semibold">{cart.vendorName}</p>
            </div>

            <div className="space-y-4">
              {cart.items.map((item) => (
                <Card key={item.productId} className="border-none shadow-sm overflow-hidden">
                  <CardContent className="p-4 flex gap-4">
                    <div className="h-20 w-20 bg-muted rounded-xl shrink-0 flex items-center justify-center">
                      <Truck className="h-8 w-8 text-primary/20" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{cart.vendorName}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.productId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-primary">₦{item.unitPriceNaira.toLocaleString()}</p>
                        <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-lg mt-8 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">{deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₦{total.toLocaleString()}</span>
                </div>
              </div>
              <Button className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/20" onClick={() => setStep('checkout')}>
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-6">
              <section>
                <h3 className="font-bold mb-3 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Delivery Address</h3>
                {customerPreferences?.addresses.length ? (
                  <RadioGroup
                    value={selectedAddressId ?? undefined}
                    onValueChange={setSelectedAddressId}
                    className="space-y-2"
                  >
                    {customerPreferences.addresses.map((address) => (
                      <Label key={address.id} className="flex items-center justify-between p-4 bg-white rounded-xl border cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="relative h-5 w-5 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm">{address.label}</p>
                              {address.isDefault && (
                                <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-none">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {formatCustomerAddress(address)}
                            </p>
                          </div>
                        </div>
                        <RadioGroupItem value={address.id} />
                      </Label>
                    ))}
                  </RadioGroup>
                ) : (
                  <Card className="border-primary/15 bg-primary/5 shadow-sm">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Delivery address needed</h4>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Add or choose a default address before placing this order. This keeps checkout from failing at the final step.
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Link href="/dashboard/customer/settings/addresses">
                          <Button className="w-full rounded-xl">Add Address</Button>
                        </Link>
                        <Button variant="outline" className="w-full rounded-xl" onClick={() => setStep('cart')}>
                          Review Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>

              <section>
                <h3 className="font-bold mb-3 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payment Method</h3>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
                  className="space-y-2"
                >
                  <Label className="flex items-center justify-between p-4 bg-white rounded-xl border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">₦</div>
                      <div>
                        <p className="font-bold text-sm">{getPaymentMethodLabel('cod')}</p>
                        <p className="text-xs text-muted-foreground">Pay the rider or vendor when the order arrives.</p>
                      </div>
                    </div>
                    <RadioGroupItem value="cod" />
                  </Label>
                  <Label className="flex items-center justify-between p-4 bg-white rounded-xl border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">₦</div>
                      <div>
                        <p className="font-bold text-sm">{getPaymentMethodLabel('manual_transfer')}</p>
                        <p className="text-xs text-muted-foreground">Transfer details will be shared after the vendor accepts the order.</p>
                      </div>
                    </div>
                    <RadioGroupItem value="manual_transfer" />
                  </Label>
                </RadioGroup>
              </section>

              <section>
                <h3 className="font-bold mb-3 flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Delivery Options</h3>
                <RadioGroup
                  value={deliveryOption}
                  onValueChange={(v) => setDeliveryOption(v as 'standard' | 'priority')}
                  className="space-y-2"
                >
                  <Label className="flex items-center justify-between p-4 bg-white rounded-xl border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm">Standard Delivery</p>
                        <p className="text-xs text-muted-foreground">Arriving in 15-25 mins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">Free</Badge>
                      <RadioGroupItem value="standard" />
                    </div>
                  </Label>
                  <Label className="flex items-center justify-between p-4 bg-white rounded-xl border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-accent" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm text-accent">Priority Delivery</p>
                        <p className="text-xs text-muted-foreground">Arriving in 5-10 mins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-sm">₦1,000.00</p>
                      <RadioGroupItem value="priority" />
                    </div>
                  </Label>
                </RadioGroup>
              </section>
            </div>

            <Card className="border-none shadow-lg p-6 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">₦{total.toLocaleString()}</span>
              </div>
              <Button
                className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/20"
                onClick={placeOrder}
                disabled={isSubmitting || !selectedAddress}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
