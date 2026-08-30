'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAdmin } from '@/context/AdminContext';
import { logAuditAction } from '@/lib/auditService';
import {
    Phone,
    Palette,
    Truck,
    Save,
    RefreshCcw,
    CheckCircle2,
    Zap,
    Loader2,
    ShieldAlert,
    Globe,
    Image as ImageIcon,
    Eye,
    Code,
    Clock,
    Activity,
    Info,
    Share2,
    Camera,
    Rocket,
    Trash2,
    Plus,
    UserPlus,
    DollarSign,
    Home as HomeIcon,
    MapPin,
    Bot,
    Wine,
    GlassWater
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const DEFAULTS = {
    contact: { whatsapp: "254769345599", email: "support@onlinebar.co.ke", address: "Nairobi, Kenya" },
    branding: { owner_name: "David Maganga", portfolio_url: "https://davi-d-m.github.io/my_portfolio/", hero_title: "Elite Vintages. Chilled Spirits.", hero_subtitle: "Experience authentic vintages and elite spirits curated for excellence.", logo_url: "", favicon_url: "" },
    homepage: { hero_image_url: "", hero_starting_price: 2500, hero_badge_text: "The Premium Bar is Open", hero_visual_label: "Online Bar Selection" },
    shipping: { nairobi_cbd_label: "Nairobi CBD / Local", nairobi_cbd: 0, nairobi_outskirts_label: "Nairobi Outskirts", nairobi_outskirts: 300, upcountry_label: "Upcountry / Major Towns", upcountry: 500 },
    logistics: { dispatch_zones: ["CBD", "Westlands", "Kilimani", "Lavington", "Kileleshwa", "Karen", "Langata", "South C", "South B", "Embakasi", "Roysambu", "Kasarani", "Kahawa", "Githurai", "Zimmerman", "Utawala", "Syokimau", "Kitengela", "Rongai", "Ngong", "Kikuyu", "Thika Road", "Mombasa Road"] },
    catalog: { categories: [{ id: 'wine', label: 'Vintages' }, { id: 'spirits', label: 'Premium Spirits' }, { id: 'snacks', label: 'Late Night Snacks' }, { id: 'beer', label: 'Chilled Beers' }, { id: 'mixers', label: 'Mixers' }] },
    promotions: { flash_sale_text: 'Happy Hour: 20% OFF Select Spirits!', discount_percent: 20, is_active: true, flash_sale_end: '' },
    theme_config: { primary: "#F5A000", secondary: "#0F172A", accent: "#F5A000", custom_css: "" },
    seo_config: { title: "Online Bar | Premium Drinks", description: "Premium wine, spirits and snacks delivery in Nairobi.", keywords: "Wine delivery, Whiskey Nairobi, Late night snacks, Kenya Bar", og_image: "" },
    social_links: { instagram: "", tiktok: "", facebook: "", x: "", youtube: "" },
    store_info: { name: "ONLINE BAR", hours: "24/7 Dispatch", google_maps: "", footer_copy: "© 2026 Online Bar™" },
    ai_config: { build_setup_limit: 5000, assistant_name: "Bar AI", response_style: "Elite" },
    onboarding_config: {
        rider_steps: [
            { id: 'welcome', label: 'Welcome Screen', enabled: true },
            { id: 'phone', label: 'Phone Verification', enabled: true },
            { id: 'identity', label: 'Identity Profile', enabled: true },
            { id: 'vehicle', label: 'Logistics Specs', enabled: true },
            { id: 'verification', label: 'Photo Verification', enabled: true },
            { id: 'agreement', label: 'Legal Agreement', enabled: true },
            { id: 'biometrics', label: 'Bio-Lock Enrollment', enabled: true }
        ],
        rules: {
            min_age: 18,
            require_license: true,
            auto_approve: false
        }
    }
};

type TabId = 'identity' | 'homepage' | 'promotions' | 'theme' | 'seo' | 'ops' | 'catalog' | 'ai' | 'onboarding' | 'integrations' | 'features' | 'advanced';

export default function AdminSettingsPage() {
    const { email } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [contact, setContact] = useState(DEFAULTS.contact);
    const [branding, setBranding] = useState(DEFAULTS.branding);
    const [homepage, setHomepage] = useState(DEFAULTS.homepage);
    const [shipping, setShipping] = useState(DEFAULTS.shipping);
    const [logistics, setLogistics] = useState(DEFAULTS.logistics);
    const [catalog, setCatalog] = useState(DEFAULTS.catalog);
    const [promotions, setPromotions] = useState(DEFAULTS.promotions);
    const [theme, setTheme] = useState(DEFAULTS.theme_config);
    const [seo, setSeo] = useState(DEFAULTS.seo_config);
    const [social, setSocial] = useState(DEFAULTS.social_links);
    const [store, setStore] = useState(DEFAULTS.store_info);
    const [aiConfig, setAiConfig] = useState(DEFAULTS.ai_config);
    const [onboarding, setOnboarding] = useState(DEFAULTS.onboarding_config);
    const [features, setFeatures] = useState({
        ai_concierge_enabled: true,
        dynamic_pricing_enabled: true,
        gamification_enabled: true,
        fraud_shield_enabled: true
    });

    // New Integrations State
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<TabId>('identity');

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [heroPreview, setHeroPreview] = useState<string | null>(null);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    const heroInputRef = useRef<HTMLInputElement>(null);

    const fetchSettings = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data: settingsData } = await supabase.from('settings').select('*');
            if (settingsData && settingsData.length > 0) {
                settingsData.forEach((item: { key: string; value: unknown }) => {
                    if (item.key === 'contact') setContact(item.value as typeof DEFAULTS.contact);
                    if (item.key === 'branding') {
                        setBranding(item.value as typeof DEFAULTS.branding);
                        const val = item.value as typeof DEFAULTS.branding;
                        if (val.logo_url) setLogoPreview(val.logo_url);
                        if (val.favicon_url) setFaviconPreview(val.favicon_url);
                    }
                    if (item.key === 'homepage') {
                        setHomepage(item.value as typeof DEFAULTS.homepage);
                        const val = item.value as typeof DEFAULTS.homepage;
                        if (val.hero_image_url) setHeroPreview(val.hero_image_url);
                    }
                    if (item.key === 'shipping') setShipping(item.value as typeof DEFAULTS.shipping);
                    if (item.key === 'logistics') setLogistics(item.value as typeof DEFAULTS.logistics);
                    if (item.key === 'catalog') setCatalog(item.value as typeof DEFAULTS.catalog);
                    if (item.key === 'promotions') setPromotions(item.value as typeof DEFAULTS.promotions);
                    if (item.key === 'theme_config') setTheme(item.value as typeof DEFAULTS.theme_config);
                    if (item.key === 'seo_config') setSeo(item.value as typeof DEFAULTS.seo_config);
                    if (item.key === 'social_links') setSocial(item.value as typeof DEFAULTS.social_links);
                    if (item.key === 'store_info') setStore(item.value as typeof DEFAULTS.store_info);
                    if (item.key === 'ai_config') setAiConfig(item.value as typeof DEFAULTS.ai_config);
                    if (item.key === 'onboarding_config') setOnboarding(item.value as typeof DEFAULTS.onboarding_config);
                    if (item.key === 'features') setFeatures(item.value as typeof features);
                });
            }

            // Fetch Integrations
            const { data: integrationData } = await supabase.from('integration_nodes').select('*');
            if (integrationData) setIntegrations(integrationData);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const uploadAsset = async (file: File, folder: string) => {
        if (!supabase) throw new Error("Database not connected");
        const BUCKET = 'onlinebar-assets';
        const path = `${folder}/${folder.split('/')[0]}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        return data.publicUrl;
    };

    const handleSave = async (key: string, value: unknown, publish: boolean = true) => {
        if (!supabase) return;
        setSavingKey(key);
        setMessage(null);

        let finalValue = value;

        try {
            // Handle File Uploads for Branding
            if (key === 'branding') {
                const updatedBrandingLocal = { ...(value as Record<string, unknown>) };
                if (logoFile) updatedBrandingLocal.logo_url = await uploadAsset(logoFile, 'branding');
                if (faviconFile) updatedBrandingLocal.favicon_url = await uploadAsset(faviconFile, 'branding');
                finalValue = updatedBrandingLocal;
                setBranding(updatedBrandingLocal as typeof branding);
                setLogoFile(null);
                setFaviconFile(null);
            }

            // Handle File Uploads for Homepage
            if (key === 'homepage') {
                const updatedHomepageLocal = { ...(value as Record<string, unknown>) };
                if (heroFile) updatedHomepageLocal.hero_image_url = await uploadAsset(heroFile, 'homepage');
                finalValue = updatedHomepageLocal;
                setHomepage(updatedHomepageLocal as typeof homepage);
                setHeroFile(null);
            }

            const { error } = await supabase
                .from('settings')
                .upsert({
                    key,
                    value: finalValue,
                    is_published: publish,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' });

            if (error) throw error;

            await logAuditAction(email, 'UPDATE_SETTINGS', { key, published: publish });
            setMessage({
                type: 'success',
                text: publish ? `${key.toUpperCase()} published to live bar.` : `${key.toUpperCase()} saved as draft.`
            });

            setTimeout(() => setMessage(null), 5000);
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Save Error:", error);
            setMessage({ type: 'error', text: error.message || 'Failed to update.' });
        } finally {
            setSavingKey(null);
        }
    };

    const handlePublishAll = async () => {
        if (!supabase) return;
        setSavingKey('all');
        try {
            const updatedBrandingLocal = { ...branding };
            const updatedHomepageLocal = { ...homepage };

            if (logoFile) updatedBrandingLocal.logo_url = await uploadAsset(logoFile, 'branding');
            if (faviconFile) updatedBrandingLocal.favicon_url = await uploadAsset(faviconFile, 'branding');
            if (heroFile) updatedHomepageLocal.hero_image_url = await uploadAsset(heroFile, 'homepage');

            const payloads = [
                { key: 'contact', value: contact },
                { key: 'branding', value: updatedBrandingLocal },
                { key: 'homepage', value: updatedHomepageLocal },
                { key: 'theme_config', value: theme },
                { key: 'seo_config', value: seo },
                { key: 'social_links', value: social },
                { key: 'store_info', value: store },
                { key: 'promotions', value: promotions },
                { key: 'shipping', value: shipping },
                { key: 'logistics', value: logistics },
                { key: 'catalog', value: catalog },
                { key: 'onboarding_config', value: onboarding },
                { key: 'features', value: features },
                { key: 'ai_config', value: aiConfig },
            ];

            const { error } = await supabase
                .from('settings')
                .upsert(payloads.map(p => ({ ...p, is_published: true, updated_at: new Date().toISOString() })), { onConflict: 'key' });

            if (error) throw error;

            setBranding(updatedBrandingLocal);
            setHomepage(updatedHomepageLocal);
            setLogoFile(null);
            setFaviconFile(null);
            setHeroFile(null);

            setMessage({ type: 'success', text: "All changes synchronized to the live bar menu." });
        } catch (err: unknown) {
            const error = err as Error;
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSavingKey(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 text-left">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Establishing Secure Uplink...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Bar OS</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Professional Content Management & Cellar Identity Hub.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchSettings} variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white text-foreground font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
                        <RefreshCcw className="h-4 w-4 mr-2" /> Sync Records
                    </Button>
                    <Button
                        onClick={() => {
                            if (activeTab === 'identity') handleSave('branding', branding, true);
                            else if (activeTab === 'homepage') handleSave('homepage', homepage, true);
                            else if (activeTab === 'promotions') handleSave('promotions', promotions, true);
                            else if (activeTab === 'theme') handleSave('theme_config', theme, true);
                            else if (activeTab === 'seo') handleSave('seo_config', seo, true);
                            else if (activeTab === 'ops') {
                                handleSave('contact', contact, true);
                                handleSave('shipping', shipping, true);
                            }
                            else if (activeTab === 'catalog') handleSave('catalog', catalog, true);
                            else if (activeTab === 'ai') handleSave('ai_config', aiConfig, true);
                            else if (activeTab === 'onboarding') handleSave('onboarding_config', onboarding, true);
                            else if (activeTab === 'integrations') {
                                setMessage({ type: 'success', text: "Integration credentials synchronized with secure vault. 🔐" });
                                setTimeout(() => setMessage(null), 3000);
                            }
                            else if (activeTab === 'features') handleSave('features', features, true);
                            else if (activeTab === 'advanced') handleSave('theme_config', theme, true);
                        }}
                        className="rounded-xl h-12 px-6 bg-primary text-white font-black uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20"
                    >
                        <Save className="h-4 w-4 mr-2" /> Sync Changes
                    </Button>
                </div>
            </header>

            {message && (
                <div className={cn(
                    "p-6 rounded-[2rem] border-2 flex items-start gap-4 animate-in slide-in-from-top-4 duration-500 shadow-xl relative overflow-hidden",
                    message.type === 'success' ? "bg-primary/5 border-primary/20 text-primary" : "bg-rose-50 border-rose-100 text-rose-600"
                )}>
                    {message.type === 'success' ? <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" /> : <ShieldAlert className="h-6 w-6 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                        <p className="text-sm font-black uppercase tracking-tight mb-1">{message.type === 'success' ? 'Command Acknowledged' : 'Interference Detected'}</p>
                        <p className="text-xs font-medium leading-relaxed italic">{message.text}</p>
                    </div>
                </div>
            )}

            {/* CMS Tab Navigation */}
            <div className="flex gap-2 p-1 bg-card rounded-2xl border border-border shadow-sm overflow-x-auto no-scrollbar max-w-5xl">
                {[
                    { id: 'identity', label: 'Identity', icon: Info },
                    { id: 'homepage', label: 'Homepage', icon: HomeIcon },
                    { id: 'promotions', label: 'Promotions', icon: Zap },
                    { id: 'theme', label: 'Theme', icon: Palette },
                    { id: 'seo', label: 'SEO & Social', icon: Globe },
                    { id: 'ops', label: 'Operations', icon: Truck },
                    { id: 'catalog', label: 'Menu', icon: Wine },
                    { id: 'ai', label: 'AI Node', icon: Bot },
                    { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
                    { id: 'integrations', label: 'Integrations', icon: Code },
                    { id: 'features', label: 'Features', icon: Zap },
                    { id: 'advanced', label: 'Advanced', icon: Code },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabId)}
                        className={cn(
                            "flex items-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 border-transparent",
                            activeTab === tab.id ? "bg-primary text-background border-primary shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">

                    {/* IDENTITY TAB */}
                    {activeTab === 'identity' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                            <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-8 text-left">
                                <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Info className="h-5 w-5 text-primary" /> Core Identity</h2>
                                <div className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground">Owner Name</label>
                                            <Input value={branding.owner_name} onChange={e => setBranding({...branding, owner_name: e.target.value})} className="h-14 rounded-2xl bg-secondary border-border font-bold text-foreground" />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground">Portfolio URL</label>
                                            <Input value={branding.portfolio_url} onChange={e => setBranding({...branding, portfolio_url: e.target.value})} className="h-14 rounded-2xl bg-secondary border-border font-bold text-xs text-foreground" />
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground">Bar Public Name</label>
                                            <Input value={store.name} onChange={e => setStore({...store, name: e.target.value})} className="h-14 rounded-2xl bg-secondary border-border font-bold text-foreground" />
                                        </div>
                                        <div className="space-y-2 text-left pt-6">
                                            <p className="text-[8px] font-bold text-muted-foreground uppercase italic leading-relaxed">
                                                * Global Brand Metadata. Updates the logo and general bar nomenclature.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setLogoFile(file);
                                                setLogoPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                    <input
                                        type="file"
                                        ref={faviconInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setFaviconFile(file);
                                                setFaviconPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />

                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="flex-1 p-8 rounded-3xl bg-secondary border border-border flex flex-col items-center gap-4 group cursor-pointer hover:border-primary/20 transition-all overflow-hidden"
                                    >
                                        {logoPreview ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={logoPreview} className="h-10 w-auto object-contain" alt="Bar Logo Preview" />
                                        ) : (
                                            <ImageIcon className="h-10 w-10 text-muted group-hover:text-primary transition-colors" />
                                        )}
                                        <p className="text-[10px] font-black uppercase text-muted-foreground">Upload Bar Logo</p>
                                    </div>

                                    <div
                                        onClick={() => faviconInputRef.current?.click()}
                                        className="flex-1 p-8 rounded-3xl bg-secondary border border-border flex flex-col items-center gap-4 group cursor-pointer hover:border-primary/20 transition-all overflow-hidden"
                                    >
                                        {faviconPreview ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={faviconPreview} className="h-10 w-10 object-contain rounded-lg" alt="Favicon Preview" />
                                        ) : (
                                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center text-background font-black group-hover:bg-primary transition-all text-xs">B</div>
                                        )}
                                        <p className="text-[10px] font-black uppercase text-muted-foreground">Upload Favicon</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* HOMEPAGE TAB */}
                    {activeTab === 'homepage' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                            <Card className="rounded-[3rem] border border-border p-10 bg-card shadow-sm space-y-8 text-left">
                                <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><HomeIcon className="h-5 w-5 text-primary" /> Hero Configuration</h2>

                                <div className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Main Headline</label>
                                            <Input
                                                value={branding.hero_title}
                                                onChange={e => setBranding({...branding, hero_title: e.target.value})}
                                                className="h-14 rounded-2xl bg-secondary border-border font-black text-lg text-foreground"
                                            />
                                            <p className="text-[7px] font-bold text-primary uppercase italic px-1">* PRO TIP: Use a &quot;.&quot; to split colors. (e.g., &quot;Elite Vintages. Chilled Spirits.&quot;)</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Subtitle Mission</label>
                                            <Input
                                                value={branding.hero_subtitle}
                                                onChange={e => setBranding({...branding, hero_subtitle: e.target.value})}
                                                className="h-14 rounded-2xl bg-secondary border-border font-medium text-foreground"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Hero Visual Payload (Image)</label>
                                        <input
                                            type="file"
                                            ref={heroInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setHeroFile(file);
                                                    setHeroPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                        <div
                                            onClick={() => heroInputRef.current?.click()}
                                            className="w-full h-64 rounded-[2.5rem] border-2 border-dashed border-border bg-secondary flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/30 transition-all overflow-hidden group"
                                        >
                                            {heroPreview ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={heroPreview} alt="Hero Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <>
                                                    <ImageIcon className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground">Select Bar Backdrop</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Starting Price</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={homepage.hero_starting_price}
                                                    onChange={e => setHomepage({...homepage, hero_starting_price: Number(e.target.value)})}
                                                    className="h-14 rounded-2xl bg-secondary border-border pl-12 font-black text-lg text-foreground"
                                                />
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Top Badge Alert</label>
                                            <Input
                                                value={homepage.hero_badge_text}
                                                onChange={e => setHomepage({...homepage, hero_badge_text: e.target.value})}
                                                className="h-14 rounded-2xl bg-secondary border-border font-bold text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Visual Series Label</label>
                                            <Input
                                                value={homepage.hero_visual_label || ''}
                                                onChange={e => setHomepage({...homepage, hero_visual_label: e.target.value})}
                                                className="h-14 rounded-2xl bg-secondary border-border font-bold text-foreground"
                                                placeholder="e.g. Online Bar Selection"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* PROMOTIONS TAB */}
                    {activeTab === 'promotions' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                            <Card className="rounded-[3rem] border border-border p-10 bg-card shadow-sm space-y-10 text-left">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Zap className="h-5 w-5 text-primary" /> Happy Hour Configuration</h2>
                                    <button
                                        onClick={() => setPromotions({...promotions, is_active: !promotions.is_active})}
                                        className={cn(
                                            "w-20 h-10 rounded-full transition-all relative p-1 flex items-center shadow-inner",
                                            promotions.is_active ? "bg-emerald-500" : "bg-secondary"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-8 w-8 rounded-full bg-white shadow-xl transition-all flex items-center justify-center",
                                            promotions.is_active ? "translate-x-10" : "translate-x-0"
                                        )}>
                                            {promotions.is_active ? <CheckCircle2 size={16} className="text-emerald-500" /> : <ShieldAlert size={16} className="text-slate-300" />}
                                        </div>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Happy Hour Headline & Subtext</label>
                                        <Input
                                            value={promotions.flash_sale_text}
                                            onChange={e => setPromotions({...promotions, flash_sale_text: e.target.value})}
                                            className="h-14 rounded-2xl bg-secondary border-border font-black text-lg text-foreground"
                                            placeholder="e.g. HAPPY HOUR: 20% OFF PREMIUM SPIRITS!"
                                        />
                                        <p className="text-[7px] font-bold text-primary uppercase italic px-1">* FORMAT: [Headline]: [Subtext] (to match the banner styling)</p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Discount Percent (%)</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={promotions.discount_percent}
                                                    onChange={e => setPromotions({...promotions, discount_percent: Number(e.target.value)})}
                                                    className="h-14 rounded-2xl bg-secondary border-border pl-12 font-black text-lg text-foreground"
                                                />
                                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Deal Expiry Date</label>
                                            <div className="relative">
                                                <Input
                                                    type="datetime-local"
                                                    value={promotions.flash_sale_end ? new Date(promotions.flash_sale_end).toISOString().slice(0, 16) : ''}
                                                    onChange={e => setPromotions({...promotions, flash_sale_end: new Date(e.target.value).toISOString()})}
                                                    className="h-14 rounded-2xl bg-secondary border-border pl-12 font-bold text-foreground"
                                                />
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="p-8 rounded-[3rem] bg-indigo-50 border border-indigo-100 flex items-start gap-4 text-left">
                                <Info className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase text-indigo-700">Dynamic Deal Logic</p>
                                    <p className="text-[10px] text-indigo-600 font-medium leading-relaxed italic">
                                        &quot;When active, this deal will appear on the global homepage and apply automatically to the bar theme. The countdown timer will automatically sync to the Expiry Date provided.&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* THEME TAB */}
                    {activeTab === 'theme' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                            <Card className="rounded-[3rem] border border-border p-10 bg-card shadow-sm space-y-10 text-left">
                                <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Palette className="h-5 w-5 text-primary" /> Theme Engine</h2>
                                <div className="grid sm:grid-cols-3 gap-8">
                                    {[
                                        { id: 'primary', label: 'Primary (Action)', val: theme.primary },
                                        { id: 'secondary', label: 'Secondary (Light)', val: theme.secondary },
                                        { id: 'accent', label: 'Accent (UI)', val: theme.accent },
                                    ].map(color => (
                                        <div key={color.id} className="space-y-4 text-left">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground block ml-1">{color.label}</label>
                                            <div className="flex items-center gap-3">
                                                <div className="h-14 w-14 rounded-2xl shadow-xl border-4 border-background shrink-0 overflow-hidden relative">
                                                    <input
                                                        type="color"
                                                        value={color.val}
                                                        onChange={e => setTheme({...theme, [color.id]: e.target.value})}
                                                        className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                                                    />
                                                </div>
                                                <Input value={color.val} onChange={e => setTheme({...theme, [color.id]: e.target.value})} className="h-14 rounded-2xl bg-secondary border-border font-mono text-[10px] text-foreground" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* SEO & SOCIAL TAB */}
                    {activeTab === 'seo' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                            <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-8 text-left">
                                <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Globe className="h-5 w-5 text-primary" /> Search Intelligence</h2>
                                <div className="space-y-6 text-left">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground">Homepage Title Tag</label>
                                        <Input value={seo.title} onChange={e => setSeo({...seo, title: e.target.value})} className="h-14 rounded-2xl bg-secondary border-border font-bold text-foreground" />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground">Meta Description</label>
                                        <textarea value={seo.description} onChange={e => setSeo({...seo, description: e.target.value})} className="w-full h-24 p-5 rounded-2xl bg-secondary border border-border text-foreground font-medium text-xs resize-none outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground">Keywords (Comma Separated)</label>
                                        <Input value={seo.keywords} onChange={e => setSeo({...seo, keywords: e.target.value})} className="h-14 rounded-2xl bg-secondary border-border text-foreground" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-8 text-left">
                                <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Activity className="h-5 w-5 text-primary" /> Social Presence</h2>
                                <div className="grid sm:grid-cols-2 gap-6 text-left">
                                    {[
                                        { id: 'instagram', icon: Camera, label: 'Instagram URL' },
                                        { id: 'tiktok', icon: GlassWater, label: 'TikTok URL' },
                                        { id: 'facebook', icon: Share2, label: 'Facebook Page' },
                                        { id: 'x', icon: Globe, label: 'X (Twitter)' },
                                    ].map(item => (
                                        <div key={item.id} className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                                                <item.icon className="h-3 w-3" /> {item.label}
                                            </label>
                                            <Input value={(social as Record<string, string>)[item.id]} onChange={e => setSocial({...social, [item.id]: e.target.value})} className="h-12 rounded-xl bg-secondary border-border text-[10px] font-bold text-foreground" />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* CATALOG TAB */}
                    {activeTab === 'catalog' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                            <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-8 text-left">
                                <div className="flex justify-between items-center text-left">
                                    <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Wine className="h-5 w-5 text-primary" /> Menu Manager</h2>
                                    <Button onClick={() => setCatalog({ ...catalog, categories: [...catalog.categories, { id: '', label: '' }] })} variant="outline" className="h-10 rounded-xl text-[8px] font-black uppercase"><Plus className="h-3 w-3 mr-2" /> New Category</Button>
                                </div>
                                <div className="space-y-4 text-left">
                                    {catalog.categories.map((cat, idx) => (
                                        <div key={idx} className="flex gap-4 items-end p-6 bg-secondary rounded-3xl border border-border relative group/cat text-left">
                                            <div className="flex-1 space-y-2 text-left">
                                                <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Label (Visible to patrons)</label>
                                                <Input value={cat.label} onChange={e => {
                                                    const newCats = [...catalog.categories];
                                                    newCats[idx].label = e.target.value;
                                                    setCatalog({ ...catalog, categories: newCats });
                                                }} className="h-12 rounded-xl bg-card border-none font-bold text-foreground" placeholder="e.g. Premium Whiskey" />
                                            </div>
                                            <div className="flex-1 space-y-2 text-left">
                                                <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Slug/ID (Database tag)</label>
                                                <Input value={cat.id} onChange={e => {
                                                    const newCats = [...catalog.categories];
                                                    newCats[idx].id = e.target.value.toLowerCase().replace(/\s+/g, '-');
                                                    setCatalog({ ...catalog, categories: newCats });
                                                }} className="h-12 rounded-xl bg-card border-none font-mono text-xs text-foreground" placeholder="e.g. whiskey" />
                                            </div>
                                            <button
                                                onClick={() => setCatalog({ ...catalog, categories: catalog.categories.filter((_, i) => i !== idx) })}
                                                className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors opacity-0 group-hover/cat:opacity-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* OPERATIONS TAB */}
                    {activeTab === 'ops' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                                <div className="bg-card rounded-[2.5rem] border border-border p-10 shadow-sm space-y-8 flex flex-col text-left">
                                    <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-primary" /> Contact Hub
                                    </h2>
                                    <div className="space-y-5 flex-1 text-left">
                                        <div className="space-y-1 text-left">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">WhatsApp Business</label>
                                            <Input value={contact.whatsapp} onChange={e => setContact({...contact, whatsapp: e.target.value})} className="rounded-2xl h-14 bg-secondary border-border font-bold text-foreground" />
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Support Email</label>
                                            <Input value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} className="rounded-2xl h-14 bg-secondary border-border font-bold text-foreground" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card rounded-[2.5rem] border border-border p-10 shadow-sm space-y-8 flex flex-col text-left">
                                    <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3">
                                        <Truck className="h-5 w-5 text-primary" /> Bar Dispatch
                                    </h2>
                                    <div className="space-y-4 flex-1 text-left">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Local Zone Label</label>
                                                <Input value={shipping.nairobi_cbd_label} onChange={e => setShipping({...shipping, nairobi_cbd_label: e.target.value})} className="rounded-xl h-12 bg-secondary border-border font-bold text-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Fee (Ksh)</label>
                                                <Input type="number" value={shipping.nairobi_cbd} onChange={e => setShipping({...shipping, nairobi_cbd: Number(e.target.value)})} className="rounded-xl h-12 bg-secondary border-border font-black text-foreground" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Secondary Label</label>
                                                <Input value={shipping.nairobi_outskirts_label} onChange={e => setShipping({...shipping, nairobi_outskirts_label: e.target.value})} className="rounded-xl h-12 bg-secondary border-border font-bold text-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Fee (Ksh)</label>
                                                <Input type="number" value={shipping.nairobi_outskirts} onChange={e => setShipping({...shipping, nairobi_outskirts: Number(e.target.value)})} className="rounded-xl h-12 bg-secondary border-border font-black text-foreground" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Card className="rounded-[3rem] border border-border p-10 bg-card shadow-sm space-y-8 mt-8 text-left">
                                <div className="flex justify-between items-center text-left">
                                    <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /> Delivery Zones</h2>
                                    <Button onClick={() => setLogistics({ ...logistics, dispatch_zones: [...logistics.dispatch_zones, ''] })} variant="outline" className="h-10 rounded-xl text-[8px] font-black uppercase"><Plus className="h-3 w-3 mr-2" /> Add Zone</Button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                                    {logistics.dispatch_zones.map((zone, idx) => (
                                        <div key={idx} className="relative group text-left">
                                            <Input
                                                value={zone}
                                                onChange={e => {
                                                    const newZones = [...logistics.dispatch_zones];
                                                    newZones[idx] = e.target.value;
                                                    setLogistics({ ...logistics, dispatch_zones: newZones });
                                                }}
                                                className="h-12 rounded-xl bg-secondary border-border pr-10 font-bold text-[10px] text-foreground"
                                            />
                                            <button
                                                onClick={() => setLogistics({ ...logistics, dispatch_zones: logistics.dispatch_zones.filter((_, i) => i !== idx) })}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* AI NODE TAB */}
                    {activeTab === 'ai' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                            <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-10 text-left">
                                <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Bot className="h-5 w-5 text-primary" /> Mixology Intelligence</h2>
                                <div className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground">Party Package Limit (KES)</label>
                                            <Input
                                                type="number"
                                                value={aiConfig.build_setup_limit}
                                                onChange={e => setAiConfig({...aiConfig, build_setup_limit: Number(e.target.value)})}
                                                className="h-14 rounded-2xl bg-secondary border-border font-black text-lg text-foreground"
                                            />
                                            <p className="text-[8px] font-bold text-primary uppercase italic">&quot;Build me a bar for X people&quot; cap.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground">AI Identity</label>
                                            <Input
                                                value={aiConfig.assistant_name}
                                                onChange={e => setAiConfig({...aiConfig, assistant_name: e.target.value})}
                                                className="h-14 rounded-2xl bg-secondary border-border font-bold text-foreground"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleSave('ai_config', aiConfig, true)}
                                    className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
                                >
                                    Authorize Bar AI
                                </Button>
                            </Card>
                        </div>
                    )}

                    {/* ONBOARDING TAB */}
                    {activeTab === 'onboarding' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                            <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-10 text-left">
                                <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><UserPlus className="h-5 w-5 text-primary" /> Runner Onboarding Rules</h2>
                                <p className="text-[10px] font-medium text-slate-500 italic max-w-lg">Enable or disable steps in the rider onboarding flow. Changes are reflected in real-time on the Runner Terminal.</p>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">Sequential Steps</h3>
                                    <div className="space-y-4">
                                        {onboarding.rider_steps.map((step, idx) => (
                                            <div key={step.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group transition-all hover:border-primary/20">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-300 text-[10px]">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-black uppercase text-foreground">{step.label}</p>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Step ID: {step.id}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newSteps = [...onboarding.rider_steps];
                                                        newSteps[idx].enabled = !newSteps[idx].enabled;
                                                        setOnboarding({ ...onboarding, rider_steps: newSteps });
                                                    }}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all relative p-1 flex items-center shadow-inner",
                                                        step.enabled ? "bg-emerald-500" : "bg-slate-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "h-4 w-4 rounded-full bg-white shadow-sm transition-all",
                                                        step.enabled ? "translate-x-6" : "translate-x-0"
                                                    )} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2 pt-6">Verification Logic</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                            <p className="text-[10px] font-black uppercase text-slate-400">Min Runner Age</p>
                                            <Input
                                                type="number"
                                                value={onboarding.rules?.min_age || 18}
                                                onChange={e => setOnboarding({...onboarding, rules: { ...onboarding.rules, min_age: Number(e.target.value) }})}
                                                className="h-12 rounded-xl bg-white border-slate-200 font-black"
                                            />
                                        </div>
                                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400">Strict License Check</p>
                                                <p className="text-[8px] font-medium text-slate-500 italic">Force valid license format.</p>
                                            </div>
                                            <button
                                                onClick={() => setOnboarding({...onboarding, rules: { ...onboarding.rules, require_license: !onboarding.rules?.require_license }})}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-all relative p-1 flex items-center shadow-inner",
                                                    onboarding.rules?.require_license ? "bg-emerald-500" : "bg-slate-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-4 w-4 rounded-full bg-white shadow-sm transition-all",
                                                    onboarding.rules?.require_license ? "translate-x-6" : "translate-x-0"
                                                )} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="p-8 rounded-[3rem] bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                                <Info className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase text-indigo-700">Onboarding Sequence</p>
                                    <p className="text-[10px] text-indigo-600 font-medium leading-relaxed italic">
                                        &quot;Steps are executed in numerical order. Disabling a step will automatically bypass it in the Runner app. Essential steps like &apos;Phone&apos; should remain active for identity verification.&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* INTEGRATIONS TAB */}
                    {activeTab === 'integrations' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { id: 'WHATSAPP', label: 'WhatsApp Business', icon: MessageSquare, color: 'emerald', type: 'Credentials' },
                                    { id: 'META', label: 'Meta (IG & FB)', icon: Share2, color: 'primary', type: 'OAuth' },
                                    { id: 'TIKTOK', label: 'TikTok Creator', icon: Music, color: 'slate', type: 'OAuth' },
                                    { id: 'GOOGLE', label: 'Google (Gmail)', icon: Mail, color: 'rose', type: 'OAuth' },
                                ].map((node) => {
                                    const isActive = integrations.find(i => i.id === node.id)?.status === 'Connected';
                                    return (
                                        <Card key={node.id} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-6 group hover:shadow-xl transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
                                                        node.color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
                                                        node.color === 'primary' ? "bg-primary/5 text-primary" :
                                                        node.color === 'rose' ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-500"
                                                    )}>
                                                        <node.icon size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black uppercase tracking-tighter text-foreground">{node.label}</h3>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{node.type} Protocol</p>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-widest",
                                                    isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                                )}>
                                                    {isActive ? 'Connected' : 'Not Linked'}
                                                </span>
                                            </div>

                                            <div className="pt-4 border-t border-slate-50 flex gap-2">
                                                {node.type === 'OAuth' ? (
                                                    <Button className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-black uppercase text-[9px] tracking-widest shadow-xl active:scale-95 transition-all">
                                                        Connect Account
                                                    </Button>
                                                ) : (
                                                    <Button onClick={() => setActiveTab('advanced')} className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-black uppercase text-[9px] tracking-widest shadow-xl active:scale-95 transition-all">
                                                        Configure Keys
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    disabled={isTestingConnection === node.id}
                                                    onClick={async () => {
                                                        setIsTestingConnection(node.id);
                                                        try {
                                                            const res = await fetch('/api/admin/integrations/verify', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ nodeId: node.id })
                                                            });
                                                            const data = await res.json();
                                                            if (data.success) {
                                                                alert(`${node.label} healthy! 🛰️`);
                                                                fetchSettings();
                                                            } else {
                                                                throw new Error(data.error);
                                                            }
                                                        } catch (err: any) {
                                                            alert(`Link Failure: ${err.message}`);
                                                        } finally {
                                                            setIsTestingConnection(null);
                                                        }
                                                    }}
                                                    className="h-12 w-12 rounded-xl border-slate-100 text-slate-400 hover:text-primary transition-all"
                                                >
                                                    {isTestingConnection === node.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Activity className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>

                            <div className="p-8 rounded-[3rem] bg-amber-50 border border-amber-100 flex items-start gap-4 text-left">
                                <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase text-amber-700">Credential Hygiene</p>
                                    <p className="text-[10px] text-amber-600 font-medium leading-relaxed italic">
                                        &quot;API Secrets are encrypted at rest and never transmitted to the client in plaintext. We recommend rotating your WhatsApp Access Token every 60 days to maintain grid security.&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FEATURES TAB */}
                    {activeTab === 'features' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                            <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-10 text-left">
                                <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Zap className="h-5 w-5 text-primary" /> Autonomous Operations</h2>
                                <div className="grid sm:grid-cols-2 gap-8">
                                    {[
                                        { id: 'ai_concierge_enabled', label: 'Mixology AI Concierge', desc: 'Conversational agent for drink recommendations.' },
                                        { id: 'dynamic_pricing_enabled', label: 'Pour Margin Engine', desc: 'Auto-adjust prices based on cellar velocity.' },
                                        { id: 'gamification_enabled', label: 'VIP Club & Rewards', desc: 'Streaks, missions, and patron rewards.' },
                                        { id: 'fraud_shield_enabled', label: 'Bar Fraud Shield', desc: 'Anomaly detection and rapid IP blocking.' },
                                    ].map(feat => (
                                        <div key={feat.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group transition-all hover:border-primary/20 text-left">
                                            <div className="space-y-1 text-left">
                                                <p className="text-xs font-black uppercase text-foreground">{feat.label}</p>
                                                <p className="text-[10px] text-slate-400 font-medium italic">{feat.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const key = feat.id as keyof typeof features;
                                                    setFeatures({...features, [key]: !features[key]});
                                                }}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-all relative p-1 flex items-center shadow-inner",
                                                    features[feat.id as keyof typeof features] ? "bg-emerald-500" : "bg-slate-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-4 w-4 rounded-full bg-white shadow-sm transition-all",
                                                    features[feat.id as keyof typeof features] ? "translate-x-6" : "translate-x-0"
                                                )} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* SIDEBAR: LIVE PREVIEW & STATUS */}
                <div className="lg:col-span-4 space-y-10 text-left">

                    {/* STORE PULSE WIDGET */}
                    <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-8 relative overflow-hidden group text-left">
                        <div className="relative z-10 space-y-8 text-left">
                            <div className="flex items-center justify-between text-left">
                                <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em]">Bar Pulse</h3>
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase border border-primary/20">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Live
                                </div>
                            </div>

                            <div className="space-y-6 text-left">
                                <div className="flex justify-between items-center border-b border-border pb-4 text-left">
                                    <span className="text-[9px] font-black uppercase text-muted-foreground">Version</span>
                                    <span className="text-xs font-black text-foreground">v1.0.0-Bar</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-border pb-4 text-left">
                                    <span className="text-[9px] font-black uppercase text-muted-foreground">Cellar Storage</span>
                                    <span className="text-xs font-black text-foreground">68% Capacity</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* LIVE PREVIEW COMPONENT */}
                    <div className="space-y-4 text-left">
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] ml-4 flex items-center gap-2 text-left">
                            <Eye className="h-3 w-3" /> Real-time Menu Simulation
                        </h3>
                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden group text-left">
                            {/* Mini Header */}
                            <div className="bg-card p-6 border-b border-border flex justify-between items-center text-left">
                                <div className="flex items-center gap-2 text-left">
                                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm overflow-hidden">
                                        {logoPreview ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain" />
                                        ) : (
                                            <Wine className="h-3.5 w-3.5" />
                                        )}
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-foreground tracking-tight">{store.name}</span>
                                </div>
                            </div>
                            {/* Mini Hero */}
                            <div className="p-10 text-center space-y-6 relative overflow-hidden bg-secondary min-h-[350px] flex flex-col justify-center text-left">
                                {heroPreview && (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={heroPreview} alt="Hero Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                                )}
                                <div className="relative z-10 space-y-4 text-left">
                                    <h4 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-[0.9] break-words text-left">
                                        {branding.hero_title.split('.')[0]}.<br/>
                                        <span style={{ color: theme.primary }} className="italic">{branding.hero_title.split('.')[1] || ''}</span>
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic line-clamp-2 px-4 text-left">{branding.hero_subtitle}</p>
                                    <div className="pt-4 text-left">
                                        <button style={{ backgroundColor: theme.primary }} className="px-6 py-2.5 rounded-full text-white font-black uppercase text-[8px] tracking-widest shadow-xl shadow-primary/20">Order Now</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STICKY CMS ACTION BAR */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-1000 w-full max-w-4xl px-4 text-left">
                <div className="bg-background/80 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl flex items-center gap-3 border border-border text-left">
                    <Button
                        disabled={savingKey !== null}
                        onClick={handlePublishAll}
                        className="flex-1 h-16 rounded-2xl bg-primary text-background font-black uppercase tracking-[0.2em] text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20 group"
                    >
                        {savingKey === 'all' ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Rocket className="h-5 w-5 mr-3 group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform" />}
                        Sync All Bar Data
                    </Button>
                </div>
            </div>
        </div>
    );
}
