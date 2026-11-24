-- Data pembayaran GDCPay (QRIS / VA) pada tabel orders.
-- Jalankan di database DEV dulu (dan di PROD saat go-live).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method      text,         -- 'qris' | 'va'
  ADD COLUMN IF NOT EXISTS payment_bank_code   text,         -- kode bank VA (mis. 002)
  ADD COLUMN IF NOT EXISTS gdc_reference_no    text,         -- referenceNo dari GDC (QRIS) / additionalInfo.referenceNo (VA)
  ADD COLUMN IF NOT EXISTS gdc_external_id     text,         -- X-EXTERNAL-ID saat generate (dibutuhkan query status QRIS)
  ADD COLUMN IF NOT EXISTS va_number           text,
  ADD COLUMN IF NOT EXISTS qr_content          text,
  ADD COLUMN IF NOT EXISTS payment_expires_at  timestamptz,
  ADD COLUMN IF NOT EXISTS paid_at             timestamptz,
  ADD COLUMN IF NOT EXISTS program_label       text;         -- label item yang dibeli (untuk struk)

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IS NULL OR payment_method = ANY (ARRAY['qris'::text, 'va'::text]));
