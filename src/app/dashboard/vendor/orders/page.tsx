import React from 'react';
import { ShoppingBag, Truck, CheckCircle, Clock, Search, Filter, ArrowUpRight, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const orders = [
  { id: "AQ-5521", customer: "Alice Johnson", items: "5x Premium Bottled", total: 62.50, status: "Pending", time: "5m ago" },
  { id: "AQ-5522", customer: "Bob Wilson", items: "10x Sachet Packs", total: 35.00, status: "Preparing", time: "12m ago" },
  { id: "AQ-5523", customer: "Clara Davis", items: "2x 19L Dispenser", total: 30.00, status: "Dispatched", time: "45m ago" },
  { id: "AQ-5524", customer: "Daniel Lee", items: "20x 750ml Individual", total: 24.00, status: "Delivered", time: "1h ago" },
];

export default function VendorOrdersPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Order Fulfillment</h1>
          <p className="text-muted-foreground">Manage and track your incoming water orders.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl h-11 px-6">Export Orders</Button>
          <Button className="rounded-xl h-11 px-6">View Analytics</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> 20% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Preparation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Average time: 15m</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out for Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-primary mt-1">Real-time tracking active</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">$842.00</div>
            <p className="text-xs text-muted-foreground mt-1">Across 42 deliveries</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders by ID or customer..." className="pl-10 h-10 rounded-lg" />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] h-10 rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/10 group">
                <TableCell className="font-bold text-primary">{order.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {order.customer}
                  </div>
                </TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {order.time}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`rounded-full px-3 ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : 
                      order.status === 'Preparing' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                      order.status === 'Dispatched' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' :
                      'bg-green-100 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Select defaultValue={order.status.toLowerCase()}>
                    <SelectTrigger className="w-[130px] h-8 text-xs ml-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="dispatched">Dispatched</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}