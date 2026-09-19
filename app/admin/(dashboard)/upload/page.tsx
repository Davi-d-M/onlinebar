'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import {
    RefreshCcw,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    TrendingUp as ProfitIcon,
    Wine,
    Info,
    ImageIcon,
    Layers,
    Loader2,
    Download,
    X,
    Trash2,
    Camera,
    Eye,
    Zap,
    Plus,
    Bot,
    Scan
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn, formatPrice } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { useSettings } from '@/lib/useSettings';
import { logAuditAction } from '@/lib/auditService';
import { auditImageQuality, standardizeImageCanvas, type ImageAuditResult } from '@/lib/engines/imageEngine';

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

interface Hub {
    id: string;
    name: string;
}

export default function AdminUploadPage() {
    return (
        <Suspense fallback={<div className="p-24 text-center animate-pulse font-black text-slate-400 uppercase">Establishing Stock Sync...</div>}>
            <UploadContent />
        </Suspense>
    );
}

function UploadContent() {
  const { role, email } = useAdmin();
  const { settings } = useSettings();
  const [form, setForm] = useState(initialForm);
  const [variantStock, setVariantStock] = useState<Record<string, string>>({});
  const [beverageSpecs, setBeverageSpecs] = useState<{ key: string, value: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [hubStock, setHubStock] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formSession, setFormSession] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isVisionScanning, setIsVisionScanning] = useState(false);
  const [imageAudits, setImageAudits] = useState<Record<string, ImageAuditResult>>({});

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
            setImageAudits(prev => ({ ...prev, [file.name]: audit }));

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
      const [prodRes, hubRes] = await Promise.all([
        supabase.from('products').select('*').order('id', { ascending: false }),
        supabase.from('hubs').select('id, name').eq('is_active', true)
      ]);

      if (prodRes.error) throw prodRes.error;
      setProducts(prodRes.data || []);
      setHubs(hubRes.data || []);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (supabase) {
      fetchProducts();
    }

    (window as Window & { onTitanScan?: (sku: string) => void }).onTitanScan = (sku: string) => {
        setForm(prev => ({ ...prev, sku: sku }));
        setMessage({ type: 'success', text: `Node Synced: ${sku}` });
        setTimeout(() => setMessage(null), 3000);
    };

    (window as Window & { onTitanTriage?: (result: string) => void }).onTitanTriage = (result: string) => {
        setMessage({ type: 'success', text: `AI Triage Signal: ${result}` });
        // Optionally parse result to update description or category
        if (result.toLowerCase().includes('wine')) setForm(prev => ({ ...prev, category: 'wine' }));
        setTimeout(() => setMessage(null), 5000);
    };

    return () => {
        delete (window as Window & { onTitanScan?: (sku: string) => void }).onTitanScan;
        delete (window as Window & { onTitanTriage?: (result: string) => void }).onTitanTriage;
    };
  }, []);

  const triggerBarScanner = () => {
    const win = window as Window & { TitanNode?: { triggerScanner: () => void } };
    if (win.TitanNode?.triggerScanner) {
        win.TitanNode.triggerScanner();
    } else {
        alert("Native Scanner Node not detected. Use the Online Bar Mobile App.");
    }
  };

  const currentVariants = useMemo(() => {
    return (form?.sizes || '').split(',').map(s => s.trim()).filter(s => s);
  }, [form.sizes]);

  const profitIntel = useMemo(() => {
      const sell = Number(form.price) || 0;
      const cost = Number(form.cost_price) || 0;
      const profit = sell - cost;
      const margin = sell > 0 ? (profit / sell) * 100 : 0;
      return { profit, margin };
  }, [form.price, form.cost_price]);

  const stockIntelligence = useMemo(() => {
      if (!editingId) return null;
      const currentStock = Number(form.stock) || 0;
      const avgDailySales = 1.2;
      const daysRemaining = avgDailySales > 0 ? (currentStock / avgDailySales).toFixed(1) : '∞';
      const reorderPoint = 8;
      const isReorderUrgent = currentStock <= reorderPoint;
      return { currentStock, avgDailySales, daysRemaining, reorderPoint, isReorderUrgent };
  }, [editingId, form.stock]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    const val = type === 'checkbox' ? (target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleVariantStockChange = (variant: string, value: string) => {
    setVariantStock(prev => ({ ...prev, [variant]: value }));
  };

  const handleAddSpec = () => setBeverageSpecs([...beverageSpecs, { key: '', value: '' }]);
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
      const newSpecs = [...beverageSpecs];
      newSpecs[index][field] = value;
      setBeverageSpecs(newSpecs);
  };
  const handleRemoveSpec = (index: number) => setBeverageSpecs(beverageSpecs.filter((_, i) => i !== index));

  const handleGenerateDescription = async () => {
    if (!form.name.trim()) return;
    setIsGenerating(true);
    try {
        const res = await fetch('/api/admin/generate-description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: form.name, category: form.category }),
        });
        const data = await res.json();
        if (data.description) setForm(prev => ({ ...prev, description: data.description }));
    } catch (err: unknown) {
        console.error("Content generation failed", err);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleVisionScan = async () => {
    if (selectedFiles.length === 0) return;
    setIsVisionScanning(true);
    try {
        setMessage({ type: 'error', text: "Vision API Node not connected." });
    } finally {
        setIsVisionScanning(false);
    }
  };

  const startEditing = (product: Product) => {
    const vStock: Record<string, string> = {};
    if (product.variant_stock) Object.entries(product.variant_stock).forEach(([k, v]) => vStock[k] = v.toString());

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
    setVariantStock(vStock);
    setBeverageSpecs(product.beverage_specs ? Object.entries(product.beverage_specs).map(([key, value]) => ({ key, value })) : []);
    setEditingId(product.id);
    setFormSession(prev => prev + 1);

    async function fetchHubStock() {
        if (!supabase) return;
        const { data } = await supabase.from('hub_inventory').select('*').eq('product_id', product.id);
        if (data) {
            const hStock: Record<string, string> = {};
            data.forEach((hs: { hub_id: string, stock_level: number }) => hStock[hs.hub_id] = String(hs.stock_level));
            setHubStock(hStock);
        }
    }
    fetchHubStock();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(initialForm);
    setVariantStock({});
    setBeverageSpecs([]);
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

      const vStock: Record<string, number> = {};
      currentVariants.forEach(v => vStock[v] = Number(variantStock[v] || 0));

      const specs: Record<string, string> = {};
      beverageSpecs.forEach(s => { if (s.key) specs[s.key] = s.value; });

      const productData = {
          name: form.name.trim(),
          brand: form.brand.trim(),
          price: Number(form.price),
          cost_price: Number(form.cost_price),
          description: form.description,
          image_url: imageUrls[0] || '',
          images: imageUrls,
          sizes: currentVariants,
          stock: Object.values(vStock).reduce((a, b) => a + b, 0),
          variant_stock: vStock,
          beverage_specs: specs,
          category: form.category,
          is_featured: form.is_featured,
          is_snack: form.is_snack,
      };

      if (editingId) {
          await supabase.from('products').update(productData).eq('id', editingId);
          await logAuditAction(email || 'admin', 'UPDATE_PRODUCT', { id: editingId, name: productData.name });
      } else {
          await supabase.from('products').insert([productData]);
          await logAuditAction(email || 'admin', 'CREATE_PRODUCT', { name: productData.name });
      }

      cancelEditing();
      fetchProducts();
      setMessage({ type: 'success', text: 'Grid Node Synchronized! 🛰️' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
        const error = err as Error;
        setMessage({ type: 'error', text: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!supabase || !canManageInventory) return;
    if (!window.confirm("Expunge this node from the global catalogue?")) return;
    try {
        await supabase.from('products').delete().eq('id', id);
        await logAuditAction(email || 'admin', 'DELETE_PRODUCT', { id });
        fetchProducts();
        cancelEditing();
        setMessage({ type: 'success', text: 'Node expelled from grid.' });
    } catch (err: unknown) {
        const error = err as Error;
        console.error(error);
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
            <div className="relative z-10 space-y-2 text-left">
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
                          <div className="text-left">
                              <h2 className="text-lg font-black text-foreground uppercase tracking-tighter">Basic Information</h2>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Identify beverage specs</p>
                          </div>
                      </div>
                      {openSections.basic ? <ChevronUp className="h-5 w-5 text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
                  </button>
                  {openSections.basic && (
                      <CardContent className="p-10 pt-0 space-y-6 text-left">
                          <div className="grid sm:grid-cols-2 gap-6">
                              <div className="space-y-2 text-left">
                                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Product Name</label>
                                  <Input name="name" value={form.name} onChange={handleInputChange} className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" required />
                              </div>
                              <div className="space-y-2 text-left">
                                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Brand</label>
                                  <Input name="brand" value={form.brand} onChange={handleInputChange} className="h-14 rounded-2xl border-slate-100 bg-slate-50" />
                              </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-6">
                              <div className="space-y-2 text-left">
                                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Category</label>
                                <select name="category" value={form.category} onChange={handleInputChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-primary">
                                    {settings.catalog.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2 text-left flex items-end gap-2">
                                  <div className="flex-1 space-y-2">
                                      <label className="text-[9px] font-black uppercase text-slate-400 ml-1">SKU</label>
                                      <Input name="sku" value={form.sku} onChange={handleInputChange} className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-mono" />
                                  </div>
                                  <Button type="button" onClick={triggerBarScanner} variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 hover:text-primary">
                                      <Scan size={20} />
                                  </Button>
                              </div>
                          </div>
                      </CardContent>
                  )}
              </Card>

              {/* PRICING & ECONOMICS */}
              <Card className="rounded-[3rem] border border-slate-100 shadow-sm overflow-visible bg-white">
                  <button type="button" onClick={() => toggleSection('pricing')} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-[3rem]">
                      <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><ProfitIcon className="h-5 w-5" /></div>
                          <div className="text-left">
                              <h2 className="text-lg font-black text-foreground uppercase tracking-tighter">Economic Hub</h2>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Margins & Tactical Pricing</p>
                          </div>
                      </div>
                      {openSections.pricing ? <ChevronUp className="h-5 w-5 text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
                  </button>
                  {openSections.pricing && (
                      <CardContent className="p-10 pt-0 space-y-8">
                          <div className="grid sm:grid-cols-3 gap-6">
                              <div className="space-y-2 text-left">
                                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Sell Price (Ksh)</label>
                                  <Input type="number" name="price" value={form.price} onChange={handleInputChange} className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-black text-xl text-primary" required />
                              </div>
                              <div className="space-y-2 text-left">
                                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Unit Cost</label>
                                  <Input type="number" name="cost_price" value={form.cost_price} onChange={handleInputChange} className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold text-slate-500" />
                              </div>
                              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-slate-100">
                                  <p className="text-[8px] font-black uppercase text-slate-400">Profit Margin</p>
                                  <h3 className={cn("text-xl font-black", profitIntel.profit > 0 ? "text-emerald-500" : "text-rose-500")}>
                                      {formatPrice(profitIntel.profit)} <span className="text-[10px] opacity-60">({profitIntel.margin.toFixed(1)}%)</span>
                                  </h3>
                              </div>
                          </div>
                      </CardContent>
                  )}
              </Card>

              {/* INVENTORY & VARIANTS */}
              <Card className="rounded-[3rem] border border-slate-100 shadow-sm overflow-visible bg-white">
                  <button type="button" onClick={() => toggleSection('inventory')} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-[3rem]">
                      <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Layers className="h-5 w-5" /></div>
                          <div className="text-left">
                              <h2 className="text-lg font-black text-foreground uppercase tracking-tighter">Inventory Sync</h2>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Neural Stock & Variants</p>
                          </div>
                      </div>
                      {openSections.inventory ? <ChevronUp className="h-5 w-5 text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
                  </button>
                  {openSections.inventory && (
                      <CardContent className="p-10 pt-0 space-y-10">
                          <div className="space-y-4 text-left">
                              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Variants (Comma Separated)</label>
                              <Input name="sizes" value={form.sizes} onChange={handleInputChange} className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" placeholder="e.g. 750ml, 1 Litre" />
                          </div>

                          {currentVariants.length > 0 && (
                              <div className="grid sm:grid-cols-2 gap-4 text-left">
                                  {currentVariants.map(v => (
                                      <div key={v} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-primary/20 transition-all">
                                          <span className="text-[10px] font-black uppercase text-slate-500">{v}</span>
                                          <Input
                                            type="number"
                                            value={variantStock[v] || '0'}
                                            onChange={(e) => handleVariantStockChange(v, e.target.value)}
                                            className="w-24 h-10 rounded-xl border-slate-200 bg-white text-center font-black"
                                          />
                                      </div>
                                  ))}
                              </div>
                          )}

                          <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-left">
                              <div className="space-y-1">
                                  <p className="text-[10px] font-black uppercase text-slate-400">Total Cellar Units</p>
                                  <h3 className="text-2xl font-black text-foreground">{Object.values(variantStock).reduce((a,b) => a + Number(b||0), 0)} Units</h3>
                              </div>
                              {stockIntelligence && (
                                  <div className="text-right">
                                      <p className="text-[8px] font-black uppercase text-primary">Runway Estimate</p>
                                      <p className="text-sm font-black text-slate-600">{stockIntelligence.daysRemaining} Days</p>
                                  </div>
                              )}
                          </div>
                      </CardContent>
                  )}
              </Card>

              {/* MEDIA HUB */}
              <Card className="rounded-[3rem] border border-slate-100 shadow-sm overflow-visible bg-white">
                  <button type="button" onClick={() => toggleSection('media')} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-[3rem]">
                      <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><ImageIcon className="h-5 w-5" /></div>
                          <div className="text-left">
                              <h2 className="text-lg font-black text-foreground uppercase tracking-tighter">Media Hub</h2>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Visual Assets</p>
                          </div>
                      </div>
                      {openSections.media ? <ChevronUp className="h-5 w-5 text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
                  </button>
                  {openSections.media && (
                      <CardContent className="p-10 pt-0 space-y-8">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {existingImages.map((url, i) => {
                                  const fileName = url.split('/').pop() || '';
                                  const audit = imageAudits[fileName];
                                  return (
                                      <div key={i} className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 relative group overflow-hidden">
                                          <Image src={url} width={400} height={400} className="w-full h-full object-contain" alt="" />
                                          <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-2 right-2 bg-rose-500 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity z-40"><X size={12}/></button>

                                          {/* Audit Tooltip on Hover */}
                                          {audit && audit.issues.length > 0 && (
                                              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm p-4 flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 overflow-y-auto no-scrollbar">
                                                  <p className="text-[8px] font-black uppercase text-primary tracking-widest">Quality Audit</p>
                                                  {audit.issues.map((iss, i) => (
                                                      <p key={i} className="text-[7px] text-white font-medium leading-tight">• {iss}</p>
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                  );
                              })}
                              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-slate-300 hover:text-primary group relative overflow-visible">
                                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                  <Camera size={24} />
                                  <span className="text-[8px] font-black uppercase">Add Photo</span>
                                  {selectedFiles.length > 0 && (
                                      <div className="absolute -bottom-10 left-0 right-0 flex gap-1 z-20">
                                          <Button type="button" onClick={handleVisionScan} disabled={isVisionScanning} className="flex-1 h-8 rounded-lg bg-indigo-600 text-white text-[7px] font-black uppercase">
                                              {isVisionScanning ? <Loader2 size={10} className="animate-spin" /> : <><Eye size={10} className="mr-1"/> Cloud Vision</>}
                                          </Button>
                                      </div>
                                  )}
                              </label>
                          </div>
                      </CardContent>
                  )}
              </Card>

              {/* NARRATIVE & SPECS */}
              <Card className="rounded-[3rem] border border-slate-100 shadow-sm overflow-visible bg-white">
                  <button type="button" onClick={() => toggleSection('description')} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-[3rem]">
                      <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Zap className="h-5 w-5" /></div>
                          <div className="text-left">
                              <h2 className="text-lg font-black text-foreground uppercase tracking-tighter">Narrative Hub</h2>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Storytelling & Specs</p>
                          </div>
                      </div>
                      {openSections.description ? <ChevronUp className="h-5 w-5 text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
                  </button>
                  {openSections.description && (
                      <CardContent className="p-10 pt-0 space-y-8 text-left">
                          <div className="space-y-4 text-left">
                              <div className="flex justify-between items-center text-left">
                                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Main Narrative</label>
                                  <Button type="button" onClick={handleGenerateDescription} disabled={isGenerating} variant="ghost" className="h-8 px-3 rounded-lg text-primary bg-primary/5 hover:bg-primary/10 font-black uppercase text-[8px]">
                                      {isGenerating ? <Loader2 size={10} className="animate-spin mr-2" /> : <Bot size={10} className="mr-2" />}
                                      Neural Compose
                                  </Button>
                              </div>
                              <Textarea name="description" value={form.description} onChange={handleInputChange} className="min-h-[150px] rounded-2xl bg-slate-50 border-slate-100 p-6 text-sm font-medium italic leading-relaxed" placeholder="Describe the tasting notes, history, and pairing..." />
                          </div>

                          <div className="space-y-6 text-left">
                              <div className="flex justify-between items-center text-left">
                                  <h3 className="text-xs font-black uppercase text-foreground">Beverage Specifications</h3>
                                  <Button type="button" onClick={handleAddSpec} variant="outline" className="h-8 w-8 rounded-lg border-slate-100 p-0"><Plus size={14} /></Button>
                              </div>
                              <div className="grid gap-3">
                                  {beverageSpecs.map((s, i) => (
                                      <div key={i} className="flex gap-2 items-center text-left">
                                          <Input value={s.key} onChange={e => handleSpecChange(i, 'key', e.target.value)} className="flex-1 h-10 rounded-xl bg-slate-50 border-slate-100 text-[10px] font-black uppercase" placeholder="Property (e.g. ABV)" />
                                          <Input value={s.value} onChange={e => handleSpecChange(i, 'value', e.target.value)} className="flex-1 h-10 rounded-xl bg-slate-50 border-slate-100 text-[10px] font-bold" placeholder="Value (e.g. 40%)" />
                                          <button type="button" onClick={() => handleRemoveSpec(i)} className="h-10 w-10 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </CardContent>
                  )}
              </Card>

              {/* LOGISTICS NODE SYNC */}
              <Card className="rounded-[3rem] border border-slate-100 shadow-sm overflow-visible bg-white">
                  <button type="button" onClick={() => toggleSection('status')} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-[3rem]">
                      <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><RefreshCcw className="h-5 w-5" /></div>
                          <div className="text-left">
                              <h2 className="text-lg font-black text-foreground uppercase tracking-tighter">Logistics Sync</h2>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hub Distribution</p>
                          </div>
                      </div>
                      {openSections.status ? <ChevronUp className="h-5 w-5 text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
                  </button>
                  {openSections.status && (
                      <CardContent className="p-10 pt-0 space-y-6 text-left">
                          <div className="grid gap-4">
                              {hubs.map(hub => (
                                  <div key={hub.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-left">
                                      <div className="flex items-center gap-4">
                                          <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm"><RefreshCcw size={14} /></div>
                                          <span className="text-[10px] font-black uppercase text-foreground">{hub.name}</span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                          <span className="text-[8px] font-black uppercase text-slate-400">Hub Stock</span>
                                          <Input
                                            type="number"
                                            value={hubStock[hub.id] || '0'}
                                            readOnly // Logistics is read-only from this panel, managed by Dispatch
                                            className="w-20 h-10 rounded-xl border-slate-100 bg-white/50 text-center font-black text-slate-400"
                                          />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </CardContent>
                  )}
              </Card>

              <div className="sticky bottom-10 z-[50]">
                  <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl flex gap-3 border border-slate-100">
                      <Button type="submit" data-behavior-id="upload.deploy_to_bar" disabled={isSubmitting} className="flex-1 h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20">
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Wine className="h-5 w-5 mr-3" />}
                        {editingId ? 'Refine Grid Node' : 'Deploy to Bar'}
                      </Button>
                      {editingId && (
                          <Button type="button" onClick={() => handleDeleteProduct(editingId)} variant="ghost" className="h-16 px-8 rounded-2xl text-rose-500 bg-rose-50 hover:bg-rose-100"><Trash2 size={20}/></Button>
                      )}
                  </div>
              </div>

            </form>
          </div>

          <div className="lg:col-span-5 space-y-8">
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[800px] sticky top-8">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                      <div>
                          <h2 className="text-xl font-black text-foreground uppercase tracking-tighter leading-none">Cellar Inventory</h2>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{products.length} Nodes Online</p>
                      </div>
                      <button onClick={fetchProducts} className="text-slate-300 hover:text-primary transition-colors"><RefreshCcw size={16} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-50 no-scrollbar">
                      {products.map(p => (
                          <div key={p.id} onClick={() => startEditing(p)} className={cn("p-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-all group", editingId === p.id && "bg-primary/5 border-l-4 border-primary shadow-inner")}>
                              <div className="flex items-center gap-4 min-w-0">
                                  <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                                      <Image src={p.image_url} width={100} height={100} className="max-h-full w-auto object-contain" alt="" />
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-xs font-black uppercase truncate text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                                      <div className="flex items-center gap-2">
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">{p.stock} Units • {p.category}</p>
                                          {p.is_snack && <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-500 text-[7px] font-black uppercase">Munchie</span>}
                                      </div>
                                  </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
