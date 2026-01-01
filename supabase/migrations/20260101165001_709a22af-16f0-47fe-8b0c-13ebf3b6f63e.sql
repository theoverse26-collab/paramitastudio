-- Drop the existing check constraint
ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_payment_status_check;

-- Create new check constraint with all needed statuses
ALTER TABLE public.purchases ADD CONSTRAINT purchases_payment_status_check 
CHECK (payment_status IN ('pending', 'completed', 'success', 'failed', 'cancelled', 'expired'));

-- Normalize any existing 'success' rows to 'completed' for consistency
UPDATE public.purchases SET payment_status = 'completed' WHERE payment_status = 'success';