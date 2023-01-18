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
import { Controller } from '../../common/controller/controller.js';
import { UserServiceInterface } from './user-service.interface.js';
import LoggedUserResponse from './response/logged-user.response.js';
import MovieListItemResponse from '../movie/dto/movie-list-item.dto.js';
import { LoggerInterface } from '../../common/logger/logger.interface.js';
import { ConfigInterface } from '../../common/config/config.interface.js';
import { UploadFileMiddleware } from '../../common/middlewares/upload-file.middleware.js';
import { ValidateDtoMiddleware } from '../../common/middlewares/validate-dto.middleware.js';
import { PrivateRouteMiddleware } from '../../common/middlewares/private-route.middleware.js';
import { ValidateObjectIdMiddleware } from '../../common/middlewares/validate-objectid.middleware.js';

@injectable()
export default class UserController extends Controller {
  constructor(@inject(Component.LoggerInterface) logger: LoggerInterface,
              @inject(Component.UserServiceInterface) private readonly userService: UserServiceInterface,
              @inject(Component.ConfigInterface) configService: ConfigInterface) {
    super(logger, configService);
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
      middlewares: [new PrivateRouteMiddleware(this.userService)]
    });
    this.addRoute({
      path: '/favourites',
      method: HttpMethod.Post,
      handler: this.postToWatch,
      middlewares: [new PrivateRouteMiddleware(this.userService)]
    });
    this.addRoute({
      path: '/favourites',
      method: HttpMethod.Delete,
      handler: this.deleteToWatch,
      middlewares: [new PrivateRouteMiddleware(this.userService)]
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

  async create(req: Request<Record<string, unknown>, Record<string, unknown>, CreateUserDto>, res: Response): Promise<void> {
    const {body} = req;
    const existsUser = await this.userService.findUserByEmail(body.email);

    if (existsUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `Пользователь «${body.email}» существует.`,
        'UserController');
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    const createdUser: UserResponse = result;

    if (req.file) {
      const avatarPath = req.file.filename;
      await this.userService.setUserAvatarPath(result.id, avatarPath);
      createdUser.avatarPath = avatarPath;
    }

    this.created(res, fillDTO(UserResponse, createdUser));
  }

  async login({body}: Request<Record<string, unknown>, Record<string, unknown>, LoginUserDto>, res: Response): Promise<void> {
    const user = await this.userService.verifyUser(body, this.configService.get('SALT'));

    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Пользователь не авторизован',
        'UserController'
      );
    }

    const token = await createJWT(
      JWT_ALGORITHM,
      this.configService.get('JWT_SECRET'),
      { email: user.email, id: user.id}
    );

    this.ok(res, {token});
  }

  async get(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Пользователь не авторизован',
        'UserController'
      );
    }

    const user = await this.userService.findUserByEmail(req.user.email);
    this.ok(res, {...fillDTO(LoggedUserResponse, user), token: req.headers.authorization?.split(' ')[1]});
  }

  async getToWatch(req: Request<Record<string, unknown>, Record<string, unknown>>, _res: Response): Promise<void> {
    const {user} = req;
    const result = await this.userService.findToWatch(user.id);
    this.ok(_res, fillDTO(MovieListItemResponse, result));
  }

  async postToWatch(req: Request<Record<string, unknown>, Record<string, unknown>, { movieId: string }>, _res: Response): Promise<void> {
    const {body, user} = req;
    await this.userService.addToWatch(body.movieId, user.id);
    this.noContent(_res, {message: 'Успешно. Фильм добавлен в список "К просмотру".'});
  }

  async deleteToWatch(req: Request<Record<string, unknown>, Record<string, unknown>, { movieId: string }>, _res: Response): Promise<void> {
    const {body, user} = req;
    await this.userService.deleteToWatch(body.movieId, user.id);
    this.noContent(_res, {message: 'Успешно. Фильм удален из списка "К просмотру".'});
  }

  async uploadAvatar(req: Request, res: Response) {
    const userId = req.params.userId;
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Пользователь с id ${userId} не существует`,
        'UploadFileMiddleware'
      );
    }

    if (req.file) {
      const createdFileName = req.file.filename;
      await this.userService.setUserAvatarPath(req.params.userId, createdFileName);
      this.created(res, { avatarPath: createdFileName });
    }
  }
}
