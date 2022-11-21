import {inject, injectable} from 'inversify';
import {MovieServiceInterface} from './movie-service.interface.js';
import CreateMovieDto from '../movie/dto/create-movie.dto.js';
import {DocumentType, types} from '@typegoose/typegoose';
import {MovieEntity} from './movie.entity.js';
import {Component} from '../../types/component.type.js';
import {LoggerInterface} from '../../common/logger/logger.interface.js';

@injectable()
export default class MovieService implements MovieServiceInterface {
  constructor(
    @inject(Component.LoggerInterface) private  readonly logger: LoggerInterface,
    @inject(Component.MovieModel) private readonly movieModel: types.ModelType<MovieEntity>
  ) {}

  async create(dto: CreateMovieDto): Promise<DocumentType<MovieEntity>> {
    const movie = await this.movieModel.create(dto);
    this.logger.info(`New movie created: ${dto.name}`);

    return movie;
  }

  async findById(movieId: string): Promise<DocumentType<MovieEntity> | null> {
    return this.movieModel.findById(movieId).exec();
  }
}
