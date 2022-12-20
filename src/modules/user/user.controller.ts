import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import LoginUserDto from './dto/login-user.dto.js';
import CreateUserDto from './dto/create-user.dto.js';
import UserResponse from './response/user.response.js';
import { JWT_ALGORITHM } from '../user/user.constant.js';
import HttpError from '../../common/errors/http-error.js';
import { Component } from '../../types/component.type.js';
import { createJWT, fillDTO } from '../../utils/common.js';
import { HttpMethod } from '../../types/http-method.enum.js';
import MovieResponse from '../movie/response/movie.response.js';
import { Controller } from '../../common/controller/controller.js';
import { UserServiceInterface } from './user-service.interface.js';
import LoggedUserResponse from './response/logged-user.response.js';
import { LoggerInterface } from '../../common/logger/logger.interface.js';
import { ConfigInterface } from '../../common/config/config.interface.js';
import { UploadFileMiddleware } from '../../common/middlewares/upload-file.middleware.js';
import {PrivateRouteMiddleware} from '../../common/middlewares/private-route.middleware.js';
import { ValidateDtoMiddleware } from '../../common/middlewares/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../../common/middlewares/validate-objectid.middleware.js';

@injectable()
export default class UserController extends Controller {
  constructor(@inject(Component.LoggerInterface) logger: LoggerInterface,
              @inject(Component.UserServiceInterface) private readonly userService: UserServiceInterface,
              @inject(Component.ConfigInterface) private readonly configService: ConfigInterface) {
    super(logger);
    this.logger.info('Register routes for UserController.');

    this.addRoute({
      path: '/login',
      method: HttpMethod.Get,
      handler: this.get,
    });
    this.addRoute({
      path: '/favourites',
      method: HttpMethod.Get,
      handler: this.getToWatch,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute({
      path: '/favourites',
      method: HttpMethod.Post,
      handler: this.postToWatch,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute({
      path: '/favourites',
      method: HttpMethod.Delete,
      handler: this.deleteToWatch,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateUserDto)]
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(LoginUserDto)]
    });
    this.addRoute({
      path: '/:userId/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'avatar'),
      ]
    });
  }

  public async create({body}: Request<Record<string, unknown>, Record<string, unknown>, CreateUserDto>, res: Response): Promise<void> {
    const existsUser = await this.userService.findByEmail(body.email);

    if (existsUser) {
      throw new HttpError(StatusCodes.CONFLICT, `Пользователь с таким email «${body.email}» уже существует.`, 'UserController');
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    this.send(res, StatusCodes.CREATED, fillDTO(UserResponse, result));
  }

  async login({body}: Request<Record<string, unknown>, Record<string, unknown>, LoginUserDto>, res: Response): Promise<void> {
    const user = await this.userService.verifyUser(body, this.configService.get('SALT'));

    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    const token = await createJWT(
      JWT_ALGORITHM,
      this.configService.get('JWT_SECRET'),
      { email: user.email, id: user.id}
    );

    this.ok(res, fillDTO(LoggedUserResponse, {email: user.email, token}));
  }

  async get(req: Request, res: Response): Promise<void> {
    const user = await this.userService.findByEmail(req.user.email);
    this.ok(res, fillDTO(LoggedUserResponse, user));
  }

  async getToWatch(req: Request<Record<string, unknown>, Record<string, unknown>>, _res: Response): Promise<void> {
    const { user } = req;
    const result = await this.userService.findToWatch(user.id);
    this.ok(_res, fillDTO(MovieResponse, result));
  }

  async postToWatch(req: Request<Record<string, unknown>, Record<string, unknown>, { movieId: string }>, _res: Response): Promise<void> {
    const { body, user } = req;
    await this.userService.addToWatch(body.movieId, user.id);
    this.noContent(_res, {message: 'Успешно. Фильм добавлен в список "К просмотру".'});
  }

  async deleteToWatch(req: Request<Record<string, unknown>, Record<string, unknown>, { movieId: string }>, _res: Response): Promise<void> {
    const { body, user } = req;
    await this.userService.deleteToWatch(body.movieId, user.id);
    this.noContent(_res, {message: 'Успешно. Фильм удален из списка "К просмотру".'});
  }

  public async uploadAvatar(req: Request, res: Response) {
    this.created(res, { filepath: req.file?.path });
  }
}
