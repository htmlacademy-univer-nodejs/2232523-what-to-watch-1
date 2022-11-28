import {isRightGenre} from '../types/genre.type.js';
import crypto from 'crypto';
import {ClassConstructor, plainToInstance} from 'class-transformer';

export const createMovie = (row: string) => {
  const tokens = row.replace('\n', '').split('\t');
  const [
    title,
    description,
    publishingDate,
    genre,
    releaseYear,
    rating,
    previewPath,
    moviePath,
    actors,
    director,
    durationInMinutes,
    userName,
    email,
    avatarPath,
    posterPath,
    backgroundImagePath,
    backgroundColor
  ] = tokens;
  return {
    title,
    description,
    publishingDate: new Date(publishingDate),
    genre: isRightGenre(genre),
    releaseYear: Number(releaseYear),
    rating: Number(rating),
    previewPath,
    moviePath,
    actors: actors.split(';'),
    director,
    durationInMinutes: Number(durationInMinutes),
    commentsCount: 0,
    user: {email, name: userName, avatarPath},
    posterPath,
    backgroundImagePath,
    backgroundColor
  };
};

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '';
}

export const createSHA256 = (line: string, salt: string): string => {
  const shaHasher = crypto.createHmac('sha256', salt);
  return shaHasher.update(line).digest('hex');
};

export const checkPassword = (password: string) => {
  if (password.length < 6 || password.length > 12) {
    throw new Error('Password should be from 6 to 12 characters');
  }
};

export const fillDTO = <T, V>(someDto: ClassConstructor<T>, plainObject: V) =>
  plainToInstance(someDto, plainObject, {excludeExtraneousValues: true});

export const createErrorObject = (message: string) => ({
  error: message,
});
