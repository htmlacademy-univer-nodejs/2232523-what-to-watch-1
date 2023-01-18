import { injectable } from 'inversify';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { transformObject } from '../../utils/common.js';
import { ConfigInterface } from '../config/config.interface.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import { RouteInterface } from '../../types/route.interface.js';
import { ControllerInterface } from './controller.interface.js';
import { UnknownObject } from '../../types/unknown-object.type.js';
import { STATIC_RESOURCE_FIELDS } from '../../app/application.constant.js';

@injectable()
export abstract class Controller implements ControllerInterface {
  private readonly _router: Router;

  constructor(protected readonly logger: LoggerInterface,
              protected readonly configService: ConfigInterface) {
    this._router = Router();
  }

  get router() {
    return this._router;
  }

  addRoute(route: RouteInterface) {
    const routeHandler = asyncHandler(route.handler.bind(this));
    const middlewares = route.middlewares?.map(
      (middleware) => asyncHandler(middleware.execute.bind(middleware))
    );

    const allHandlers = middlewares ? [...middlewares, routeHandler] : routeHandler;
    this._router[route.method](route.path, allHandlers);
    this.logger.info(`Путь зарегестрирован: ${route.method.toUpperCase()} ${route.path}`);
  }

  protected addStaticPath(data: UnknownObject): void {
    const fullServerPath = `http://${this.configService.get('HOST')}:${this.configService.get('PORT')}`;
    transformObject(
      STATIC_RESOURCE_FIELDS,
      `${fullServerPath}${this.configService.get('STATIC_DIRECTORY_PATH')}`,
      `${fullServerPath}${this.configService.get('UPLOAD_DIRECTORY')}`,
      data
    );
  }

  send<T>(res: Response, statusCode: number, data: T): void {
    this.addStaticPath(data as UnknownObject);
    res.type('application/json')
      .status(statusCode)
      .json(data);
  }

  created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  noContent<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.NO_CONTENT, data);
  }

  ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }
}
