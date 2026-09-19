-- Add new columns for payment integration
ALTER TABLE public.orders
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN razorpay_order_id TEXT,
ADD COLUMN razorpay_payment_id TEXT;

-- Add check constraint for payment_status
ALTER TABLE public.orders
ADD CONSTRAINT orders_payment_status_check
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Add unique constraint to razorpay_payment_id to prevent duplicate orders
ALTER TABLE public.orders
ADD CONSTRAINT orders_razorpay_payment_id_key UNIQUE (razorpay_payment_id);

-- Add indexes for fast lookup during webhooks
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON public.orders(razorpay_payment_id);
