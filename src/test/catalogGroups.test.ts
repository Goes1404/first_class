import { describe, it, expect } from 'vitest';
import { isApparelCategory, isSneakerCategory, groupForCategory } from '@/lib/catalogGroups';

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
    expect(groupForCategory('Áudio')).toBeNull();
    expect(groupForCategory(undefined)).toBeNull();
    expect(groupForCategory('')).toBeNull();
  });
});
