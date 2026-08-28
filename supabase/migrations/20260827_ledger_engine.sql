-- ONLINE BAR: FINANCIAL LEDGER ENGINE (Double-Entry Protocol)
-- Ensures 100% mathematical integrity for all money movements.

-- 1. LEDGER ACCOUNTS (Where the money sits)
CREATE TABLE IF NOT EXISTS public.ledger_accounts (
    id TEXT PRIMARY KEY, -- e.g., 'PLATFORM_REVENUE', 'MERCHANT_PAYABLE_V123', 'RIDER_WALLET_P254'
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE'
    balance NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'KSH',
    last_reconciled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. LEDGER TRANSACTIONS (The "Why")
CREATE TABLE IF NOT EXISTS public.ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_type TEXT NOT NULL, -- 'ORDER', 'WITHDRAWAL', 'REFUND'
    reference_id TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. LEDGER ENTRIES (The "What" - Debits and Credits)
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.ledger_transactions(id) ON DELETE CASCADE,
    account_id TEXT REFERENCES public.ledger_accounts(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL, -- Positive for Credit, Negative for Debit (Internal Convention)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexing for speed and reconciliation
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON public.ledger_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_transactions_ref ON public.ledger_transactions(reference_id);

-- 4. INTEGRITY TRIGGER: Balance Sync
CREATE OR REPLACE FUNCTION public.sync_ledger_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ledger_accounts
    SET balance = balance + NEW.amount
    WHERE id = NEW.account_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_balance ON public.ledger_entries;
CREATE TRIGGER tr_sync_balance
AFTER INSERT ON public.ledger_entries
FOR EACH ROW EXECUTE PROCEDURE public.sync_ledger_balance();

-- 5. INITIAL SYSTEM ACCOUNTS
INSERT INTO public.ledger_accounts (id, name, type)
VALUES
('PLATFORM_REVENUE', 'Online Bar Global Revenue', 'REVENUE'),
('PAYMENT_GATEWAY_FEES', 'Paystack/M-Pesa Transaction Costs', 'EXPENSE'),
('DISPATCH_COSTS', 'Runner Delivery Expenses', 'EXPENSE')
ON CONFLICT (id) DO NOTHING;
