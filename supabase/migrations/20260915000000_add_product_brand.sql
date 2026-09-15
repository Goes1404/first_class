-- Marca do produto — usada pelo filtro de marcas da aba de tênis (/tenis).
-- Opcional: produtos sem marca continuam válidos e simplesmente não aparecem
-- no filtro. brand_logo_url guarda o logo exibido no círculo da marca; fica
-- na própria linha do produto (desnormalizado) para o cadastro seguir sendo
-- um formulário só — a aba usa o primeiro logo não nulo de cada marca.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand          text,
  ADD COLUMN IF NOT EXISTS brand_logo_url text;

COMMENT ON COLUMN public.products.brand          IS 'Marca do produto (ex: Nike, Adidas). Opcional.';
COMMENT ON COLUMN public.products.brand_logo_url IS 'URL do logo da marca, exibido no filtro de marcas. Opcional.';

-- O filtro lista as marcas distintas do recorte de calçados.
CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products (brand) WHERE brand IS NOT NULL;
