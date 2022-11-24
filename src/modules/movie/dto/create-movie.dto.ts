import { Genre} from '../../../types/genre.type';

export default class CreateMovieDto {
  title!: string;
  description!: string;
  publishingDate!: Date;
  genre!: Genre;
  releaseYear!: number;
  rating!: number;
  previewPath!: string;
  moviePath!: string;
  actors!: string[];
  director!: string;
  durationInMinutes!: number;
  userId!: string;
  posterPath!: string;
  backgroundImagePath!: string;
  backgroundColor!: string;
}
