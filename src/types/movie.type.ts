import { User } from './user.type.js';
import { Genre } from './genre.type.js';
import { Actor } from './actor.type.js';

export type Movie = {
  title: string;
  description: string;
  publishingDate: Date;
  genre: Genre;
  releaseYear: number;
  rating: number;
  previewPath: string;
  moviePath: string;
  actors: Actor[];
  director: string;
  durationInMinutes: number;
  commentsCount: number;
  user: User;
  posterPath: string;
  backgroundImagePath: string;
  backgroundColor: string;
}
