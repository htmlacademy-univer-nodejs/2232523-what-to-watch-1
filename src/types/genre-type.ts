/*export enum Genre {
  comedy = 'comedy',
  crime = 'crime',
  documentary = 'documentary',
  drama = 'drama',
  horror = 'horror',
  family = 'family',
  romance = 'romance',
  scifi = 'scifi',
  thriller = 'thriller'
}*/

export const GENRE = ['comedy', 'crime', 'documentary', 'drama', 'horror', 'family', 'romance', 'scifi', 'thriller'];
export type Genre = typeof GENRE[number];
export const isRightGenre = (g: string) => GENRE.includes(g) ? g : undefined;
