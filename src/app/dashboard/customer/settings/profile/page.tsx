
"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, Camera, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function CustomerProfileSettingsPage() {
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your information has been successfully saved."
    });
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/customer/settings">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-headline">My Profile</h1>
        </div>

        <form onSubmit={handleSave}>
          <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 text-center flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                  <AvatarImage src="https://picsum.photos/seed/user-44/200" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-9 w-9 bg-primary text-white border-2 border-white shadow-lg">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="mt-4 text-xl">John Doe</CardTitle>
              <CardDescription>Gold Member since Oct 2024</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" defaultValue="john.doe@example.com" className="pl-10 h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" type="tel" defaultValue="+1 (555) 000-1234" className="pl-10 h-12 rounded-xl" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 gap-2">
                <Save className="h-5 w-5" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
