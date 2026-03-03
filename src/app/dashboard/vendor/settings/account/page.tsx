"use client";

import React from 'react';
import { User, Mail, Phone, Lock, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AccountSettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">Manage your personal account details and security.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-6 text-foreground">
            <CardTitle className="text-lg">Personal Profile</CardTitle>
            <CardDescription>Your account credentials and identification.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl rounded-full">
                  <AvatarImage src="https://picsum.photos/seed/user1/200" />
                  <AvatarFallback>AP</AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-2 border-white">
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                    <Input id="firstName" defaultValue="Admin" className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                    <Input id="lastName" defaultValue="Aqua" className="bg-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" defaultValue="admin@aquapure.com" className="pl-10 bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 border-t flex justify-end bg-muted/10">
            <Button className="rounded-xl px-8 h-11">Save Profile</Button>
          </CardFooter>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-6 text-foreground">
            <CardTitle className="text-lg">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPass" className="text-foreground">Current Password</Label>
              <Input id="currentPass" type="password" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPass" className="text-foreground">New Password</Label>
                <Input id="newPass" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPass" className="text-foreground">Confirm New Password</Label>
                <Input id="confirmPass" type="password" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 border-t flex justify-end bg-muted/10">
            <Button variant="outline" className="rounded-xl px-8 h-11">Update Password</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}