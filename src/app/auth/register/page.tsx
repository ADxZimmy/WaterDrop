
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Droplets, Mail, Lock, ArrowLeft, MapPin, Phone } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import type { PublicUserRole } from "@/lib/auth/routing";
import type { PaymentMethod } from "@/lib/domain/schemas";
import {
  formatRoleLabel,
  getRoleHomePath,
  normalizePublicRole,
  publicAuthRoles,
} from "@/lib/auth/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseClientAuth } from "@/lib/firebase/client";

function RegisterPageContent() {
  const [role, setRole] = useState<PublicUserRole>('customer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [addressLabel, setAddressLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const requestedRole = normalizePublicRole(searchParams.get("role"));
    if (requestedRole) {
      setRole(requestedRole);
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseClientAuth(),
        email,
        password
      );
      const idToken = await credential.user.getIdToken();

      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!sessionResponse.ok) {
        throw new Error('Unable to establish secure session.');
      }

      const profileResponse = await fetch('/api/auth/register-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          email,
          firstName,
          lastName,
          phone,
          customerOnboarding:
            role === 'customer'
              ? {
                  deliveryAddress: {
                    label: addressLabel,
                    street,
                    city,
                    state: addressState,
                    postalCode,
                    country,
                  },
                  preferredPaymentMethod,
                }
              : undefined,
        }),
      });

      if (!profileResponse.ok) {
        throw new Error('Unable to store profile.');
      }

      if (role === 'vendor') {
        router.push('/auth/onboarding/vendor');
      } else if (role === 'driver') {
        router.push('/auth/onboarding/driver');
      } else {
        router.push(getRoleHomePath('customer'));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast({
        title: 'Registration Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/auth/login" className="flex items-center justify-center gap-2 mb-6 text-primary group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to login</span>
        </Link>
        <div className="flex justify-center mb-4">
          <Droplets className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-foreground font-headline">
          Join WaterDrop
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Create your account to start ordering or selling water.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground text-center p-6 pb-4">
            <CardTitle>Sign Up</CardTitle>
            <CardDescription className="text-primary-foreground/80">Select your account type</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs
              value={role}
              onValueChange={(value) => {
                const nextRole = normalizePublicRole(value);
                if (nextRole) {
                  setRole(nextRole);
                }
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-8">
                {publicAuthRoles.map((accountRole) => (
                  <TabsTrigger key={accountRole} value={accountRole}>
                    {formatRoleLabel(accountRole)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+1 (555) 000-0000" 
                      className="pl-10" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {role === 'customer' ? (
                  <div className="space-y-4 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <p className="text-sm font-bold">Delivery setup</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="addressLabel">Address Label</Label>
                        <Input
                          id="addressLabel"
                          placeholder="Home"
                          required={role === 'customer'}
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          placeholder="Nigeria"
                          required={role === 'customer'}
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Delivery Address</Label>
                      <Input
                        id="street"
                        placeholder="Street, building, or landmark"
                        required={role === 'customer'}
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Lagos"
                          required={role === 'customer'}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="Lagos State"
                          required={role === 'customer'}
                          value={addressState}
                          onChange={(e) => setAddressState(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          placeholder="100001"
                          required={role === 'customer'}
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <Label>Preferred Payment Method</Label>
                      </div>
                      <RadioGroup
                        value={preferredPaymentMethod}
                        onValueChange={(value) => setPreferredPaymentMethod(value as PaymentMethod)}
                        className="grid gap-2 sm:grid-cols-2"
                      >
                        <Label className="flex cursor-pointer items-center justify-between rounded-xl border bg-white p-3 text-sm">
                          Cash on delivery
                          <RadioGroupItem value="cod" />
                        </Label>
                        <Label className="flex cursor-pointer items-center justify-between rounded-xl border bg-white p-3 text-sm">
                          Manual transfer
                          <RadioGroupItem value="manual_transfer" />
                        </Label>
                      </RadioGroup>
                    </div>
                  </div>
                ) : null}
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="bg-muted/50 p-6 flex flex-col gap-4">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/auth/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function RegisterPageFallback() {
  return <div className="min-h-screen bg-background" />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageFallback />}>
      <RegisterPageContent />
    </Suspense>
  );
}
