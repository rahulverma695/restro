"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Upload, Download } from "lucide-react";

type Variant = { id: string; name: string; price: number };
type MenuItem = { id: string; name: string; price: number; isVeg: boolean; isAvailable: boolean; description: string | null; variants: Variant[] };
type Category = { id: string; name: string; isActive: boolean; menuItems: MenuItem[] };

const emptyForm = { name: "", price: "", description: "", isVeg: true, categoryId: "" };

export function MenuClient({ categories, restaurantId }: { categories: Category[]; restaurantId: string }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [itemDialog, setItemDialog] = useState(false);
  const [catDialog, setCatDialog] = useState(false);
  const [csvDialog, setCsvDialog] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [catName, setCatName] = useState("");
  const [form, setForm] = useState({ ...emptyForm, categoryId: categories[0]?.id || "" });
  const [variants, setVariants] = useState<{ name: string; price: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResult, setCsvResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentCategory = categories.find((c) => c.id === activeCategory);

  function openAddItem() {
    setEditItem(null);
    setForm({ ...emptyForm, categoryId: activeCategory });
    setVariants([]);
    setItemDialog(true);
  }

  function openEditItem(item: MenuItem) {
    setEditItem(item);
    setForm({ name: item.name, price: String(item.price), description: item.description || "", isVeg: item.isVeg, categoryId: activeCategory });
    setVariants(item.variants.map((v) => ({ name: v.name, price: String(v.price) })));
    setItemDialog(true);
  }

  async function saveItem() {
    if (!form.name || !form.price || !form.categoryId) return;
    setLoading(true);
    const url = editItem ? `/api/menu/items/${editItem.id}` : "/api/menu/items";
    await fetch(url, {
      method: editItem ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        restaurantId,
        variants: variants.filter((v) => v.name && v.price).map((v) => ({ name: v.name, price: Number(v.price) })),
      }),
    });
    setLoading(false);
    setItemDialog(false);
    setActiveCategory(form.categoryId);
    router.refresh();
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/menu/items/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function toggleItem(id: string, isAvailable: boolean) {
    await fetch(`/api/menu/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !isAvailable }),
    });
    router.refresh();
  }

  async function addCategory() {
    if (!catName.trim()) return;
    setLoading(true);
    await fetch("/api/menu/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName, restaurantId }),
    });
    setLoading(false);
    setCatDialog(false);
    setCatName("");
    router.refresh();
  }

  function addVariantRow() {
    setVariants((v) => [...v, { name: "", price: "" }]);
  }

  function updateVariant(i: number, field: "name" | "price", value: string) {
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }

  function removeVariant(i: number) {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  }

  function downloadTemplate() {
    const csv = [
      "name,category,description,price,type",
      "Paneer Tikka,Starters,Marinated cottage cheese grilled in tandoor,280,veg",
      "Butter Chicken,Main Course,Chicken in tomato butter cream sauce,380,non-veg",
      "Garlic Naan,Breads,Naan topped with garlic and coriander,70,veg",
      "Gulab Jamun,Desserts,Soft milk dumplings in sugar syrup,120,veg",
      "Masala Chai,Beverages,Spiced Indian tea,60,veg",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvLoading(true);
    setCsvResult(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/menu/bulk-upload", { method: "POST", body: formData });
    const data = await res.json();
    setCsvLoading(false);
    setCsvResult(data);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Category Sidebar */}
      <div className="w-56 flex flex-col" style={{ background: "#111", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>Categories</h2>
          <Dialog open={catDialog} onOpenChange={setCatDialog}>
            <DialogTrigger asChild>
              <button className="w-6 h-6 bg-orange-500 text-white rounded flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
              <Input placeholder="e.g. Starters" value={catName} onChange={(e) => setCatName(e.target.value)} />
              <Button onClick={addCategory} disabled={loading || !catName.trim()}>Add Category</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCategory === cat.id ? "bg-orange-500 text-white" : ""
              }`}
              style={activeCategory !== cat.id ? { color: "rgba(255,255,255,0.7)" } : {}}
              onMouseEnter={(e) => { if (activeCategory !== cat.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
              onMouseLeave={(e) => { if (activeCategory !== cat.id) (e.currentTarget as HTMLButtonElement).style.background = ""; }}
            >
              <span className="block truncate">{cat.name}</span>
              <span className={`text-xs ${activeCategory === cat.id ? "text-orange-100" : ""}`}
                style={activeCategory !== cat.id ? { color: "rgba(255,255,255,0.4)" } : {}}>
                {cat.menuItems.length} items
              </span>
            </button>
          ))}
          {categories.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.4)" }}>No categories yet</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#111" }}>
          <h1 className="text-lg font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>{currentCategory?.name || "Select a category"}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCsvDialog(true)}>
              <Upload className="w-4 h-4" /> Bulk Upload
            </Button>
            <Button onClick={openAddItem} disabled={categories.length === 0}>
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {categories.length === 0 ? (
            <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.4)" }}>
              <p>Create a category first, then add items.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentCategory?.menuItems.map((item) => (
                <div key={item.id} className={`rounded-xl p-4 ${!item.isAvailable ? "opacity-60" : ""}`}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${item.isVeg ? "border-green-500" : "border-red-500"}`}>
                        <div className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                      </div>
                      <span className="font-medium text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>{item.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleItem(item.id, item.isAvailable)} title={item.isAvailable ? "Mark unavailable" : "Mark available"}>
                        {item.isAvailable
                          ? <ToggleRight className="w-5 h-5 text-green-500" />
                          : <ToggleLeft className="w-5 h-5" style={{ color: "rgba(255,255,255,0.4)" }} />}
                      </button>
                      <button onClick={() => openEditItem(item)} style={{ color: "rgba(255,255,255,0.4)" }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "#3b82f6"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteItem(item.id)} style={{ color: "rgba(255,255,255,0.4)" }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {item.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: "rgba(255,255,255,0.5)" }}>{item.description}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-orange-500">{formatCurrency(item.price)}</span>
                    {!item.isAvailable && <Badge variant="secondary">Unavailable</Badge>}
                  </div>
                  {item.variants.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.variants.map((v) => (
                        <span key={v.id} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                          {v.name}: {formatCurrency(v.price)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {currentCategory?.menuItems.length === 0 && (
                <div className="col-span-full text-center py-16" style={{ color: "rgba(255,255,255,0.4)" }}>
                  No items in this category yet. Click &quot;Add Item&quot; to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Item Dialog */}
      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Category *</label>
              <select
                className="w-full rounded-lg px-3 py-2 text-sm mt-1"
                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Item Name *</label>
              <Input
                className="mt-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Paneer Butter Masala"
              />
            </div>

            <div>
              <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Base Price (₹) *</label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="250"
              />
            </div>

            <div>
              <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Description</label>
              <Input
                className="mt-1"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description (optional)"
              />
            </div>

            {/* Veg / Non-Veg */}
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: "rgba(255,255,255,0.8)" }}>Type</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isVeg: true })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border-2 transition-colors`}
                  style={form.isVeg
                    ? { borderColor: "#22c55e", background: "rgba(34,197,94,0.1)", color: "#4ade80" }
                    : { borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}
                >
                  <div className="w-3 h-3 rounded-sm border-2 border-green-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </div>
                  Veg
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isVeg: false })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border-2 transition-colors`}
                  style={!form.isVeg
                    ? { borderColor: "#ef4444", background: "rgba(239,68,68,0.1)", color: "#f87171" }
                    : { borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}
                >
                  <div className="w-3 h-3 rounded-sm border-2 border-red-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  </div>
                  Non-Veg
                </button>
              </div>
            </div>

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Variants (optional)</label>
                <button
                  type="button"
                  onClick={addVariantRow}
                  className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add variant
                </button>
              </div>
              <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>e.g. Small / Medium / Large with different prices</p>
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Name (e.g. Half)"
                    value={v.name}
                    onChange={(e) => updateVariant(i, "name", e.target.value)}
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    min={0}
                    value={v.price}
                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                    className="w-28"
                  />
                  <button type="button" onClick={() => removeVariant(i)} style={{ color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              onClick={saveItem}
              disabled={loading || !form.name || !form.price || !form.categoryId}
              className="w-full"
            >
              {loading ? "Saving..." : editItem ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog open={csvDialog} onOpenChange={(o) => { setCsvDialog(o); if (!o) setCsvResult(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Bulk Upload Menu via CSV</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="rounded-xl p-4 text-sm space-y-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>CSV Format</p>
              <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>name, category, description, price, type</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>type must be <strong>veg</strong> or <strong>non-veg</strong></p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Categories are created automatically if they don&apos;t exist</p>
            </div>

            <Button variant="outline" className="w-full" onClick={downloadTemplate}>
              <Download className="w-4 h-4" /> Download Sample Template
            </Button>

            <div className="border-2 border-dashed rounded-xl p-6 text-center" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
              <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.4)" }} />
              <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>Select your CSV file to upload</p>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" id="csv-input" />
              <label htmlFor="csv-input">
                <Button asChild disabled={csvLoading}>
                  <span className="cursor-pointer">
                    {csvLoading ? "Uploading..." : "Choose CSV File"}
                  </span>
                </Button>
              </label>
            </div>

            {csvResult && (
              <div className="rounded-xl p-4 text-sm" style={{
                background: csvResult.skipped === 0 ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                border: `1px solid ${csvResult.skipped === 0 ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}>
                <p className="font-semibold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>Upload complete</p>
                <p className="text-green-400">✓ {csvResult.created} items created</p>
                {csvResult.skipped > 0 && <p className="text-amber-400">⚠ {csvResult.skipped} rows skipped</p>}
                {csvResult.errors.slice(0, 3).map((e, i) => (
                  <p key={i} className="text-red-400 text-xs mt-1">{e}</p>
                ))}
                {csvResult.errors.length > 3 && (
                  <p className="text-red-400 text-xs">...and {csvResult.errors.length - 3} more errors</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
