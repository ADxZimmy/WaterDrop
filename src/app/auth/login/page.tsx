
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Droplets, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [role, setRole] = useState<string>('customer');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock navigation based on selected role
    if (role === 'vendor') {
      router.push('/dashboard/vendor');
    } else if (role === 'driver') {
      router.push('/dashboard/driver');
    } else {
      router.push('/dashboard/customer');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6 text-primary group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to home</span>
        </Link>
        <div className="flex justify-center mb-4">
          <Droplets className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-foreground font-headline">
          Welcome back to AquaMart
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to manage your water orders or storefront.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground text-center p-6 pb-4">
            <CardTitle>Login</CardTitle>
            <CardDescription className="text-primary-foreground/80">Choose your account type</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="customer" onValueChange={setRole} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="vendor">Vendor</TabsTrigger>
                <TabsTrigger value="driver">Driver</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="name@example.com" className="pl-10" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" className="pl-10" required />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl shadow-lg shadow-primary/20">
                  Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="bg-muted/50 p-6 flex flex-col gap-4">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/auth/register" className="text-primary font-bold hover:underline">Register Now</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
