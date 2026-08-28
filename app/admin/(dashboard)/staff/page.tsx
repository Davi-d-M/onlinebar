'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  UserPlus,
  Lock,
  RefreshCcw,
  Zap,
  Eye,
  Package,
  ShoppingCart,
  Settings,
  ShieldAlert,
  Loader2,
  Clock,
  HandCoins,
  MessageSquare,
  Megaphone,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { logAuditAction } from '@/lib/auditService';
import { ROLE_PERMISSIONS, Role, Permission } from '@/lib/engines/identityEngine';

interface StaffMember {
  id: string;
  email: string;
  role: Role;
  status: string;
  last_activity_at: string;
  completed_tasks: number;
  overdue_tasks: number;
  sla_rating: number;
  pin?: string;
  can_view_revenue: boolean;
  can_manage_inventory: boolean;
  can_manage_orders: boolean;
  can_execute_payouts: boolean;
  can_view_audit_logs: boolean;
  can_manage_settings: boolean;
  can_manage_staff: boolean;
  can_view_sensitive_data: boolean;
  can_manage_communications: boolean;
  can_manage_marketing: boolean;
  created_at: string;
}

export default function AdminStaffPage() {
  const { email: adminEmail } = useAdmin();
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newEmail, setNewEmail] = React.useState('');
  const [newRole, setNewRole] = React.useState<Role>('STAFF');
  const [newPin, setNewPin] = React.useState('');

  const [permissions, setPermissions] = React.useState<Record<string, boolean>>({
    can_view_revenue: false,
    can_manage_inventory: true,
    can_manage_orders: true,
    can_execute_payouts: false,
    can_view_audit_logs: false,
    can_manage_settings: false,
    can_manage_staff: false,
    can_view_sensitive_data: false,
    can_manage_communications: false,
    can_manage_marketing: false
  });

  const [isAdding, setIsAdding] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync Permissions with Role Choice
  React.useEffect(() => {
    const rolePerms = ROLE_PERMISSIONS[newRole] || [];
    const newPerms: Record<string, boolean> = {};

    // Map Permission strings to DB column keys
    const map: Record<Permission, string> = {
        'CAN_VIEW_REVENUE': 'can_view_revenue',
        'CAN_MANAGE_INVENTORY': 'can_manage_inventory',
        'CAN_MANAGE_ORDERS': 'can_manage_orders',
        'CAN_EXECUTE_PAYOUTS': 'can_execute_payouts',
        'CAN_VIEW_AUDIT_LOGS': 'can_view_audit_logs',
        'CAN_MANAGE_SETTINGS': 'can_manage_settings',
        'CAN_MANAGE_STAFF': 'can_manage_staff',
        'CAN_VIEW_SENSITIVE_DATA': 'can_view_sensitive_data',
        'CAN_MANAGE_COMMUNICATIONS': 'can_manage_communications',
        'CAN_MANAGE_MARKETING': 'can_manage_marketing'
    };

    Object.values(map).forEach(key => newPerms[key] = false);
    rolePerms.forEach(p => {
        const key = map[p];
        if (key) newPerms[key] = true;
    });

    setPermissions(newPerms);
  }, [newRole]);

  const fetchStaffData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setStaff(data as StaffMember[]);
    } catch (err: unknown) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load team grid.' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStaffData();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !supabase) return;

    setIsAdding(true);
    setMessage(null);

    try {
      const { data: userData, error: rpcError } = await supabase.rpc('get_user_id_by_email', {
          email_input: (newEmail || '').trim().toLowerCase()
      });

      if (rpcError || !userData || userData.length === 0) {
          throw new Error("Patron must exist on the bar grid first. Ask them to sign up.");
      }

      const userId = userData[0].id;

      const { error } = await supabase
        .from('staff')
        .insert([{
            id: userId,
            email: (newEmail || '').trim().toLowerCase(),
            role: newRole,
            pin: newPin.trim() || null,
            ...permissions
        }]);

      if (error) {
          if (error.code === '23505') throw new Error("This unit is already operational in the staff node.");
          throw error;
      }

      setMessage({ type: 'success', text: `Unit ${newEmail} authorized as ${newRole}.` });
      if (adminEmail) await logAuditAction(adminEmail, 'ADD_STAFF', { email: newEmail, role: newRole });
      setNewEmail('');
      setNewPin('');
      fetchStaffData();
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ type: 'error', text: error.message || "Uplink interrupted." });
    } finally {
      setIsAdding(false);
    }
  };

  const updatePermission = async (id: string, field: string, value: boolean) => {
      if (!supabase) return;
      const { error } = await supabase.from('staff').update({ [field]: value }).eq('id', id);
      if (!error) {
          if (adminEmail) await logAuditAction(adminEmail, 'UPDATE_PERMISSION', { id, field, value });
          setStaff(staff.map(s => s.id === id ? { ...s, [field]: value } : s));
      }
  };

  const removeStaff = async (id: string) => {
      if (!supabase || !confirm("Revoke all access for this unit?")) return;
      const member = staff.find(s => s.id === id);
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (!error) {
          if (adminEmail) await logAuditAction(adminEmail, 'REMOVE_STAFF', { id, email: member?.email });
          setStaff(staff.filter(s => s.id !== id));
          setMessage({ type: 'success', text: 'Unit access revoked.' });
      }
  };

  return (
    <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Workforce Command</span>
          </div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Identity Hub</h1>
          <p className="text-muted-foreground text-sm font-medium mt-2">Manage team operational parameters and granular permission nodes.</p>
        </div>
        <Button onClick={fetchStaffData} variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all active:scale-95">
            <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Sync Node
        </Button>
      </header>

      {message && (
          <div className={cn(
              "p-6 rounded-[2rem] border-2 flex items-center gap-4 animate-in slide-in-from-top-4",
              message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
          )}>
              {message.type === 'success' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
              <p className="text-sm font-black uppercase tracking-widest">{message.text}</p>
          </div>
      )}

      <div className="grid lg:grid-cols-12 gap-10">

          {/* AUTHORIZATION FORM */}
          <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-10">
                  <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><UserPlus size={24} /></div>
                      <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">Authorize Unit</h2>
                  </div>

                  <form onSubmit={handleAddStaff} className="space-y-8">
                      <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Email Identifier</label>
                          <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="unit@onlinebar.co.ke" className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Operational Role</label>
                            <select
                                value={newRole}
                                onChange={e => setNewRole(e.target.value as Role)}
                                className="w-full h-14 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-[10px] font-black uppercase outline-none"
                            >
                                <option value="STAFF">Staff</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                                <option value="OPERATIONS_ADMIN">Operations</option>
                                <option value="FINANCE_ADMIN">Finance</option>
                                <option value="SUPPORT_ADMIN">Support</option>
                                <option value="RIDER_MANAGER">Rider Mgr</option>
                                <option value="VIEWER">Viewer</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Security PIN</label>
                            <Input
                                maxLength={4}
                                value={newPin}
                                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="0000"
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-black text-center text-lg"
                            />
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-slate-100">
                          <p className="text-[9px] font-black uppercase text-foreground mb-4 tracking-widest">Permission Matrix (Auto-Preset)</p>
                          <div className="grid grid-cols-2 gap-2">
                              {Object.entries(permissions).map(([key, val]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => setPermissions({...permissions, [key]: !val})}
                                    className={cn(
                                        "px-3 py-2 rounded-xl border transition-all text-[8px] font-black uppercase flex justify-between items-center",
                                        val ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-400 border-slate-100"
                                    )}
                                  >
                                      {key.replace('can_', '').replace(/_/g, ' ')}
                                      {val ? <Lock size={10} /> : <Plus size={10} />}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <Button type="submit" disabled={isAdding} className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">
                          {isAdding ? <Loader2 className="animate-spin" /> : <><Zap size={16} className="mr-2" /> Activate Unit</>}
                      </Button>
                  </form>
              </Card>
          </div>

          {/* TEAM DIRECTORY */}
          <div className="lg:col-span-8 space-y-8">
              <Card className="rounded-[3rem] border border-slate-100 bg-white shadow-sm overflow-hidden min-h-[600px] text-left">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Users className="h-6 w-6 text-primary" />
                          <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Active Directory</h2>
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">{staff.length} Units Online</span>
                  </div>

                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">
                                  <th className="px-10 py-6">Unit Identity</th>
                                  <th className="px-10 py-6">Status / SLA</th>
                                  <th className="px-10 py-6">Permission Grid</th>
                                  <th className="px-10 py-6 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {staff.map(member => (
                                  <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                                      <td className="px-10 py-8 text-left">
                                          <div className="flex items-center gap-5">
                                              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white font-black uppercase shadow-lg shadow-primary/10 text-xs shrink-0 transition-transform group-hover:scale-110">
                                                  {member.email.substring(0, 2).toUpperCase()}
                                              </div>
                                              <div>
                                                  <span className="font-black text-foreground uppercase text-sm tracking-tight block">{member.email.split('@')[0]}</span>
                                                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1 block italic">{member.role}</span>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-10 py-8">
                                          <div className="flex flex-col gap-2">
                                              <div className="flex items-center gap-2">
                                                  <div className={cn(
                                                      "h-2 w-2 rounded-full",
                                                      member.status === 'Online' ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                                                  )} />
                                                  <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{member.status}</span>
                                              </div>
                                              <div className="flex items-center gap-4">
                                                  <div className="space-y-1">
                                                      <p className="text-[8px] font-black text-slate-400 uppercase">SLA</p>
                                                      <p className="text-xs font-black text-emerald-500">{member.sla_rating}%</p>
                                                  </div>
                                                  <div className="space-y-1">
                                                      <p className="text-[8px] font-black text-slate-400 uppercase">Tasks</p>
                                                      <p className="text-xs font-black text-foreground">{member.completed_tasks}</p>
                                                  </div>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-10 py-8">
                                          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                              {[
                                                  { k: 'can_view_revenue', i: HandCoins },
                                                  { k: 'can_manage_inventory', i: Package },
                                                  { k: 'can_manage_orders', i: ShoppingCart },
                                                  { k: 'can_execute_payouts', i: HandCoins },
                                                  { k: 'can_view_audit_logs', i: HistoryIcon },
                                                  { k: 'can_manage_settings', i: Settings },
                                                  { k: 'can_manage_staff', i: ShieldCheck },
                                                  { k: 'can_view_sensitive_data', i: Lock },
                                                  { k: 'can_manage_communications', i: MessageSquare },
                                                  { k: 'can_manage_marketing', i: Megaphone },
                                              ].map(p => (
                                                  <button
                                                    key={p.k}
                                                    onClick={() => updatePermission(member.id, p.k, !member[p.k as keyof StaffMember])}
                                                    className={cn(
                                                        "h-7 w-7 rounded-lg flex items-center justify-center border transition-all",
                                                        member[p.k as keyof StaffMember]
                                                            ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                                                            : "bg-slate-50 text-slate-300 border-slate-100 hover:border-slate-200"
                                                    )}
                                                    title={p.k.replace('can_', '').replace(/_/g, ' ')}
                                                  >
                                                      <p.i size={12} strokeWidth={3} />
                                                  </button>
                                              ))}
                                          </div>
                                      </td>
                                      <td className="px-10 py-8 text-right">
                                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Link href={`/admin/staff/${member.id}`}>
                                                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100 text-slate-400 hover:text-primary"><Eye size={16} /></Button>
                                              </Link>
                                              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100 text-slate-400 hover:text-primary"><Clock size={16} /></Button>
                                              <Button onClick={() => removeStaff(member.id)} variant="outline" size="icon" className="h-10 w-10 rounded-xl border-rose-100 text-rose-400 hover:bg-rose-50"><Trash2 size={16} /></Button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </Card>

              {/* SECURITY AUDIT SNAPSHOT */}
              <Card className="rounded-[3rem] border border-slate-100 p-10 bg-indigo-600 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-sm"><ShieldAlert size={28} /></div>
                          <h3 className="text-xl font-black uppercase tracking-tighter">Security Protocol 12-A</h3>
                      </div>
                      <p className="text-sm font-medium opacity-80 leading-relaxed italic">&quot;All administrative actions are recorded in an immutable ledger. Multi-factor authentication is enforced for all Level 4 (VIP) operations and above.&quot;</p>
                      <div className="pt-4 flex justify-between items-center border-t border-white/10">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status: Active Monitor</span>
                          <Button variant="ghost" className="text-[10px] font-black uppercase text-white hover:bg-white/10 p-0 h-auto">View Audit Timeline &rarr;</Button>
                      </div>
                  </div>
                  <Database className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12 -z-0" />
              </Card>
          </div>
      </div>
    </div>
  );
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
}

const HistoryIcon = ({ size, ...props }: IconProps) => (
    <svg
        {...props}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </svg>
);
