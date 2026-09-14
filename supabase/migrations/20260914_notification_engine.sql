-- ONLINE BAR: EXPERIENCE NOTIFICATION ENGINE
-- Advanced, template-driven notification system for both transactional and marketing communications.

-- 1. NOTIFICATION TEMPLATES (The Library)
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL, -- Ties to SystemEventType
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    icon TEXT, -- Lucide icon name or URL
    style TEXT DEFAULT 'default', -- 'success', 'error', 'info', 'warning'
    cta_label TEXT,
    cta_url TEXT,
    duration INTEGER DEFAULT 7, -- seconds
    priority TEXT DEFAULT 'NORMAL', -- 'CRITICAL', 'HIGH', 'NORMAL', 'LOW'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. NOTIFICATIONS LOG (Admin Traceability)
CREATE TABLE IF NOT EXISTS public.notifications_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.notification_templates(id),
    status TEXT DEFAULT 'SENT', -- 'SENT', 'DELIVERED', 'SEEN', 'CLICKED', 'DISMISSED'
    payload JSONB DEFAULT '{}'::JSONB, -- Context data used for template variables (e.g. {{order_id}})
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. USER NOTIFICATIONS (The Inbox)
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    icon TEXT,
    style TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_notifications_log_user ON public.notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_log_order ON public.notifications_log(order_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage templates" ON public.notification_templates FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins view log" ON public.notifications_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users view own notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);

-- 4. Seed Initial Templates
INSERT INTO public.notification_templates (name, event_type, title, message, icon, style, priority)
VALUES
('Order Confirmed', 'ORDER_CREATED', 'Order Received ✓', 'We''ve received your order #{{order_id}}. We''re getting your selection ready.', 'CheckCircle', 'success', 'HIGH'),
('Payment Success', 'ORDER_PAID', 'Payment Confirmed ✓', 'Your payment for order #{{order_id}} has been successfully received.', 'Zap', 'success', 'HIGH'),
('Out for Delivery', 'ORDER_DISPATCHED', 'Your Rider is on the way 🚴', 'Your delivery for order #{{order_id}} has been assigned and is being dispatched.', 'Truck', 'info', 'NORMAL'),
('Order Delivered', 'ORDER_DELIVERED', 'Enjoy Responsibly 🥂', 'Your order #{{order_id}} has been delivered successfully.', 'Wine', 'success', 'NORMAL')
ON CONFLICT (name) DO NOTHING;
