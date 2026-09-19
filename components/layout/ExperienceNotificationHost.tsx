'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import ExperienceToast, { ToastProps } from './ExperienceToast';

/**
 * GLOBAL NOTIFICATION HOST
 * Listens for real-time alerts dispatched to the current user.
 */
export default function ExperienceNotificationHost() {
    const [toasts, setToasts] = React.useState<ToastProps[]>([]);

    React.useEffect(() => {
        let isMounted = true;

        async function setupRealtime() {
            if (!supabase) return;

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const userId = session.user.id;

            // Subscribe to the notifications log for this user
            const channel = supabase
                .channel(`experience-alerts-${userId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications_log',
                        filter: `user_id=eq.${userId}`
                    },
                    async (payload: { new: { template_id: string, payload: Record<string, string | number>, id: string } }) => {
                        if (!isMounted || !supabase) return;

                        try {
                            // Fetch template details to build the toast
                            const { data: template, error: templateError } = await supabase
                                .from('notification_templates')
                                .select('*')
                                .eq('id', payload.new.template_id)
                                .maybeSingle();

                            if (template && !templateError) {
                                const payloadData = payload.new.payload || {};
                                const hydratedTitle = hydrateTemplate(template.title, payloadData);
                                const hydratedMessage = hydrateTemplate(template.message, payloadData);

                                const newToast: ToastProps = {
                                    id: payload.new.id,
                                    title: hydratedTitle,
                                    message: hydratedMessage,
                                    icon: template.icon,
                                    style: template.style,
                                    actionUrl: template.cta_url ? hydrateTemplate(template.cta_url, payloadData) : undefined,
                                    duration: template.duration,
                                    onClose: removeToast
                                };

                                setToasts(prev => [newToast, ...prev].slice(0, 3)); // Max 3 visible
                            }
                        } catch (err) {
                            console.error("[ExperienceHost] Payload processing failed:", err);
                        }
                    }
                )
                .subscribe();

            return () => {
                if (supabase) supabase.removeChannel(channel);
            };
        }

        setupRealtime();

        return () => {
            isMounted = false;
        };
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    function hydrateTemplate(text: string, context: Record<string, string | number | undefined>): string {
        return text.replace(/{{(.*?)}}/g, (match, key) => {
            const value = context[key.trim()];
            return value !== undefined ? String(value) : match;
        });
    }

    return (
        <div className="fixed top-6 right-6 lg:top-10 lg:right-10 z-[2000] flex flex-col gap-4 pointer-events-none w-full max-w-[400px]">
            {toasts.map((toast) => (
                <ExperienceToast key={toast.id} {...toast} />
            ))}
        </div>
    );
}
