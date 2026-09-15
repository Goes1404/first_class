import { describe, it, expect } from 'vitest';
import { isSneakerCategory } from '@/lib/sneakers';

// Este predicado decide o recorte da aba /tenis, o destino do círculo de
// categoria na home e o redirecionamento de /produto/:id — vale travar.
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
