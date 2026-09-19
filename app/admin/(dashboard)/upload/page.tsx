'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import {
    RefreshCcw,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Wine,
    Info,
    ImageIcon,
    Layers,
    Loader2,
    Download,
    X,
    Trash2,
    Camera
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { useSettings } from '@/lib/useSettings';
import { auditImageQuality, standardizeImageCanvas } from '@/lib/engines/imageEngine';

const initialForm = {
  name: '',
  brand: '',
  category: 'wine',
  sku: '',
  model_number: '',
  price: '',
  cost_price: '',
  old_price: '',
  description: '',
  short_description: '',
  what_is_in_the_box: '',
  sizes: 'Standard',
  stock: '',
  low_stock_alert: '5',
  warehouse_location: '',
  sale_end_date: '',
  featured_rank: '99',
  is_featured: false,
  is_snack: false,
  is_best_seller: false,
  allow_backorders: false,
  hide_product: false,
  min_loyalty_tier: 'Explorer',
  is_dynamic_pricing: false,
  price_min: '',
  price_max: '',
  wholesale_price: '',
  wholesale_min_qty: '10',
  wholesale_stock_reserve: '0',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  weight_kg: '',
  length_cm: '',
  width_cm: '',
  height_cm: '',
};

interface Product {
  id: number;
  name: string;
  brand?: string;
  sku?: string;
  model_number?: string;
  price: number;
  cost_price: number;
  old_price?: number;
  description: string;
  short_description?: string;
  what_is_in_the_box?: string;
  image_url: string;
  video_url?: string;
  images: string[];
  sizes: string[];
  stock: number;
  low_stock_alert?: number;
  warehouse_location?: string;
  category: string;
  sale_end_date?: string;
  featured_rank?: number;
  is_featured?: boolean;
  is_snack?: boolean;
  is_best_seller?: boolean;
  allow_backorders?: boolean;
  hide_product?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  variant_stock?: Record<string, number>;
  beverage_specs?: Record<string, string>;
  status?: string;
  supplier_id?: number;
  min_loyalty_tier?: string;
  is_dynamic_pricing?: boolean;
  price_min?: number;
  price_max?: number;
  wholesale_price?: number;
  wholesale_min_qty?: number;
  wholesale_stock_reserve?: number;
}

export default function AdminUploadPage() {
    return (
        <Suspense fallback={<div className="p-24 text-center animate-pulse font-black text-slate-400 uppercase">Establishing Stock Sync...</div>}>
            <UploadContent />
        </Suspense>
    );
}

function UploadContent() {
  const { role } = useAdmin();
  const { settings } = useSettings();
  const [form, setForm] = useState(initialForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formSession, setFormSession] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Section States
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
      basic: true,
      pricing: true,
      inventory: true,
      description: true,
      media: true,
      shipping: false,
      seo: false,
      status: true
  });

  const toggleSection = (id: string) => {
      setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);

        for (const file of files) {
            const audit = await auditImageQuality(file);

            if (audit.isApproved) {
                const normalizedBlob = await standardizeImageCanvas(file);
                const normalizedFile = new File([normalizedBlob], file.name, { type: 'image/webp' });
                setSelectedFiles(prev => [...prev, normalizedFile]);
            } else {
                setSelectedFiles(prev => [...prev, file]);
            }
        }
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const canManageInventory = role === 'staff' || role === 'admin' || role === 'owner';

  const fetchProducts = async () => {
    if (!supabase) return;
    try {
      const [prodRes] = await Promise.all([
        supabase.from('products').select('*').order('id', { ascending: false })
      ]);

      if (prodRes.error) throw prodRes.error;
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (supabase) {
      fetchProducts();
    }

    (window as any).onBarScan = (sku: string) => {
        setForm(prev => ({ ...prev, sku: sku }));
        setMessage({ type: 'success', text: `Node Synced: ${sku}` });
        setTimeout(() => setMessage(null), 3000);
    };

    return () => { delete (window as any).onBarScan; };
  }, []);

  const currentVariants = useMemo(() => {
    return (form?.sizes || '').split(',').map(s => s.trim()).filter(s => s);
  }, [form.sizes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    const val = type === 'checkbox' ? (target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const startEditing = (product: Product) => {
    setForm({
      ...initialForm,
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || 'wine',
      sku: product.sku || '',
      price: String(product.price ?? ''),
      cost_price: String(product.cost_price ?? ''),
      old_price: String(product.old_price ?? ''),
      description: product.description || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(',') : 'Standard',
      stock: String(product.stock ?? '0'),
      is_featured: product.is_featured || false,
      is_snack: product.is_snack || false,
    });

    setExistingImages(product.images || [product.image_url]);
    setEditingId(product.id);
    setFormSession(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(initialForm);
    setSelectedFiles([]);
    setExistingImages([]);
    setFormSession(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !canManageInventory) return;
    setIsSubmitting(true);

    try {
      let imageUrls = [...existingImages];
      const BUCKET = 'onlinebar-assets';

      if (selectedFiles.length > 0) {
          const uploads = selectedFiles.map(async f => {
              const path = `products/${Date.now()}-${f.name}`;
              await supabase!.storage.from(BUCKET).upload(path, f);
              return supabase!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
          });
          const newUrls = await Promise.all(uploads);
          imageUrls = [...imageUrls, ...newUrls];
      }

      const productData = {
          name: form.name.trim(),
          brand: form.brand.trim(),
          price: Number(form.price),
          cost_price: Number(form.cost_price),
          description: form.description,
          image_url: imageUrls[0] || '',
          images: imageUrls,
          sizes: currentVariants,
          stock: Number(form.stock),
          category: form.category,
          is_featured: form.is_featured,
          is_snack: form.is_snack,
      };

      if (editingId) {
          await supabase.from('products').update(productData).eq('id', editingId);
      } else {
          await supabase.from('products').insert([productData]);
      }

      cancelEditing();
      fetchProducts();
      setMessage({ type: 'success', text: 'Grid Node Synchronized! 🛰️' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!supabase || !canManageInventory) return;
    try {
        await supabase.from('products').delete().eq('id', id);
        fetchProducts();
        cancelEditing();
    } catch (err: any) {
        console.error(err);
    }
  };

  const generateSupplierPO = () => {
    const low = products.filter(p => p.stock <= 5);
    const doc = new jsPDF();
    doc.text('Online Bar Purchase Order', 14, 20);
    autoTable(doc, {
        startY: 30,
        head: [['ID', 'Name', 'Stock']],
        body: low.map(p => [p.id, p.name, p.stock])
    });
    doc.save('OnlineBar_PO.pdf');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 text-left selection:bg-primary/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">

        {/* HEADER HUB */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cellar Master</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-none">
                  {editingId ? 'Refine Product' : 'Inventory Master'}
                </h1>
                <p className="text-slate-500 text-sm font-medium italic">Deploy premium beverage inventory to the online bar.</p>
            </div>

            {message && (
                <div className={cn(
                    "p-4 rounded-[1.5rem] border flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
                    message.type === 'success' ? "bg-primary/10 border-primary/20 text-primary" : "bg-rose-50 border-rose-100 text-rose-600"
                )}>
                    <Layers className="h-5 w-5" />
                    <p className="text-xs font-black uppercase tracking-widest">{message.text}</p>
                </div>
            )}

            <div className="flex items-center gap-4 relative z-10">
                <Button variant="outline" onClick={generateSupplierPO} className="h-12 px-6 rounded-xl border-slate-200 bg-white font-black uppercase text-[9px] tracking-widest">
                    <Download className="h-3 w-3 mr-2" /> PO
                </Button>
                {editingId && (
                    <Button onClick={cancelEditing} variant="outline" className="h-12 px-6 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 font-black uppercase text-[9px]">Abort</Button>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <form key={`form-${editingId || 'new'}-${formSession}`} onSubmit={handleSubmit} className="space-y-8 pb-32">

              <Card className="rounded-[3rem] border border-slate-100 shadow-sm overflow-visible bg-white">
                  <button type="button" onClick={() => toggleSection('basic')} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-[3rem]">
                      <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Info className="h-5 w-5" /></div>
                          <div className="text-left"><h2 className="text-lg font-black text-foreground uppercase tracking-tighter">Basic Information</h2><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Identify beverage specs</p></div>
                      </div>
                      {openSections.basic ? <ChevronUp className="h-5 w-5 text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
                  </button>
                  {openSections.basic && (
                      <CardContent className="p-10 pt-0 space-y-6">
                          <div className="grid sm:grid-cols-2 gap-6">
                              <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Product Name</label><Input name="name" value={form.name} onChange={handleInputChange} className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" required /></div>
                              <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Brand</label><Input name="brand" value={form.brand} onChange={handleInputChange} className="h-14 rounded-2xl border-slate-100 bg-slate-50" /></div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-6">
                              <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Category</label>
                                <select name="category" value={form.category} onChange={handleInputChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-primary">
                                    {settings.catalog.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">SKU</label><Input name="sku" value={form.sku} onChange={handleInputChange} className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-mono" /></div>
                          </div>
                      </CardContent>
                  )}
              </Card>

              <Card className="rounded-[3rem] border border-slate-100 shadow-sm overflow-visible bg-white">
                  <button type="button" onClick={() => toggleSection('media')} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-[3rem]">
                      <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><ImageIcon className="h-5 w-5" /></div>
                          <div className="text-left"><h2 className="text-lg font-black text-foreground uppercase tracking-tighter">Media Hub</h2><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Visual Assets</p></div>
                      </div>
                      {openSections.media ? <ChevronUp className="h-5 w-5 text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
                  </button>
                  {openSections.media && (
                      <CardContent className="p-10 pt-0 space-y-8">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {existingImages.map((url, i) => (
                                  <div key={i} className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 relative group overflow-hidden">
                                      <img src={url} className="w-full h-full object-contain" alt="" />
                                      <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-2 right-2 bg-rose-500 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                  </div>
                              ))}
                              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-slate-300 hover:text-primary group relative overflow-visible">
                                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                  <Camera size={24} />
                                  <span className="text-[8px] font-black uppercase">Add Photo</span>
                              </label>
                          </div>
                      </CardContent>
                  )}
              </Card>

              <div className="sticky bottom-10 z-[50]">
                  <div className="bg-white p-4 rounded-3xl shadow-2xl flex gap-3 border border-slate-100">
                      <Button type="submit" disabled={isSubmitting} className="flex-1 h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20">
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Wine className="h-5 w-5 mr-3" />}
                        {editingId ? 'Refine Grid Node' : 'Deploy to Bar'}
                      </Button>
                      {editingId && (
                          <Button type="button" onClick={() => handleDeleteProduct(editingId, form.name)} variant="ghost" className="h-16 px-8 rounded-2xl text-rose-500 bg-rose-50 hover:bg-rose-100"><Trash2 size={20}/></Button>
                      )}
                  </div>
              </div>

            </form>
          </div>

          <div className="lg:col-span-5 space-y-8">
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                      <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">Inventory Feed</h2>
                      <button onClick={fetchProducts} className="text-slate-300 hover:text-primary transition-colors"><RefreshCcw size={16} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-50 no-scrollbar">
                      {products.map(p => (
                          <div key={p.id} onClick={() => startEditing(p)} className={cn("p-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-all", editingId === p.id && "bg-primary/5 border-l-4 border-primary")}>
                              <div className="flex items-center gap-4 min-w-0">
                                  <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                                      <img src={p.image_url} className="max-h-full w-auto object-contain" alt="" />
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-xs font-black uppercase truncate text-foreground">{p.name}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase">{p.stock} Units • {p.category}</p>
                                  </div>
                              </div>
                              <ChevronRight size={16} className="text-slate-200" />
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
