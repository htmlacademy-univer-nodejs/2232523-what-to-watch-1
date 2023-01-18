import { inject } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { fillDTO } from '../../utils/common.js';
import HttpError from '../../common/errors/http-error.js';
import { Component } from '../../types/component.type.js';
import CreateCommentDto from './dto/create-comment.dto.js';
import CommentResponse from './response/comment.response.js';
import { HttpMethod } from '../../types/http-method.enum.js';
import { Controller } from '../../common/controller/controller.js';
import {UserServiceInterface} from '../user/user-service.interface';
import { CommentServiceInterface } from './comment-service.interface.js';
import { LoggerInterface } from '../../common/logger/logger.interface.js';
import { ConfigInterface } from '../../common/config/config.interface.js';
import { MovieServiceInterface } from '../movie/movie-service.interface.js';
import {PrivateRouteMiddleware} from '../../common/middlewares/private-route.middleware.js';
import { ValidateDtoMiddleware } from '../../common/middlewares/validate-dto.middleware.js';

export default class CommentController extends Controller {
  constructor(@inject(Component.LoggerInterface) logger: LoggerInterface,
              @inject(Component.CommentServiceInterface) private readonly commentService: CommentServiceInterface,
              @inject(Component.MovieServiceInterface) private  readonly movieService: MovieServiceInterface,
              @inject(Component.UserServiceInterface) private readonly userService: UserServiceInterface,
              @inject(Component.ConfigInterface) configService: ConfigInterface) {
    super(logger, configService);

    this.logger.info('Регистрация путей CommentController.');
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(this.userService),
        new ValidateDtoMiddleware(CreateCommentDto)
      ]
    });
  }

  public async create(req: Request<object, object, CreateCommentDto>, res: Response): Promise<void> {
    const {body, user} = req;

    if (!await this.movieService.exists(body.movieId)) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Фильм с id ${body.movieId} не найден`,
        'CommentController'
      );
    }

    this.created(res, fillDTO(CommentResponse, await this.commentService.create(body, user.id)));
  }
}
