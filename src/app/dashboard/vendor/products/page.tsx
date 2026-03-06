"use client";

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Sparkles, Droplet, Package, Info, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { useToast } from "@/hooks/use-toast";

const initialProducts = [
  { id: 1, name: "Aqua Fresh 750ml", category: "Bottled Water", price: 200.00, stock: 500, status: "Active" },
  { id: 2, name: "Bulk Dispenser (19L)", category: "Bulk Supply", price: 1500.00, stock: 45, status: "Active" },
  { id: 3, name: "Sachet Pack (20pcs)", category: "Bags of Water", price: 500.00, stock: 200, status: "Low Stock" },
];

export default function VendorProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    features: '',
    description: ''
  });
  
  const { toast } = useToast();

  const handleAiGenerate = async () => {
    if (!newProduct.name || !newProduct.features) {
      toast({
        title: "Missing Information",
        description: "Please provide a product name and some key features for the AI.",
        variant: "destructive"
      });
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await generateProductDescription({
        productName: newProduct.name,
        keyFeatures: newProduct.features.split(',').map(f => f.trim())
      });
      
      setNewProduct(prev => ({ ...prev, description: result.description }));
      toast({
        title: "Success",
        description: "Compelling description generated successfully!"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating the description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Product Management</h1>
          <p className="text-muted-foreground">Manage your water listings and inventory.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Add New Water Product</DialogTitle>
              <DialogDescription>Fill in the details to list your product on AquaMart.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Pure Spring Water" 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={v => setNewProduct({...newProduct, category: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottled">Bottled Water</SelectItem>
                      <SelectItem value="bags">Bags of Water</SelectItem>
                      <SelectItem value="bulk">Bulk Supply</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Inventory Level</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="100" 
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Description Assistant
                  </Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-2 bg-white"
                    onClick={handleAiGenerate}
                    disabled={isAiLoading}
                  >
                    {isAiLoading ? "Generating..." : "Generate Description"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Enter key features separated by commas (e.g. mineral-rich, cold-pressed, recycled bottle)</p>
                <Input 
                  placeholder="Key features..." 
                  className="bg-white" 
                  value={newProduct.features}
                  onChange={e => setNewProduct({...newProduct, features: e.target.value})}
                />
                <Textarea 
                  placeholder="The generated description will appear here..." 
                  className="min-h-[120px] bg-white"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-11 rounded-xl">Create Listing</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Listings</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
            <Droplet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Stock</p>
            <p className="text-2xl font-bold">1,245 Units</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Orders</p>
            <p className="text-2xl font-bold">8 Pending</p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter products..." className="pl-10 h-10 rounded-lg max-w-sm" />
          </div>
          <Button variant="outline" className="rounded-lg h-10">Export CSV</Button>
        </div>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-muted/20">
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>₦{product.price.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${product.stock < 100 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    {product.stock} units
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={product.status === "Active" ? "default" : "outline"} className={product.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}