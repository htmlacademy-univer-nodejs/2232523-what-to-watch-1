import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { fillDTO } from '../../utils/common.js';
import * as core from 'express-serve-static-core';
import UpdateMovieDto from './dto/update-movie.dto';
import CreateMovieDto from './dto/create-movie.dto.js';
import {Component } from '../../types/component.type.js';
import MovieResponse from './response/movie.response.js';
import HttpError from '../../common/errors/http-error.js';
import { HttpMethod } from '../../types/http-method.enum.js';
import { Controller } from '../../common/controller/controller.js';
import  {MovieServiceInterface } from './movie-service.interface.js';
import CommentResponse from '../comment/response/comment.response.js';
import { LoggerInterface } from '../../common/logger/logger.interface.js';
import { CommentServiceInterface } from '../comment/comment-service.interface.js';
import { DocumentExistsMiddleware } from '../../common/middlewares/document-exists.middleware';
import { ValidateDtoMiddleware } from '../../common/middlewares/validate-dto.middleware.js';
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
    this.addRoute({
      path: '/create',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateMovieDto)]
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

  async index(_req: Request, res: Response): Promise<void> {
    const movies = await this.movieService.find();
    const movieResponse = fillDTO(MovieResponse, movies);
    this.ok(res, movieResponse);
  }

  async create({body}: Request<Record<string, unknown>, Record<string, unknown>, CreateMovieDto>, res: Response): Promise<void> {
    const result = await this.movieService.create(body);
    this.created(res, fillDTO(MovieResponse, result));
  }

  async show({params}: Request<core.ParamsDictionary | ParamsGetMovie>, res: Response): Promise<void> {
    const result = await this.movieService.findById(params.movieId);
    this.ok(res, fillDTO(MovieResponse, result));
  }

  async updateFilm({params, body}: Request<Record<string, string>, Record<string, unknown>, UpdateMovieDto>, res: Response): Promise<void> {
    const film = await this.movieService.findById(params.movieId);

    if (!film) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Фильма с id «${params.movieId}» не существует.`, 'MovieController');
    }

    const result = await this.movieService.updateById(params.movieId, body);
    this.ok(res, fillDTO(MovieResponse, result));
  }

  async deleteFilm({params}: Request<Record<string, string>>, res: Response): Promise<void> {
    const film = await this.movieService.findById(`${params.movieId}`);

    if (!film) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Фильма с id «${params.movieId}» не существует.`, 'MovieController');
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
}
