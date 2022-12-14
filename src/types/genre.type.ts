export const GENRE = ['comedy', 'crime', 'documentary', 'drama', 'horror', 'family', 'romance', 'scifi', 'thriller'];
export type Genre = typeof GENRE[number];

export function  isRightGenre (g: string): Genre | never {
  if (GENRE.includes(g)) {
    return g;
  }
  throw new Error(`Genre ${g} doesn't exist`);
}

export enum GenreEnum {
  COMEDY = 'comedy',
  CRIME = 'crime',
  DOCUMENTARY = 'documentary',
  DRAMA = 'drama',
  HORROR = 'horror',
  FAMILY = 'family',
  ROMANCE = 'romance',
  SCIFI = 'scifi',
  THRILLER = 'thriller'
}
