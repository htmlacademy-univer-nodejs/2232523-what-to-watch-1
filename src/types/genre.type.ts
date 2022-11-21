export const GENRE = ['comedy', 'crime', 'documentary', 'drama', 'horror', 'family', 'romance', 'scifi', 'thriller'];
export type Genre = typeof GENRE[number];
export function  isRightGenre (g: string): Genre | never {
  if (GENRE.includes(g)) {
    return g;
  }
  throw new Error(`Genre ${g} doesn't exist`);
}
