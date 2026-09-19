'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Store,
  Globe,
  Tag,
  Star,
  ShieldCheck,
  ShieldAlert as SecurityIcon,
  Wine,
  Cookie,
  Bot,
  Flame,
  History as HistoryIcon,
  Settings,
  Target,
  Trophy,
  TrendingUp,
  DollarSign,
  Truck,
  CreditCard,
  Search,
  Bell,
  Activity,
  Layout as LayoutIcon,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  GlassWater,
  Beer,
  Calendar,
  Smartphone,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AdminProvider, Permissions } from '@/context/AdminContext';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';
import GlobalCommandPalette from '@/components/admin/GlobalCommandPalette';
import LiveActivitySidebar from '@/components/admin/LiveActivitySidebar';
import NotificationCenter from '@/components/admin/NotificationCenter';
import { logAuditAction } from '@/lib/auditService';
import { supabase } from '@/lib/supabaseClient';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  role: 'owner' | 'admin' | 'staff' | 'supplier' | 'viewer';
  email: string;
  permissions: Permissions;
  supplier_id?: string | null;
}

export default function AdminLayoutClient({
  children,
  role,
  email,
  permissions,
  supplier_id,
}: AdminLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
      const savedSidebar = localStorage.getItem('admin_sidebar_collapsed');

      if (savedSidebar === 'true') {
          setIsSidebarCollapsed(true);
      }

      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
              e.preventDefault();
              setIsSearchOpen(true);
          }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Phase 9: Bar Grid Bridge (Offline Sync Node)
      const barWindow = window as unknown as {
        onTitanOfflineSync: boolean;
        onTitanSyncOrder: (orderId: string) => Promise<void>;
      };

      barWindow.onTitanOfflineSync = true;
      barWindow.onTitanSyncOrder = async (orderId: string) => {
          if (!supabase) return;
          try {
              const { error } = await supabase
                  .from('orders')
                  .update({ status: 'Delivered', captured_by: 'bar-offline-sync' })
                  .eq('id', parseInt(orderId));

              if (error) throw error;
          } catch (err) {
              console.error(`📡 [BAR_BRIDGE] Sync Failed: ${orderId}`, err);
          }
      };

      return () => {
          window.removeEventListener('keydown', handleKeyDown);
          delete (barWindow as unknown as Record<string, unknown>).onTitanOfflineSync;
          delete (barWindow as unknown as Record<string, unknown>).onTitanSyncOrder;
      };
  }, []);

  const toggleSidebarCollapse = () => {
      const next = !isSidebarCollapsed;
      setIsSidebarCollapsed(next);
      localStorage.setItem('admin_sidebar_collapsed', String(next));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logAuditAction(email, 'OS_SESSION_END', { duration: 'calculated-on-server' });
      document.cookie = 'admin_session=; path=/; max-age=0';
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const isOwner = role === 'owner';
  const isAdmin = role === 'admin' || isOwner;

  const allNavItems = [
    { group: 'SHIFT CONTROL', items: [
      { name: 'Shift Console', href: '/admin', icon: LayoutDashboard, minRole: 'viewer' },
    ]},
    { group: 'INVENTORY', items: [
      { name: 'Cellar Hub', href: '/admin/upload', icon: Wine, permission: 'can_manage_inventory' },
      { name: 'Product Forge', href: '/admin/forge', icon: Zap, permission: 'can_manage_inventory' },
      { name: 'Munchie Hub', href: '/admin/munchies', icon: Cookie, permission: 'can_manage_inventory' },
      { name: 'Dispatch Queue', href: '/admin/orders', icon: ShoppingCart, permission: 'can_manage_orders' },
    ]},
    { group: 'EXPERIENCE', items: [
      { name: 'Web Widgets', href: '/admin/experience/widgets', icon: LayoutIcon, permission: 'can_manage_settings' },
      { name: 'App Widgets', href: '/admin/experience/mobile-widgets', icon: Smartphone, permission: 'can_manage_settings' },
    ]},
    { group: 'OPERATIONS', items: [
      { name: 'Live Runners', href: '/admin/dispatch', icon: Truck, permission: 'can_manage_orders' },
      { name: 'The Buzz Hub', href: '/admin/buzz', icon: Flame, permission: 'can_manage_marketing' },
      { name: 'Tasks Board', href: '/admin/operations/tasks', icon: LayoutIcon, permission: 'can_manage_orders' },
      { name: 'Partner Bars', href: '/admin/operations/vendors', icon: Store, permission: 'can_manage_settings' },
      { name: 'Global Supply', href: '/admin/operations/sourcing', icon: Globe, permission: 'can_manage_inventory' },
      { name: 'Distributors', href: '/admin/operations/suppliers', icon: Beer, permission: 'can_manage_inventory' },
    ]},
    { group: 'PATRONS', items: [
      { name: 'Directory', href: '/admin/customers', icon: Users, permission: 'can_manage_communications' },
      { name: 'Message Command', href: '/admin/communications/command', icon: MessageSquare, permission: 'can_manage_communications' },
      { name: 'Popup Manager', href: '/admin/communications/popups', icon: Bell, permission: 'can_manage_communications' },
      { name: 'Support Inbox', href: '/admin/messages', icon: MessageSquare, permission: 'can_manage_communications' },
      { name: 'Taste Reviews', href: '/admin/reviews', icon: Star, permission: 'can_manage_communications' },
      { name: 'VIP Rewards', href: '/admin/gamification', icon: Trophy, permission: 'can_manage_settings' },
    ]},
    { group: 'GROWTH', items: [
      { name: 'Content Studio', href: '/admin/growth/content', icon: LayoutIcon, permission: 'can_manage_marketing' },
      { name: 'Tactical Calendar', href: '/admin/growth/calendar', icon: Calendar, permission: 'can_manage_marketing' },
      { name: 'Smart Autopilot', href: '/admin/growth/autopilot', icon: Bot, permission: 'can_manage_marketing' },
      { name: 'Social Nodes', href: '/admin/growth/accounts', icon: Globe, permission: 'can_manage_marketing' },
      { name: 'Marketing Hub', href: '/admin/marketing', icon: TrendingUp, permission: 'can_manage_marketing' },
      { name: 'AI Ad Agency', href: '/admin/marketing/ai-agency', icon: Target, permission: 'can_manage_marketing' },
      { name: 'Affiliates', href: '/admin/affiliates', icon: Users, permission: 'can_manage_affiliates' },
      { name: 'Drink Deals', href: '/admin/coupons', icon: Tag, permission: 'can_manage_marketing' },
    ]},
    { group: 'FINANCE', items: [
      { name: 'Finance Vault', href: '/admin/finance', icon: DollarSign, permission: 'can_view_revenue' },
      { name: 'Payout Requests', href: '/admin/payouts', icon: CreditCard, permission: 'can_view_revenue' },
      { name: 'Ledger Audit', href: '/admin/vault', icon: Lock, permission: 'can_view_revenue' },
    ]},
    { group: 'INTELLIGENCE', items: [
      { name: 'Bar Analytics', href: '/admin/analytics', icon: Activity, permission: 'can_view_revenue' },
      { name: 'Behavioral OS', href: '/admin/behavior', icon: Target, permission: 'can_view_revenue' },
      { name: 'AI Shift Log', href: '/admin/messages?filter=ai', icon: Bot, permission: 'can_manage_customer_care' },
    ]},
    { group: 'ENTERPRISE', items: [
      { name: 'Staff Control', href: '/admin/staff', icon: ShieldCheck, minRole: 'owner' },
      { name: 'Audit Logs', href: '/admin/audit', icon: HistoryIcon, permission: 'can_view_revenue' },
      { name: 'Security Hub', href: '/admin/security', icon: SecurityIcon, permission: 'can_manage_settings' },
      { name: 'Bar Settings', href: '/admin/settings', icon: Settings, permission: 'can_manage_settings' },
    ]},
  ];

  const visibleNavGroups = allNavItems.map(group => ({
      ...group,
      items: group.items.filter(item => {
          if (!role) return false;
          if (isOwner) return true;
          if (item.minRole === 'viewer') return true;
          if (item.permission && permissions && permissions[item.permission as keyof Permissions]) return true;
          if (item.minRole === 'admin') return isAdmin;
          if (item.minRole === 'owner') return isOwner;
          return false;
      })
  })).filter(group => group.items.length > 0);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <AdminProvider role={role} email={email} permissions={permissions} supplier_id={supplier_id}>
      <AdminErrorBoundary>
          <div className="min-h-screen bg-background flex flex-col md:flex-row text-left">

          <GlobalCommandPalette isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
          <LiveActivitySidebar isOpen={isActivityOpen} setIsOpen={setIsActivityOpen} />
          <NotificationCenter isOpen={isNotificationsOpen} setIsOpen={setIsNotificationsOpen} />

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between px-4 py-4 bg-background border-b border-border sticky top-0 z-50 shadow-sm backdrop-blur-xl bg-background/80">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Wine className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-foreground uppercase tracking-tighter text-sm">Bar Admin</span>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-foreground" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className={cn(
            "fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out md:relative shadow-sm border-r border-border bg-background",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            isSidebarCollapsed ? "w-20" : "w-64"
          )}>
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
                <div className={cn("p-8 border-b border-border flex items-center justify-between", isSidebarCollapsed && "p-6")}>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                      <GlassWater className="h-6 w-6 text-white" />
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="animate-in fade-in duration-500 text-left">
                          <select className="font-black text-foreground uppercase tracking-tight text-sm bg-transparent border-none outline-none appearance-none cursor-pointer">
                              <option>Online Bar Master</option>
                              <option>Nairobi Branch</option>
                              <option>VVIP Cellar</option>
                          </select>
                          <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1.5">Bar Command</p>
                        </div>
                    )}
                </div>
                {!isSidebarCollapsed && (
                    <button onClick={toggleSidebarCollapse} className="text-muted-foreground hover:text-primary transition-colors hidden md:block">
                        <PanelLeftClose className="h-4 w-4" />
                    </button>
                )}
              </div>

              {/* Nav Links */}
              <nav className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar">
                {visibleNavGroups.map((group) => (
                  <div key={group.group} className="space-y-3">
                    {!isSidebarCollapsed && (
                      <p className="px-5 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                        {group.group}
                      </p>
                    )}
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          title={isSidebarCollapsed ? item.name : ""}
                          onClick={() => setIsSidebarOpen(false)}
                          className={cn(
                            "flex items-center rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 group",
                            isSidebarCollapsed ? "justify-center p-3.5" : "gap-4 px-5 py-3",
                            isActive(item.href)
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "text-slate-400 hover:bg-slate-50 hover:text-foreground"
                          )}
                        >
                          <item.icon className={cn(
                            "h-4 w-4 transition-colors shrink-0",
                            isActive(item.href) ? "text-white" : "text-slate-300 group-hover:text-slate-500"
                          )} />
                          {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-border">
                <Button
                  variant="ghost"
                  className={cn(
                      "w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]",
                      isSidebarCollapsed ? "justify-center px-0" : "gap-4 px-5"
                  )}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-5 w-5" />
                  {!isSidebarCollapsed && (isLoggingOut ? 'Leaving...' : 'Logout')}
                </Button>

                {isSidebarCollapsed ? (
                    <button onClick={toggleSidebarCollapse} className="mt-6 w-full flex justify-center text-muted-foreground hover:text-primary transition-all">
                        <PanelLeftOpen className="h-5 w-5" />
                    </button>
                ) : (
                    <div className="mt-6 p-4 bg-secondary rounded-3xl flex items-center gap-4 border border-border">
                      <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-white text-xs font-black shadow-lg shadow-primary/20 shrink-0">
                          {(role || 'A').substring(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-black text-foreground uppercase text-[10px] tracking-tight truncate">{role || 'Admin'}</p>
                        <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5 truncate">{email || 'Not Signed In'}</p>
                      </div>
                    </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50/50">

              {/* TOP NAVIGATION BAR */}
              <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 shrink-0 z-40 hidden md:flex sticky top-0">
                  <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center gap-3 px-4 h-10 rounded-xl bg-secondary border border-border text-muted-foreground hover:border-primary/30 transition-all group min-w-[300px] lg:min-w-[400px]"
                      >
                          <Search className="h-3.5 w-3.5 group-hover:text-primary transition-colors shrink-0" />
                          <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-foreground transition-colors">Search Protocol...</span>
                          <kbd className="ml-auto bg-background px-1.5 py-0.5 rounded-md border border-border text-[7px] font-black text-muted-foreground group-hover:text-primary transition-colors">Ctrl + K</kbd>
                      </button>
                  </div>

                  <div className="flex items-center gap-4 lg:gap-6">
                      <div className="flex items-center gap-2 lg:gap-3">
                          <Button onClick={() => setIsActivityOpen(true)} variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 relative">
                              <Activity className="h-4 w-4" />
                          </Button>

                          <Button onClick={() => setIsNotificationsOpen(true)} variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 relative">
                              <Bell className="h-4 w-4" />
                              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-primary rounded-full border-2 border-background"></span>
                          </Button>
                      </div>

                      <div className="h-5 w-px bg-border mx-1 opacity-50"></div>

                      <Link href="/admin/upload">
                          <Button className="h-10 px-6 rounded-xl bg-primary text-white font-black uppercase text-[9px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                              <Wine className="h-3.5 w-3.5" /> Stock Cellar
                          </Button>
                      </Link>
                  </div>
              </header>

              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 no-scrollbar relative scroll-smooth">
                <div className="container mx-auto w-full space-y-10">
                  {children}
                </div>
              </main>
          </div>
        </div>
      </AdminErrorBoundary>
    </AdminProvider>
  );
}
