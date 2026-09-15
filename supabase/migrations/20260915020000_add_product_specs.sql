-- Ficha técnica do produto — a tabela de especificações da página de fones.
-- [{"label":"Conexão","value":"Bluetooth 5.3"}, {"label":"Bateria","value":"35h"}]
-- Opcional: produto sem ficha simplesmente não mostra a tabela.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS specs jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.specs IS 'Ficha técnica: [{label, value}], na ordem de exibição.';
