import { User } from './user.type.js';
import { Genre } from './genre-type.enum.js';
import { Actor } from './actor.type.js';

export type Movie = {
  name: string;
  description: string;
  postDate: Date;
  genre?: Genre;
  releaseYear: number;
  rating: number;
  moviePreview: string;
  movie: string;
  actors: Actor[];
  producer: string;
  movieDuration: number;
  commentsCount: number;
  user: User;
  poster: string;
  backgroundImage: string;
  backgroundColor: string;
}
