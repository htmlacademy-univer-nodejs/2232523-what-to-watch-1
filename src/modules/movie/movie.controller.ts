import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { fillDTO } from '../../utils/common.js';
import * as core from 'express-serve-static-core';
import { Genre } from '../../types/genre.type.js';
import UpdateMovieDto from './dto/update-movie.dto.js';
import CreateMovieDto from './dto/create-movie.dto.js';
import {Component } from '../../types/component.type.js';
import MovieResponse from './response/movie.response.js';
import HttpError from '../../common/errors/http-error.js';
import MovieListItemDto from './dto/movie-list-item.dto.js';
import { HttpMethod } from '../../types/http-method.enum.js';
import { Controller } from '../../common/controller/controller.js';
import { MovieServiceInterface } from './movie-service.interface.js';
import CommentResponse from '../comment/response/comment.response.js';
import { LoggerInterface } from '../../common/logger/logger.interface.js';
import { CommentServiceInterface } from '../comment/comment-service.interface.js';
import { PrivateRouteMiddleware } from '../../common/middlewares/private-route.middleware.js';
import { ValidateDtoMiddleware } from '../../common/middlewares/validate-dto.middleware.js';
import { DocumentExistsMiddleware } from '../../common/middlewares/document-exists.middleware.js';
import { ValidateObjectIdMiddleware } from '../../common/middlewares/validate-objectid.middleware.js';

type ParamsGetMovie = {
  movieId: string;
}

@injectable()
export default class MovieController extends Controller {
  constructor(@inject(Component.LoggerInterface) logger: LoggerInterface,
              @inject(Component.MovieServiceInterface) private readonly movieService: MovieServiceInterface,
              @inject(Component.CommentServiceInterface) private readonly commentService: CommentServiceInterface) {
    super(logger);

    this.logger.info('Register routes for MovieController.');

    this.addRoute({path: '/', method: HttpMethod.Get, handler: this.index});
    this.addRoute({path: '/promo', method: HttpMethod.Get, handler: this.showPromo});
    this.addRoute({
      path: '/create',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
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
      handler: this.updateFilm,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('movieId'),
        new ValidateDtoMiddleware(UpdateMovieDto),
        new DocumentExistsMiddleware(this.movieService, 'Movie', 'movieId')
      ]
    });
    this.addRoute({
      path: '/:movieId',
      method: HttpMethod.Delete,
      handler: this.deleteFilm,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('movieId'),
        new DocumentExistsMiddleware(this.movieService, 'Movie', 'movieId')
      ]
    });
    this.addRoute({path: '/promo', method: HttpMethod.Get, handler: this.getPromo});
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

  async index(req: Request<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, {genre?: Genre, limit?: number}>,
    res: Response
  ): Promise<void> {
    const movies = req.query.genre
      ? await this.movieService.findByGenre(req.query.genre, req.query.limit)
      : await this.movieService.find(req.query.limit);
    this.ok(res, fillDTO(MovieListItemDto, movies));
  }

  async create(req: Request<Record<string, unknown>, Record<string, unknown>, CreateMovieDto>, res: Response): Promise<void> {
    const { body, user } = req;
    const result = await this.movieService.create({...body, userId: user.id});
    const movie = await this.movieService.findById(result.id);
    this.created(res, fillDTO(MovieResponse, movie));
  }

  async show({params}: Request<core.ParamsDictionary | ParamsGetMovie>, res: Response): Promise<void> {
    const result = await this.movieService.findById(params.movieId);
    this.ok(res, fillDTO(MovieResponse, result));
  }

  async updateFilm({params, body, user}: Request<Record<string, string>, Record<string, unknown>, UpdateMovieDto>, res: Response): Promise<void> {
    const film = await this.movieService.findById(params.movieId);

    if (!film) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Фильма с id «${params.movieId}» не существует.`, 'MovieController');
    }

    const movie = await this.movieService.findById(params.movieId);
    if (movie?.userId?.id !== user.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        `Пользователь с id ${user.id} не владеет картой с id ${movie?.id}, поэтому не может её редактировать.`,
        'MovieController'
      );
    }

    const result = await this.movieService.updateById(params.movieId, body);
    this.ok(res, fillDTO(MovieResponse, result));
  }

  async deleteFilm({params, user}: Request<Record<string, string>>, res: Response): Promise<void> {
    const film = await this.movieService.findById(`${params.movieId}`);

    if (!film) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Фильма с id «${params.movieId}» не существует.`, 'MovieController');
    }

    const movie = await this.movieService.findById(params.movieId);
    if (movie?.userId?.id !== user.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        `Пользователь с id ${user.id} не владеет картой с id ${movie?.id}, поэтому не может её удалить.`,
        'MovieController'
      );
    }

    await this.movieService.deleteById(`${params.movieId}`);
    this.noContent(res, {message: 'Фильм успешно удален.'});
  }

  async getPromo(_: Request, res: Response): Promise<void> {
    const result = await this.movieService.findPromo();
    this.send(res, StatusCodes.OK, fillDTO(MovieResponse, result));
  }

  async getComments({params}: Request<core.ParamsDictionary | ParamsGetMovie>, res: Response): Promise<void> {
    const comments = await this.commentService.findByMovieId(params.movieId);
    this.ok(res, fillDTO(CommentResponse, comments));
  }

  async showPromo(_: Request, res: Response): Promise<void> {
    const result = await this.movieService.findPromo();
    this.ok(res, fillDTO(MovieResponse, result));
  }
}
