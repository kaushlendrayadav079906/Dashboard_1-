-- Add payment_method column with default 'razorpay'
ALTER TABLE public.orders
ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'razorpay';

-- Add check constraint for payment_method
ALTER TABLE public.orders
ADD CONSTRAINT orders_payment_method_check
CHECK (payment_method IN ('razorpay', 'cod'));
