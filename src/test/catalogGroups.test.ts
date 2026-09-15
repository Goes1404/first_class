import { describe, it, expect } from 'vitest';
import {
  isApparelCategory, isAudioCategory, isSneakerCategory, isElectronicsCategory, electronicsKind, groupForCategory,
} from '@/lib/catalogGroups';

// Estes predicados decidem o recorte das abas /tenis e /roupas, o destino do
// círculo de categoria na home e o redirecionamento de /produto/:id.
describe('isSneakerCategory', () => {
  it.each([
    'Tênis',
    'Tenis',
    'Tênis de Corrida',
    'tênis casual',
    'Calçados',
    'Calcados Masculinos',
    'Sapato Social',
    'Sneakers',
    'Chuteiras',
  ])('reconhece "%s" como calçado', (categoria) => {
    expect(isSneakerCategory(categoria)).toBe(true);
  });

  it.each([
    'Áudio',
    'Mouse',
    'Smartphone',
    'Relógios',
    'Cabos e Adaptadores',
    'Meias',
  ])('não confunde "%s" com calçado', (categoria) => {
    expect(isSneakerCategory(categoria)).toBe(false);
  });

  it('trata categoria ausente como não-calçado', () => {
    expect(isSneakerCategory(undefined)).toBe(false);
    expect(isSneakerCategory(null)).toBe(false);
    expect(isSneakerCategory('')).toBe(false);
  });
});

describe('isApparelCategory', () => {
  it.each([
    'Camisetas',
    'Camisa Social',
    'Moletom',
    'Jaquetas',
    'Calças',
    'Calça Jeans',
    'Bermudas',
    'Vestidos',
    'Regata',
    'Roupas',
    'Conjunto Moletom',
  ])('reconhece "%s" como roupa', (categoria) => {
    expect(isApparelCategory(categoria)).toBe(true);
  });

  it.each(['Áudio', 'Mouse', 'Smartphone', 'Relógios'])(
    'não confunde "%s" com roupa',
    (categoria) => {
      expect(isApparelCategory(categoria)).toBe(false);
    },
  );

  // "Calçados" contém "calça": sem o desempate, todo calçado seria roupa também.
  it.each(['Calçados', 'Calcados Masculinos', 'Tênis', 'Sapato Social', 'Chuteiras'])(
    'não classifica o calçado "%s" como roupa',
    (categoria) => {
      expect(isApparelCategory(categoria)).toBe(false);
      expect(isSneakerCategory(categoria)).toBe(true);
    },
  );
});

describe('groupForCategory', () => {
  it('manda calçado para /tenis e roupa para /roupas', () => {
    expect(groupForCategory('Tênis de Corrida')?.slug).toBe('tenis');
    expect(groupForCategory('Calçados')?.slug).toBe('tenis');
    expect(groupForCategory('Camisetas')?.slug).toBe('roupas');
    expect(groupForCategory('Calça Jeans')?.slug).toBe('roupas');
  });

  it('devolve null para categoria sem aba dedicada', () => {
    expect(groupForCategory('Mouse')).toBeNull();
    expect(groupForCategory('Relógios')).toBeNull();
    expect(groupForCategory(undefined)).toBeNull();
    expect(groupForCategory('')).toBeNull();
  });
});

describe('isAudioCategory', () => {
  it.each(['Fones de Ouvido', 'Fone Bluetooth', 'Áudio', 'Audio', 'Headset Gamer', 'Caixa de Som', 'Earbuds'])(
    'reconhece "%s" como áudio',
    (categoria) => {
      expect(isAudioCategory(categoria)).toBe(true);
    },
  );

  it.each(['Mouse', 'Smartphone', 'Camisetas', 'Tênis'])('não confunde "%s" com áudio', (categoria) => {
    expect(isAudioCategory(categoria)).toBe(false);
  });
});

describe('hasPurchasePage', () => {
  // Calçado, roupa e eletrônico têm tela de compra própria; áudio segue em /produto/:id,
  // e é isso que o redirecionamento consulta.
  it('marca calçado e roupa, mas não áudio', () => {
    expect(groupForCategory('Tênis')?.hasPurchasePage).toBe(true);
    expect(groupForCategory('Camisetas')?.hasPurchasePage).toBe(true);
    expect(groupForCategory('Fones de Ouvido')?.hasPurchasePage).toBe(false);
  });

  it('manda áudio para /fones', () => {
    expect(groupForCategory('Fones de Ouvido')?.slug).toBe('fones');
    expect(groupForCategory('Áudio')?.slug).toBe('fones');
  });
});

describe('electronicsKind', () => {
  it.each([
    ['iphones', 'celulares'],
    ['Smartphone', 'celulares'],
    ['Celulares', 'celulares'],
    ['Tablets', 'tablets'],
    ['iPad', 'tablets'],
    ['Notebooks', 'notebooks'],
    ['MacBook', 'notebooks'],
    ['Computadores', 'notebooks'],
  ] as const)('classifica "%s" como %s', (categoria, recorte) => {
    expect(electronicsKind(categoria)).toBe(recorte);
    expect(isElectronicsCategory(categoria)).toBe(true);
  });

  // "Headphone" tem "phone" dentro: áudio nunca pode virar celular.
  it.each(['Headphone Bluetooth', 'Fones de Ouvido', 'Mouse', 'Tênis', 'Camisetas', ''])(
    'não classifica "%s" como eletrônico',
    (categoria) => {
      expect(electronicsKind(categoria)).toBeNull();
      expect(isElectronicsCategory(categoria)).toBe(false);
    },
  );

  it('manda eletrônico para /eletronicos, com ficha própria em /eletronicos/:id', () => {
    expect(groupForCategory('iphones')?.slug).toBe('eletronicos');
    expect(groupForCategory('Notebooks')?.slug).toBe('eletronicos');
    expect(groupForCategory('iphones')?.hasPurchasePage).toBe(true);
  });
});
