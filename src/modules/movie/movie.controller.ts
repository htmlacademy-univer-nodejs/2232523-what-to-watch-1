import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { fillDTO } from '../../utils/common.js';
import { StatusCodes } from 'http-status-codes';
import * as core from 'express-serve-static-core';
import { Genre } from '../../types/genre.type.js';
import { checkGenre } from '../../types/genre.type.js';
import UpdateMovieDto from './dto/update-movie.dto.js';
import CreateMovieDto from './dto/create-movie.dto.js';
import {Component } from '../../types/component.type.js';
import MovieResponse from './response/movie.response.js';
import HttpError from '../../common/errors/http-error.js';
import MovieListItemDto from './dto/movie-list-item.dto.js';
import { HttpMethod } from '../../types/http-method.enum.js';
import { Controller } from '../../common/controller/controller.js';
import {UserServiceInterface} from '../user/user-service.interface';
import { MovieServiceInterface } from './movie-service.interface.js';
import CommentResponse from '../comment/response/comment.response.js';
import { LoggerInterface } from '../../common/logger/logger.interface.js';
import { ConfigInterface } from '../../common/config/config.interface.js';
import { CommentServiceInterface } from '../comment/comment-service.interface.js';
import { ValidateDtoMiddleware } from '../../common/middlewares/validate-dto.middleware.js';
import { PrivateRouteMiddleware } from '../../common/middlewares/private-route.middleware.js';
import { DocumentExistsMiddleware } from '../../common/middlewares/document-exists.middleware.js';
import { ValidateObjectIdMiddleware } from '../../common/middlewares/validate-objectid.middleware.js';

type ParamsGetMovie = {
  movieId: string;
}

type QueryParamsGetMovies = {
  limit?: string;
  genre?: Genre;
};

@injectable()
export default class MovieController extends Controller {
  constructor(@inject(Component.LoggerInterface) logger: LoggerInterface,
              @inject(Component.MovieServiceInterface) private readonly movieService: MovieServiceInterface,
              @inject(Component.CommentServiceInterface) private readonly commentService: CommentServiceInterface,
              @inject(Component.UserServiceInterface) private readonly userService: UserServiceInterface,
              @inject(Component.ConfigInterface) configService: ConfigInterface) {
    super(logger, configService);

    this.logger.info('Register routes for MovieController.');

    this.addRoute({path: '/', method: HttpMethod.Get, handler: this.index});
    this.addRoute({path: '/promo', method: HttpMethod.Get, handler: this.showPromo});
    this.addRoute({
      path: '/create',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(this.userService),
        new ValidateDtoMiddleware(CreateMovieDto)
      ]
    });
    this.addRoute({
      path: '/:movieId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('movieId'),
        new DocumentExistsMiddleware(this.movieService, 'Movie', 'movieId')
      ]
    });
    this.addRoute({
      path: '/:movieId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(this.userService),
        new ValidateObjectIdMiddleware('movieId'),
        new ValidateDtoMiddleware(UpdateMovieDto),
        new DocumentExistsMiddleware(this.movieService, 'Movie', 'movieId')
      ]
    });
    this.addRoute({
      path: '/:movieId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(this.userService),
        new ValidateObjectIdMiddleware('movieId'),
        new DocumentExistsMiddleware(this.movieService, 'Movie', 'movieId')
      ]
    });
    this.addRoute({path: '/promo', method: HttpMethod.Get, handler: this.showPromo});
    this.addRoute({
      path: '/:movieId/comments',
      method: HttpMethod.Get,
      handler: this.getComments,
      middlewares: [
        new ValidateObjectIdMiddleware('movieId'),
        new DocumentExistsMiddleware(this.movieService, 'Movie', 'movieId'),
      ]
    });
  }


  async index(req: Request<unknown, unknown, unknown, QueryParamsGetMovies>, res: Response): Promise<void> {
    const genre = req.query.genre;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const movies = genre ? await this.movieService.findByGenre(checkGenre(genre), limit) : await this.movieService.find(limit);
    this.ok(res, fillDTO(MovieListItemDto, movies));
  }

  async create(req: Request<Record<string, unknown>, Record<string, unknown>, CreateMovieDto>, res: Response): Promise<void> {
    const {body, user} = req;
    const result = await this.movieService.create(body, user.id);
    this.created(res, fillDTO(MovieResponse, result));
  }

  async show({params}: Request<core.ParamsDictionary | ParamsGetMovie>, res: Response): Promise<void> {
    const result = await this.movieService.findMovieById(params.movieId);
    this.ok(res, fillDTO(MovieResponse, result));
  }

  async update(req: Request<core.ParamsDictionary | ParamsGetMovie, Record<string, unknown>, UpdateMovieDto>, res: Response): Promise<void> {
    const {params, body, user} = req;
    const movie = await this.movieService.findMovieById(params.movieId);
    if (movie?.user?.id !== user.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        `Пользователь с id ${user.id} не владеет картой фильма с id ${movie?.id}, редактирование запрещено`,
        'MovieController'
      );
    }
    this.ok(res, fillDTO(MovieResponse, await this.movieService.updateMovieById(params.movieId, body)));
  }

  async delete(req: Request<core.ParamsDictionary | ParamsGetMovie>, res: Response): Promise<void> {
    const {params, user} = req;
    const movie = await this.movieService.findMovieById(params.movieId);
    if (movie?.user?.id !== user.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        `Пользователь с id ${user.id} не владеет картой фильма с id ${movie?.id}, удаление запрещено`,
        'MovieController'
      );
    }
    await this.movieService.deleteMovieById(`${params.movieId}`);
    this.noContent(res, {message: 'Фильм успешно удален.'});
  }

  async showPromo(_: Request, res: Response): Promise<void> {
    const result = await this.movieService.findPromo();
    this.ok(res, fillDTO(MovieResponse, result));
  }

  async getComments({params}: Request<core.ParamsDictionary | ParamsGetMovie>, res: Response): Promise<void> {
    const comments = await this.commentService.findCommentsByMovieId(params.movieId);
    this.ok(res, fillDTO(CommentResponse, comments));
  }
}
