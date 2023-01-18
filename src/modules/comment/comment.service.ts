import {inject, injectable} from 'inversify';
import { types } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';
import { Component } from '../../types/component.type.js';
import CreateCommentDto from './dto/create-comment.dto.js';
import { DocumentType } from '@typegoose/typegoose/lib/types.js';
import { CommentServiceInterface } from './comment-service.interface.js';
import { LoggerInterface } from '../../common/logger/logger.interface.js';
import { MovieServiceInterface } from '../movie/movie-service.interface.js';

@injectable()
export default class CommentService implements CommentServiceInterface {
  constructor(
    @inject(Component.LoggerInterface) private  readonly logger: LoggerInterface,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.MovieServiceInterface) private readonly movieService: MovieServiceInterface
  ) {}

  public async create(dto: CreateCommentDto, user: string): Promise<DocumentType<CommentEntity>> {
    const comment = await this.commentModel.create({...dto, user});
    this.logger.info(`New comment created: ${dto.text}`);
    await this.movieService.updateMovieRating(dto.movieId, dto.rating);
    await this.movieService.incCommentsCount(dto.movieId);
    return comment.populate('user');
  }

  public async findCommentsByMovieId(movieId: string): Promise<DocumentType<CommentEntity>[]> {
    const comments = await this.commentModel
      .find({movieId})
      .sort({createdAt: -1})
      .limit(50);
    return this.commentModel.populate(comments, 'user');
  }
}
