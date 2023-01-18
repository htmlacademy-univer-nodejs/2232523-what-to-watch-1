import { MovieEntity } from './movie.entity.js';
import { DocumentType } from '@typegoose/typegoose';
import CreateMovieDto from './dto/create-movie.dto.js';
import UpdateMovieDto from './dto/update-movie.dto.js';
import { DocumentExistsInterface } from '../../types/document-exists.interface.js';

export interface MovieServiceInterface extends DocumentExistsInterface{
  create(dto: CreateMovieDto, userId: string): Promise<DocumentType<MovieEntity>>;
  find(quantity?: number): Promise<DocumentType<MovieEntity>[]>;
  findMovieById(movieId: string): Promise<DocumentType<MovieEntity> | null>;
  updateMovieById(movieId: string, dto: UpdateMovieDto): Promise<DocumentType<MovieEntity> | null>;
  deleteMovieById(movieId: string): Promise<void | null>;
  findByGenre(genre: string, limit?: number): Promise<DocumentType<MovieEntity>[]>;
  findPromo(): Promise<DocumentType<MovieEntity> | null>;
  updateMovieRating(movieId: string, newRating: number): Promise<void | null>;
  incCommentsCount(movieId: string): Promise<void | null>;
}
