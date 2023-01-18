import {StatusCodes} from 'http-status-codes';
import HttpError from '../common/errors/http-error.js';

export const GENRE = ['comedy', 'crime', 'documentary', 'drama', 'horror', 'family', 'romance', 'scifi', 'thriller'];
export type Genre = typeof GENRE[number];

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


export function checkGenre(value: string): Genre | never {
  if (!GENRE.includes(value)) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      `Жанра ${value} не существует.`,
      'getGenre'
    );
  }
  return value;
}
