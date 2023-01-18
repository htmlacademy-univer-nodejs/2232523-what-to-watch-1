import { StatusCodes } from 'http-status-codes';
import HttpError from '../errors/http-error.js';
import { NextFunction, Request, Response } from 'express';
import { MiddlewareInterface } from '../../types/middleware.interface.js';
import { UserServiceInterface } from '../../modules/user/user-service.interface.js';

let unathorizedError = new HttpError(
  StatusCodes.UNAUTHORIZED,
  'Unauthorized',
  'PrivateRouteMiddleware'
);

export class PrivateRouteMiddleware implements MiddlewareInterface {
  constructor(private readonly userService: UserServiceInterface) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    if (!req.user) throw unathorizedError;
    else {
      const user = await this.userService.findUserById(req.user.id);
      if (!user) throw unathorizedError;
    }
    return next();
  }
}
