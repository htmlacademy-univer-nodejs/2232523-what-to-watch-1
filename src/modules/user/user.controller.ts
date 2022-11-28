import {Controller} from '../../common/controller/controller.js';
import {inject, injectable} from 'inversify';
import {LoggerInterface} from '../../common/logger/logger.interface.js';
import {HttpMethod} from '../../types/http-method.enum.js';
import {Request, Response} from 'express';
import CreateUserDto from './dto/create-user.dto.js';
import {UserServiceInterface} from './user-service.interface.js';
import HttpError from '../../common/errors/http-error.js';
import {StatusCodes} from 'http-status-codes';
import UserResponse from './response/user.response.js';
import {ConfigInterface} from '../../common/config/config.interface.js';
import LoginUserDto from './dto/login-user.dto.js';
import {Component} from '../../types/component.type.js';
import {fillDTO} from '../../utils/common.js';
import MovieResponse from '../movie/response/movie.response.js';

@injectable()
export default class UserController extends Controller {
  constructor(@inject(Component.LoggerInterface) logger: LoggerInterface,
              @inject(Component.UserServiceInterface) private readonly userService: UserServiceInterface,
              @inject(Component.ConfigInterface) private readonly configService: ConfigInterface) {
    super(logger);
    this.logger.info('Register routes for UserController.');

    this.addRoute({path: '/register', method: HttpMethod.Post, handler: this.create});
    this.addRoute({path: '/login', method: HttpMethod.Post, handler: this.login});
    this.addRoute({path: '/login', method: HttpMethod.Get, handler: this.get});
    this.addRoute({path: '/logout', method: HttpMethod.Delete, handler: this.logout});
    this.addRoute({path: '/to_watch', method: HttpMethod.Get, handler: this.getToWatch});
    this.addRoute({path: '/to_watch', method: HttpMethod.Post, handler: this.postToWatch});
    this.addRoute({path: '/to_watch', method: HttpMethod.Delete, handler: this.deleteToWatch});
  }

  public async create({body}: Request<Record<string, unknown>, Record<string, unknown>, CreateUserDto>, res: Response): Promise<void> {
    const existsUser = await this.userService.findByEmail(body.email);

    if (existsUser) {
      throw new HttpError(StatusCodes.CONFLICT, `Пользователь с таким email «${body.email}» уже существует.`, 'UserController');
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    this.send(res, StatusCodes.CREATED, fillDTO(UserResponse, result));
  }

  public async login({body,}: Request<Record<string, unknown>, Record<string, unknown>, LoginUserDto>, res: Response): Promise<void> {
    const existUser = await this.userService.findByEmail(body.email);

    if (existUser) {
      this.send(res, StatusCodes.CREATED, fillDTO(UserResponse, existUser));
      return;
    }

    if (!existUser) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Пользователь с таким email ${body.email} не существует`, 'UserController');
    }
  }

  public async get(_: Request<Record<string, unknown>, Record<string, unknown>, Record<string, string>>, _res: Response): Promise<void> {
    throw new HttpError(StatusCodes.NOT_IMPLEMENTED, 'Не реализована', 'UserController',);
  }

  public async logout(_: Request<Record<string, unknown>, Record<string, unknown>, Record<string, string>>, _res: Response): Promise<void> {
    throw new HttpError(StatusCodes.NOT_IMPLEMENTED, 'Не реализована', 'UserController',);
  }

  public async getToWatch({body}: Request<Record<string, unknown>, Record<string, unknown>, {userId: string}>, _res: Response): Promise<void> {
    const result = this.userService.findToWatch(body.userId);
    this.send(_res, StatusCodes.OK, fillDTO(MovieResponse, result));
  }

  public async postToWatch({body}: Request<Record<string, unknown>, Record<string, unknown>, {userId: string, movieId: string}>, _res: Response): Promise<void> {
    await this.userService.addToWatch(body.userId, body.movieId);
    this.send(_res, StatusCodes.NO_CONTENT, {message: 'Успешно. Фильм добавлен в список "К просмотру".'});
  }

  public async deleteToWatch({body}: Request<Record<string, unknown>, Record<string, unknown>, {userId: string, movieId: string}>, _res: Response): Promise<void> {
    await this.userService.deleteToWatch(body.userId, body.movieId);
    this.send(_res, StatusCodes.NO_CONTENT, {message: 'Успешно. Фильм удален из списка "К просмотру".'});
  }
}
