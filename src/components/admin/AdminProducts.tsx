import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  adminDeleteProduct,
  adminListCategories,
  adminListProducts,
  adminSaveCategory,
  adminSaveProduct,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
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
  images: string[];
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
  hasDiscount: boolean;
  images: string[];
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
  hasDiscount: false,
  images: [],
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

function ImagePreview({ src }: { src: string }) {
  const [url, setUrl] = useState<string | null>(() =>
    src.startsWith("/") || src.startsWith("http") ? src : null,
  );

  useEffect(() => {
    if (src.startsWith("/") || src.startsWith("http")) return;
    let cancelled = false;
    supabase.storage
      .from("product-images")
      .createSignedUrl(src, 3600)
      .then(({ data }) => {
        if (!cancelled && data?.signedUrl) setUrl(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!url) {
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
        …
      </div>
    );
  }
  return <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />;
}

export function AdminProducts() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const products = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminListProducts(),
  });
  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminListCategories(),
  });

  const addCategory = useMutation({
    mutationFn: (name: string) =>
      adminSaveCategory({
        data: {
          name: name.trim(),
          slug: slugify(name),
          description: "",
          sortOrder: 0,
          active: true,
        },
      }),
    onSuccess: () => {
      toast.success("Category created");
      setNewCategory("");
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message),
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
          compareAtPriceKes:
            f.hasDiscount && f.compareAt.trim() !== "" ? Number(f.compareAt) : null,
          images: f.images,
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
      price: p.price_kes ? String(p.price_kes) : "",
      compareAt: p.compare_at_price_kes == null ? "" : String(p.compare_at_price_kes),
      hasDiscount: p.compare_at_price_kes != null,
      images: p.images ?? [],
      stock: String(p.stock),
      sizes: (p.sizes ?? []).join(", "),
      featured: p.featured,
      active: p.active,
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || !form) return;
    const accepted = ["image/png", "image/jpeg", "image/webp"];
    const list = Array.from(files);
    const invalid = list.find((f) => !accepted.includes(f.type));
    if (invalid) {
      toast.error("Only PNG, JPEG and WebP images are allowed");
      return;
    }
    const remaining = 3 - form.images.length;
    if (list.length > remaining) {
      toast.error(`You can add up to 3 images (${remaining} left)`);
      return;
    }
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of list) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `products/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (error) throw error;
        uploaded.push(path);
      }
      setForm({ ...form, images: [...form.images, ...uploaded] });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    if (!form) return;
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
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
            <div className="mt-2 flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="h-9 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={addCategory.isPending || newCategory.trim().length < 2}
                onClick={() => addCategory.mutate(newCategory)}
              >
                {addCategory.isPending ? "Adding…" : "Add"}
              </Button>
            </div>
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
            <Label htmlFor="p-price">
              Price (KES) <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="p-price"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Leave empty for price on request"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.hasDiscount}
                onCheckedChange={(v) => setForm({ ...form, hasDiscount: v })}
              />
              Add a discount
            </Label>
            {form.hasDiscount && (
              <Input
                id="p-compare"
                type="number"
                min="0"
                step="1"
                value={form.compareAt}
                onChange={(e) => setForm({ ...form, compareAt: e.target.value })}
                placeholder="Original (compare-at) price"
              />
            )}
            {form.hasDiscount && (
              <p className="text-xs text-muted-foreground">
                The original price will show struck through next to the discounted price.
              </p>
            )}
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
            <Label>Product images (PNG, JPEG or WebP — up to 3)</Label>
            <div className="flex flex-wrap items-center gap-3">
              {form.images.map((src, i) => (
                <div key={src} className="relative">
                  <ImagePreview src={src} />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => removeImage(i)}
                    className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              {form.images.length < 3 && (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:bg-secondary">
                  <ImagePlus className="size-5" />
                  {uploading ? "Uploading…" : "Upload"}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
              )}
            </div>
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
                <td className="p-3">
                  {p.price_kes ? (
                    formatKes(p.price_kes)
                  ) : (
                    <span className="text-muted-foreground">On request</span>
                  )}
                </td>
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
