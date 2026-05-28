"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Droplet,
  Edit2,
  Package,
  Plus,
  Power,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { Product } from "@/lib/domain/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type ProductRecord = Product;

type ProductFormState = {
  name: string;
  category: string;
  price: string;
  stock: string;
  features: string;
  description: string;
  isActive: boolean;
};

type VendorProductsResponse = {
  products: ProductRecord[];
};

const CATEGORY_OPTIONS = ["Bottled Water", "Bags of Water", "Bulk Supply"];
const LOW_STOCK_THRESHOLD = 100;

function createEmptyProductForm(): ProductFormState {
  return {
    name: "",
    category: "",
    price: "",
    stock: "",
    features: "",
    description: "",
    isActive: true,
  };
}

function getProductForm(product: ProductRecord): ProductFormState {
  return {
    name: product.name,
    category: product.category,
    price: String(product.priceNaira),
    stock: String(product.stock),
    features: "",
    description: product.description,
    isActive: product.isActive,
  };
}

function sortProducts(products: ProductRecord[]) {
  return [...products].sort((left, right) => right.updatedAt - left.updatedAt);
}

function upsertProduct(products: ProductRecord[], nextProduct: ProductRecord) {
  const existing = products.some((product) => product.id === nextProduct.id);
  return sortProducts(
    existing
      ? products.map((product) => (product.id === nextProduct.id ? nextProduct : product))
      : [nextProduct, ...products]
  );
}

function validateProductForm(form: ProductFormState) {
  if (
    !form.name.trim() ||
    !form.category.trim() ||
    !form.price.trim() ||
    !form.stock.trim() ||
    !form.description.trim()
  ) {
    return "Please complete all product fields before saving.";
  }

  const price = Number(form.price);
  if (Number.isNaN(price) || price < 0) {
    return "Price must be a valid non-negative number.";
  }

  const stock = Number(form.stock);
  if (!Number.isInteger(stock) || stock < 0) {
    return "Inventory level must be a valid whole number.";
  }

  return null;
}

function generateProductDescriptionDraft(form: ProductFormState) {
  const features = form.features
    .split(",")
    .map((feature) => feature.trim())
    .filter(Boolean);

  const intro = `${form.name.trim()} is a reliable ${form.category.trim().toLowerCase()} option built for consistent hydration and day-to-day delivery.`;
  const featureSentence =
    features.length > 0
      ? `Key highlights include ${features.join(", ")}.`
      : "It is prepared for customers who want dependable water supply with clear quality and convenience.";
  const closing =
    form.price.trim().length > 0
      ? `Positioned at ₦${Number(form.price || 0).toLocaleString("en-NG")}, it fits both routine household orders and repeat business demand.`
      : "It works well for both routine household orders and repeat business demand.";

  return [intro, featureSentence, closing].join(" ");
}

function ProductFormFields({
  form,
  setForm,
  includeStatus,
  onGenerateDescription,
  isAiLoading,
}: {
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  includeStatus: boolean;
  onGenerateDescription: () => void;
  isAiLoading: boolean;
}) {
  return (
    <div className="grid gap-6 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            placeholder="e.g. Pure Spring Water"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-category">Category</Label>
          <Select
            value={form.category || undefined}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, category: value }))
            }
          >
            <SelectTrigger id="product-category">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product-price">Price (₦)</Label>
          <Input
            id="product-price"
            type="number"
            placeholder="0.00"
            value={form.price}
            onChange={(event) =>
              setForm((current) => ({ ...current, price: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-stock">Inventory Level</Label>
          <Input
            id="product-stock"
            type="number"
            placeholder="100"
            value={form.stock}
            onChange={(event) =>
              setForm((current) => ({ ...current, stock: event.target.value }))
            }
          />
        </div>
      </div>

      {includeStatus && (
        <div className="space-y-2">
          <Label htmlFor="product-status">Storefront Status</Label>
          <Select
            value={form.isActive ? "active" : "inactive"}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, isActive: value === "active" }))
            }
          >
            <SelectTrigger id="product-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active in storefront</SelectItem>
              <SelectItem value="inactive">Hidden from storefront</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
        <div className="flex justify-between items-center gap-4">
          <Label className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Description Assistant
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-2 bg-white"
            onClick={onGenerateDescription}
            disabled={isAiLoading}
          >
            {isAiLoading ? "Generating..." : "Generate Description"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter key features separated by commas (e.g. mineral-rich, chilled, sealed bottle).
        </p>
        <Input
          placeholder="Key features..."
          className="bg-white"
          value={form.features}
          onChange={(event) =>
            setForm((current) => ({ ...current, features: event.target.value }))
          }
        />
        <Textarea
          placeholder="The generated description will appear here..."
          className="min-h-[120px] bg-white"
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
        />
      </div>
    </div>
  );
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ProductFormState>(createEmptyProductForm());
  const [editForm, setEditForm] = useState<ProductFormState>(createEmptyProductForm());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiTarget, setAiTarget] = useState<"create" | "edit" | null>(null);
  const [actionProductId, setActionProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await fetch('/api/vendor/products', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Unable to load products.');
        }

        const payload: VendorProductsResponse = await response.json();
        if (isMounted) {
          setProducts(sortProducts(payload.products ?? []));
        }
      } catch (error) {
        if (isMounted) {
          setProducts([]);
          toast({
            title: "Catalog unavailable",
            description: error instanceof Error ? error.message : "Unable to load products.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProducts();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.category, product.description]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [products, searchQuery]);

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const activeProducts = products.filter((product) => product.isActive).length;
  const lowStockProducts = products.filter(
    (product) => product.stock <= LOW_STOCK_THRESHOLD
  ).length;

  const handleGenerateDescription = async (target: "create" | "edit") => {
    const form = target === "create" ? createForm : editForm;

    if (!form.name.trim() || !form.features.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a product name and some key features first.",
        variant: "destructive",
      });
      return;
    }

    setAiTarget(target);
    try {
      const setForm = target === "create" ? setCreateForm : setEditForm;
      const description = generateProductDescriptionDraft(form);
      setForm((current) => ({ ...current, description }));
      toast({
        title: "Description Ready",
        description: "A product description draft has been generated successfully.",
      });
    } catch {
      toast({
        title: "Generation Failed",
        description: "There was an error generating the description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiTarget(null);
    }
  };

  const handleCreateProduct = async () => {
    const validationError = validateProductForm(createForm);
    if (validationError) {
      toast({
        title: "Missing Information",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name.trim(),
          category: createForm.category.trim(),
          priceNaira: Number(createForm.price),
          stock: Number(createForm.stock),
          description: createForm.description.trim(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to create product.');
      }

      const payload = await response.json();
      setProducts((current) => upsertProduct(current, payload.product));
      setCreateForm(createEmptyProductForm());
      setIsCreateDialogOpen(false);
      toast({
        title: "Product Created",
        description: "Your product is now saved in the vendor catalog.",
      });
    } catch (error) {
      toast({
        title: "Create Failed",
        description: error instanceof Error ? error.message : 'Unable to create product.',
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (product: ProductRecord) => {
    setEditingProductId(product.id);
    setEditForm(getProductForm(product));
    setIsEditDialogOpen(true);
  };

  const handleEditDialogChange = (open: boolean) => {
    if (!open && isEditing) {
      return;
    }

    setIsEditDialogOpen(open);
    if (!open) {
      setEditingProductId(null);
      setEditForm(createEmptyProductForm());
    }
  };

  const handleEditProduct = async () => {
    if (!editingProductId) {
      return;
    }

    const validationError = validateProductForm(editForm);
    if (validationError) {
      toast({
        title: "Missing Information",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch(`/api/vendor/products/${editingProductId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          category: editForm.category.trim(),
          priceNaira: Number(editForm.price),
          stock: Number(editForm.stock),
          description: editForm.description.trim(),
          isActive: editForm.isActive,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to update product.');
      }

      const payload = await response.json();
      setProducts((current) => upsertProduct(current, payload.product));
      setIsEditDialogOpen(false);
      setEditingProductId(null);
      setEditForm(createEmptyProductForm());
      toast({
        title: "Product Updated",
        description: "Your catalog changes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Unable to update product.',
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleQuickUpdate = async (
    productId: string,
    updates: Partial<Pick<ProductRecord, "stock" | "isActive">>,
    successMessage: string
  ) => {
    setActionProductId(productId);

    try {
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to update product.');
      }

      const payload = await response.json();
      setProducts((current) => upsertProduct(current, payload.product));
      toast({
        title: "Inventory Updated",
        description: successMessage,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Unable to update product.',
        variant: "destructive",
      });
    } finally {
      setActionProductId(null);
    }
  };

  const handleDeleteProduct = async (product: ProductRecord) => {
    setDeletingProductId(product.id);

    try {
      const response = await fetch(`/api/vendor/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to delete product.');
      }

      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast({
        title: "Product Deleted",
        description: `${product.name} has been removed from your catalog.`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : 'Unable to delete product.',
        variant: "destructive",
      });
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Product Management</h1>
          <p className="text-muted-foreground">Manage your water listings and inventory.</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Add New Water Product</DialogTitle>
              <DialogDescription>
                Fill in the details to list your product on WaterDrop.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateProduct();
              }}
            >
              <ProductFormFields
                form={createForm}
                setForm={setCreateForm}
                includeStatus={false}
                onGenerateDescription={() => void handleGenerateDescription("create")}
                isAiLoading={aiTarget === "create"}
              />
              <DialogFooter>
                <Button type="submit" className="w-full h-11 rounded-xl" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Listing'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update pricing, stock, description, or storefront visibility.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleEditProduct();
            }}
          >
            <ProductFormFields
              form={editForm}
              setForm={setEditForm}
              includeStatus
              onGenerateDescription={() => void handleGenerateDescription("edit")}
              isAiLoading={aiTarget === "edit"}
            />
            <DialogFooter>
              <Button type="submit" className="w-full h-11 rounded-xl" disabled={isEditing}>
                {isEditing ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Listings</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
            <Droplet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Stock</p>
            <p className="text-2xl font-bold">{totalStock} Units</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Power className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Products</p>
            <p className="text-2xl font-bold">{activeProducts}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
            <p className="text-2xl font-bold">{lowStockProducts}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter products by name, category, or description..."
              className="pl-10 h-10 rounded-lg"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {filteredProducts.length} of {products.length} product{products.length === 1 ? '' : 's'}
          </p>
        </div>

        {isLoading ? (
          <ListPageSkeleton rows={5} className="max-w-none px-0 py-0" />
        ) : products.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <h3 className="text-lg font-bold">No products listed yet</h3>
            <p className="text-sm text-muted-foreground">
              Start your catalog by creating the first water product for customers to browse.
            </p>
            <Button className="rounded-xl" onClick={() => setIsCreateDialogOpen(true)}>
              Add Your First Product
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <h3 className="text-lg font-bold">No matching products</h3>
            <p className="text-sm text-muted-foreground">
              Try a different search term or clear the current filter.
            </p>
            <Button variant="outline" className="rounded-xl" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= LOW_STOCK_THRESHOLD;
                const restockAmount = product.stock === 0 ? 50 : 25;
                const isBusy =
                  actionProductId === product.id ||
                  deletingProductId === product.id ||
                  (editingProductId === product.id && isEditing);

                return (
                  <TableRow key={product.id} className="hover:bg-muted/20 align-top">
                    <TableCell className="font-medium min-w-[240px]">
                      <div className="space-y-1">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-muted-foreground max-w-xs truncate">
                          {product.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₦{product.priceNaira.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              product.stock === 0
                                ? "bg-red-500"
                                : isLowStock
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            )}
                          />
                          <span>{product.stock} units</span>
                        </div>
                        {isLowStock && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg h-8"
                            onClick={() =>
                              void handleQuickUpdate(
                                product.id,
                                { stock: product.stock + restockAmount },
                                `${restockAmount} units were added to ${product.name}.`
                              )
                            }
                            disabled={isBusy}
                          >
                            Restock +{restockAmount}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge
                          variant={product.isActive ? "default" : "outline"}
                          className={
                            product.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                          }
                        >
                          {product.isActive ? "Active" : "Hidden"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg h-8"
                          onClick={() =>
                            void handleQuickUpdate(
                              product.id,
                              { isActive: !product.isActive },
                              product.isActive
                                ? `${product.name} has been hidden from the storefront.`
                                : `${product.name} is live in the storefront again.`
                            )
                          }
                          disabled={isBusy}
                        >
                          {product.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(product)}
                          disabled={isBusy}
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isBusy}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently removes the product from your Firestore catalog and storefront.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => void handleDeleteProduct(product)}
                              >
                                Delete Product
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
