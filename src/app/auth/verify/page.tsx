
"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Droplets, ShieldCheck, ArrowRight, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const email = searchParams.get('email') || 'your email/phone';
  const role = searchParams.get('role') || 'customer';

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the full 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification
    setTimeout(() => {
      toast({
        title: "Account Verified!",
        description: "You can now log in to your account."
      });
      router.push(`/auth/login?verified=true&role=${role}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/auth/register" className="flex items-center justify-center gap-2 mb-6 text-primary group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to sign up</span>
        </Link>
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <ShieldCheck className="h-10 w-10" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-foreground font-headline">
          Verify Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground px-4">
          We've sent a 6-digit verification code to <br /><span className="font-bold text-foreground">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground text-center p-8">
            <CardTitle>Enter Code</CardTitle>
            <CardDescription className="text-primary-foreground/80">Check your inbox or messages</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-10">
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="code" className="sr-only">Verification Code</Label>
                <Input 
                  id="code" 
                  placeholder="0 0 0 0 0 0" 
                  className="h-16 text-center text-3xl font-bold tracking-[0.5em] rounded-2xl border-2 focus:border-primary transition-all"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-2"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify Account"} 
                <ArrowRight className="h-5 w-5" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/30 p-6 flex flex-col gap-4 border-t">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Didn't receive the code? </span>
              <button className="text-primary font-bold hover:underline flex items-center justify-center gap-1 mx-auto mt-1">
                <RefreshCw className="h-3 w-3" /> Resend Code
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
