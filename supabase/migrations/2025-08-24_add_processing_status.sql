-- Add missing "processing" status to the order_status enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'processing';