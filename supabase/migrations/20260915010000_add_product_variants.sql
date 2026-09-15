-- Variações de calçado: grade de tamanhos e cores disponíveis.
-- Ficam como colunas no próprio produto em vez de tabela separada — a loja
-- controla estoque no nível do produto, então uma linha por variação só traria
-- CRUD extra sem ganho. Se um dia precisar de estoque por tamanho, isto vira
-- uma tabela product_variants.
--
-- sizes  : grade na ordem em que deve aparecer, ex: {'38','39','40','41'}
-- colors : [{"name":"Verde limão","hex":"#84cc16"}, ...]
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sizes  text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS colors jsonb  NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.sizes  IS 'Grade de tamanhos do calçado, na ordem de exibição.';
COMMENT ON COLUMN public.products.colors IS 'Cores disponíveis: [{name, hex}]. Exibidas como swatches na tela de compra.';
