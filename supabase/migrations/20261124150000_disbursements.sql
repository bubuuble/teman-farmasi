-- Pencatatan transfer keluar (disbursement) via GDCPay, mis. honor mentor.
-- id = partnerReferenceNo yang dikirim ke GDC (kunci idempotensi).

CREATE TABLE IF NOT EXISTS public.disbursements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_name   text,
  bank_code        text NOT NULL,
  bank_name        text,
  account_number   text NOT NULL,
  account_name     text,                          -- nama pemilik rekening hasil inquiry GDC
  amount           numeric NOT NULL CHECK (amount > 0),
  fee_amount       numeric,
  remarks          text,
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text])),
  gdc_reference_no text,
  response_code    text,
  response_message text,
  created_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at     timestamptz
);

ALTER TABLE public.disbursements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage disbursements" ON public.disbursements;
CREATE POLICY "Admins manage disbursements" ON public.disbursements
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
