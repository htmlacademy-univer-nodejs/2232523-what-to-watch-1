import { Genre} from '../../../types/genre.type';
import { Actor } from '../../../types/actor.type.js';
import { User } from '../../../types/user.type.js';

export default class CreateMovieDto {
  name!: string;
  description!: string;
  postDate!: Date;
  genre!: Genre;
  releaseYear!: number;
  rating!: number;
  moviePreview!: string;
  movie!: string;
  actors!: Actor[];
  producer!: string;
  movieDuration!: number;
  commentsCount!: number;
  user!: User;
  poster!: string;
  backgroundImage!: string;
  backgroundColor!: string;
}
