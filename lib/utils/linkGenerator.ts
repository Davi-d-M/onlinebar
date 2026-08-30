import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: LINK GENERATOR
 * Generates secure, tokenized URLs for partner invites and magic logins.
 */

export async function generatePartnerInvite(role: 'RIDER' | 'SUPPLIER' | 'AFFILIATE', data: { email?: string, phone?: string, targetId: string }) {
    if (!supabase) return null;

    const token = uuidv4().replace(/-/g, '').substring(0, 16);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { error } = await supabase.from('partner_invites').insert([{
        token,
        role,
        email: data.email,
        phone: data.phone,
        target_id: data.targetId,
        expires_at: expiresAt.toISOString()
    }]);

    if (error) throw error;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onlinebar.co.ke';
    return `${baseUrl}/auth/partner?token=${token}`;
}

/**
 * Validates a partner token and returns the role context.
 */
export async function validatePartnerToken(token: string) {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('partner_invites')
        .select('*')
        .eq('token', token)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error || !data) return null;

    return data as { role: string, target_id: string, email?: string, phone?: string };
}
