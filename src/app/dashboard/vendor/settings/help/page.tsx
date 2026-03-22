"use client";

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Mail, Phone, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpSettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 text-foreground">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vendor/settings">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">Support & Help</h1>
          <p className="text-muted-foreground">Find answers and get assistance with your store.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-primary text-white">
          <CardContent className="p-8 space-y-4">
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Contact Support</h3>
              <p className="text-primary-foreground/80 text-sm mt-1">Our team is available 24/7 for urgent issues.</p>
            </div>
            <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-xl font-bold h-11">Start Live Chat</Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-8 space-y-4 flex flex-col justify-center h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Email Us</p>
                  <span className="text-sm font-medium">support@waterdrop.com</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Call Us</p>
                  <span className="text-sm font-medium">+1 (800) WATER-HELP</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-6 border-b">
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "How do I update my delivery radius?", a: "You can update your delivery radius in Store Settings > Public Storefront. Changes are reflected instantly for customers." },
              { q: "When are payouts processed?", a: "Payouts are processed daily. Depending on your bank, funds typically arrive within 24-48 hours of the transfer." },
              { q: "How do I add a new driver?", a: "Navigate to the Fleet management section and click 'Add Driver'. You'll need their basic info and vehicle details." },
              { q: "Can I manage multiple factory locations?", a: "Yes, our Enterprise plan allows you to manage multiple locations under one brand account. Contact sales for more info." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-muted">
                <AccordionTrigger className="font-bold hover:no-underline text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
