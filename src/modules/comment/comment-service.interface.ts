import {DocumentType} from '@typegoose/typegoose/lib/types.js';
import {CommentEntity} from './comment.entity.js';
import CreateCommentDto from './dto/create-comment.dto.js';

export interface CommentServiceInterface {
  findCommentsByMovieId(movieId: string): Promise<DocumentType<CommentEntity>[]>;
  create(dto: CreateCommentDto, userId: string): Promise<DocumentType<CommentEntity>>;
}
