import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  adminDeleteProduct,
  adminListCategories,
  adminListProducts,
  adminSaveProduct,
} from "@/lib/admin.functions";
import { formatKes } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  category_name: string | null;
  price_kes: number;
  compare_at_price_kes: number | null;
  image_url: string | null;
  stock: number;
  sizes: string[];
  featured: boolean;
  active: boolean;
};

type FormState = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: string;
  compareAt: string;
  imageUrl: string;
  stock: string;
  sizes: string;
  featured: boolean;
  active: boolean;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  categoryId: "",
  description: "",
  price: "",
  compareAt: "",
  imageUrl: "",
  stock: "0",
  sizes: "",
  featured: false,
  active: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminProducts() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);

  const products = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminListProducts(),
  });
  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminListCategories(),
  });

  const save = useMutation({
    mutationFn: (f: FormState) =>
      adminSaveProduct({
        data: {
          ...(f.id ? { id: f.id } : {}),
          name: f.name.trim(),
          slug: slugify(f.slug || f.name),
          categoryId: f.categoryId || null,
          description: f.description.trim(),
          priceKes: Number(f.price) || 0,
          compareAtPriceKes: f.compareAt.trim() === "" ? null : Number(f.compareAt),
          imageUrl: f.imageUrl.trim() || null,
          stock: Number(f.stock) || 0,
          sizes: f.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          featured: f.featured,
          active: f.active,
        },
      }),
    onSuccess: () => {
      toast.success("Product saved");
      setForm(null);
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      void qc.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteProduct({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      void qc.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (products.data ?? []) as unknown as ProductRow[];
  const cats = (categories.data ?? []) as { id: string; name: string }[];

  function edit(p: ProductRow) {
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryId: p.category_id ?? "",
      description: p.description ?? "",
      price: String(p.price_kes),
      compareAt: p.compare_at_price_kes == null ? "" : String(p.compare_at_price_kes),
      imageUrl: p.image_url ?? "",
      stock: String(p.stock),
      sizes: (p.sizes ?? []).join(", "),
      featured: p.featured,
      active: p.active,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-primary">Products</h2>
          <p className="text-sm text-muted-foreground">{rows.length} products in the catalogue</p>
        </div>
        <Button onClick={() => setForm({ ...emptyForm })}>
          <Plus className="mr-2 h-4 w-4" /> Add product
        </Button>
      </div>

      {form && (
        <form
          className="grid gap-4 rounded-2xl border bg-card p-6 shadow-sm md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: form.id ? form.slug : slugify(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-slug">URL slug</Label>
            <Input
              id="p-slug"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-cat">Category</Label>
            <select
              id="p-cat"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">No category</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-image">Image URL or storage path</Label>
            <Input
              id="p-image"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="/images/products/example.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-price">Price (KES)</Label>
            <Input
              id="p-price"
              type="number"
              min="0"
              step="1"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-compare">Compare-at price (optional)</Label>
            <Input
              id="p-compare"
              type="number"
              min="0"
              step="1"
              value={form.compareAt}
              onChange={(e) => setForm({ ...form, compareAt: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-stock">Stock</Label>
            <Input
              id="p-stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-sizes">Sizes (comma separated)</Label>
            <Input
              id="p-sizes"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              placeholder="0-3m, 3-6m, 6-12m"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-6 md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => setForm({ ...form, featured: v })}
              />
              Featured on home page
            </label>
          </div>
          <div className="flex gap-3 md:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.category_name ?? "—"}</td>
                <td className="p-3">{formatKes(p.price_kes)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <Badge variant={p.active ? "default" : "secondary"}>
                    {p.active ? "Active" : "Hidden"}
                  </Badge>
                  {p.featured && (
                    <Badge variant="outline" className="ml-2">
                      Featured
                    </Badge>
                  )}
                </td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => edit(p)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Delete"
                    onClick={() => {
                      if (confirm(`Delete "${p.name}"?`)) remove.mutate(p.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-muted-foreground" colSpan={6}>
                  {products.isLoading ? "Loading…" : "No products yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
