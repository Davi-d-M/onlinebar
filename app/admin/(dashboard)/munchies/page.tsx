'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import {
    RefreshCcw,
    ChevronRight,
    Cookie,
    Plus,
    Loader2,
    DollarSign,
    Camera,
    Flame,
    Utensils
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { logAuditAction } from '@/lib/auditService';

const initialForm = {
  name: '',
  brand: '',
  category: 'snacks',
  sku: '',
  price: '',
  cost_price: '',
  old_price: '',
  description: '',
  short_description: '',
  sizes: 'Small Pack, Party Size',
  stock: '',
  low_stock_alert: '10',
  is_featured: false,
  is_snack: true,
  is_best_seller: false,
  sub_category: 'Trending',
};

interface Product {
  id: number;
  name: string;
  brand?: string;
  price: number;
  cost_price: number;
  image_url: string;
  stock: number;
  category: string;
  is_snack: boolean;
  sub_category?: string;
  description?: string;
}

const SNACK_SUBCATS = ["Trending", "Crisps", "Chocolate", "Nuts", "Healthy"];

export default function MunchieHubPage() {
    return (
        <Suspense fallback={<div className="p-24 text-center animate-pulse font-black text-slate-400 uppercase">Syncing Midnight Munchies...</div>}>
            <MunchieContent />
        </Suspense>
    );
}

function MunchieContent() {
  const { role, email } = useAdmin();
  const [form, setForm] = useState(initialForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snacks, setSnacks] = useState<Product[]>([]);
  const [loadingSnacks, setLoadingSnacks] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDeleteSnack = async (id: number, name: string) => {
      if (!supabase || !role) return;
      if (!window.confirm(`Expunge ${name} from the midnight grid?`)) return;

      try {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) throw error;

          await logAuditAction(email || 'admin', 'DELETE_SNACK', { id, name });
          if (editingId === id) {
              setEditingId(null);
              setForm(initialForm);
          }
          fetchSnacks();
          setMessage({ type: 'success', text: `${name} has been removed.` });
          setTimeout(() => setMessage(null), 3000);
      } catch (err: unknown) {
          setMessage({ type: 'error', text: (err as Error).message });
      }
  };

  const fetchSnacks = async () => {
    if (!supabase) return;
    try {
      setLoadingSnacks(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_snack', true)
        .order('id', { ascending: false });

      if (error) throw error;
      setSnacks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSnacks(false);
    }
  };

  useEffect(() => {
    if (supabase) fetchSnacks();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    const val = type === 'checkbox' ? (target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !role) return;
    if (!editingId && selectedFiles.length === 0) {
        setMessage({ type: 'error', text: 'Upload a munchie photo.' });
        return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = '';
      const BUCKET = 'onlinebar-assets';

      if (selectedFiles.length > 0) {
          const file = selectedFiles[0];
          const path = `snacks/${Date.now()}-${file.name}`;
          await supabase.storage.from(BUCKET).upload(path, file);
          imageUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      }

      const productData = {
          name: form.name.trim(),
          brand: form.brand.trim(),
          price: Number(form.price),
          cost_price: Number(form.cost_price),
          old_price: Number(form.old_price) || null,
          description: form.description,
          short_description: form.short_description,
          image_url: imageUrl || (editingId ? snacks.find(s => s.id === editingId)?.image_url : ''),
          category: 'snacks',
          sub_category: form.sub_category,
          is_snack: true,
          stock: Number(form.stock),
          low_stock_alert: Number(form.low_stock_alert),
          is_featured: form.is_featured,
          is_best_seller: form.is_best_seller,
          sizes: form.sizes.split(',').map(s => s.trim())
      };

      if (editingId) {
          await supabase.from('products').update(productData).eq('id', editingId);
          await logAuditAction(email || 'admin', 'UPDATE_SNACK', { id: editingId, name: productData.name });
      } else {
          await supabase.from('products').insert([productData]);
          await logAuditAction(email || 'admin', 'CREATE_SNACK', { name: productData.name });
      }

      setForm(initialForm);
      setSelectedFiles([]);
      setEditingId(null);
      fetchSnacks();
      setMessage({ type: 'success', text: 'Munchie synchronized to the grid! 🍿' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
        setMessage({ type: 'error', text: (err as Error).message });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 text-left selection:bg-primary/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">

        {/* MUNCHIE HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#F5A000]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Midnight Munchie Hub</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase leading-none italic">
                  The Snack <span className="text-primary">Vault.</span> 🍿
                </h1>
                <p className="text-slate-500 text-sm font-medium italic">Deploy late-night pairings and surgical restocks.</p>
            </div>

            {message && (
                <div className={cn(
                    "p-6 rounded-[2rem] border-2 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500",
                    message.type === 'success' ? "bg-primary/5 border-primary/20 text-primary" : "bg-rose-50 border-rose-100 text-rose-600"
                )}>
                    <Cookie className="h-6 w-6" />
                    <p className="text-sm font-black uppercase tracking-widest">{message.text}</p>
                </div>
            )}

            <Utensils className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5 rotate-12 -z-0" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT: UPLOAD FORM */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8 pb-32">
                <Card className="rounded-[3.5rem] border border-slate-100 bg-white shadow-sm p-10 space-y-10 text-left">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Plus size={24} /></div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Initialize Munchie</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Protocol for Snack Sector</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Munchie Name</label>
                                <Input name="name" value={form.name} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-foreground font-bold" placeholder="e.g. Salted Pistachios" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Munchie Category</label>
                                <select name="sub_category" value={form.sub_category} onChange={handleInputChange} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-black text-xs uppercase text-slate-600 outline-none focus:ring-2 focus:ring-primary">
                                    {SNACK_SUBCATS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Price (Ksh)</label>
                                <div className="relative">
                                    <Input name="price" type="number" value={form.price} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-primary font-black text-xl pl-12" required />
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Unit Cost</label>
                                <Input name="cost_price" type="number" value={form.cost_price} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-slate-500 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Initial Stock</label>
                                <Input name="stock" type="number" value={form.stock} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-foreground font-black" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Visual Evidence (Photo)</label>
                            <label className="w-full h-48 rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-slate-300 hover:text-primary group">
                                <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                {selectedFiles.length > 0 ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={URL.createObjectURL(selectedFiles[0])} alt="Preview" className="h-full w-full object-contain p-4" />
                                ) : (
                                    <>
                                        <Camera size={40} className="group-hover:scale-110 transition-transform" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Select Munchie Visual</p>
                                    </>
                                )}
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Short Narrative (Hook)</label>
                            <Textarea name="description" value={form.description} onChange={handleInputChange} className="min-h-[120px] rounded-3xl bg-slate-50 border-slate-100 text-slate-600 font-medium p-6 resize-none" placeholder="Crunchy, salted, and perfectly roasted for your Gin pairing..." />
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex gap-4">
                        {editingId && (
                            <Button
                                type="button"
                                onClick={() => handleDeleteSnack(editingId, form.name)}
                                className="h-20 px-8 rounded-[2rem] bg-rose-50 text-rose-500 font-black uppercase text-[10px] tracking-widest border-2 border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                        <Button type="submit" disabled={isSubmitting} className="flex-1 h-20 rounded-[2rem] bg-primary text-white font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            {isSubmitting ? <Loader2 className="animate-spin mr-3" /> : <Flame className="mr-3" />}
                            {editingId ? 'Execute Update' : 'Deploy to Midnight Grid'}
                        </Button>
                    </div>
                </Card>
            </form>
          </div>

          {/* RIGHT: SNACK GRID & PREVIEW */}
          <div className="lg:col-span-5 space-y-10">
              <div className="sticky top-8 space-y-10">
                  <section className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-10 text-left">
                        <div className="flex items-center justify-between mb-10">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Current Snacks</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{snacks.length} Nodes Online</p>
                            </div>
                            <Button onClick={fetchSnacks} variant="ghost" size="icon" className="text-slate-300 hover:text-primary transition-colors"><RefreshCcw size={18} /></Button>
                        </div>

                        <div className="grid gap-4 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                            {loadingSnacks ? (
                                <div className="p-20 text-center opacity-30"><Loader2 className="animate-spin mx-auto text-primary" /></div>
                            ) : snacks.map(s => (
                                <div key={s.id} onClick={() => {
                                    setEditingId(s.id);
                                    setForm({
                                        ...initialForm,
                                        name: s.name,
                                        price: String(s.price),
                                        cost_price: String(s.cost_price),
                                        stock: String(s.stock),
                                        sub_category: s.sub_category || 'Trending',
                                        description: s.description || ''
                                    });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }} className={cn(
                                    "p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all",
                                    editingId === s.id && "border-primary bg-primary/5 shadow-inner"
                                )}>
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-white p-2 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={s.image_url} alt="" className="max-h-full w-auto object-contain" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-foreground uppercase tracking-tight">{s.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[8px] font-black text-primary uppercase">{formatPrice(s.price)}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span className="text-[8px] font-bold text-slate-400 uppercase">{s.stock} in stock</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSnack(s.id, s.name);
                                            }}
                                            className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 sm:opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                  </section>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
}
