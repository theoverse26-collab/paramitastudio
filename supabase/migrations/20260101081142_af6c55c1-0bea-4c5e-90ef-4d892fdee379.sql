-- Add payment tracking columns to purchases table
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_gateway text NOT NULL DEFAULT 'paypal',
ADD COLUMN IF NOT EXISTS gateway_order_id text,
ADD COLUMN IF NOT EXISTS gateway_transaction_id text,
ADD COLUMN IF NOT EXISTS payment_details jsonb;

-- Add check constraint for payment_status
ALTER TABLE public.purchases 
ADD CONSTRAINT purchases_payment_status_check 
CHECK (payment_status IN ('pending', 'success', 'failed', 'cancelled'));