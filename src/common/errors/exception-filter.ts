import {NextFunction, Response} from 'express';
import {inject, injectable} from 'inversify';
import {StatusCodes} from 'http-status-codes';
import {ExceptionFilterInterface} from './exception-filter.interface.js';
import {LoggerInterface} from '../logger/logger.interface.js';
import HttpError from './http-error.js';
import {Component} from '../../types/component.type.js';
import {createErrorObject} from '../../utils/common.js';

@injectable()
export default class ExceptionFilter implements ExceptionFilterInterface {
  constructor(@inject(Component.LoggerInterface) private logger: LoggerInterface) {
    this.logger.info('Register ExceptionFilter');
  }

  private handleHttpError(error: HttpError, res: Response, _next: NextFunction) {
    this.logger.error(`[${error.detail}]: ${error.httpStatusCode} — ${error.message}`);
    res.status(error.httpStatusCode).json(createErrorObject(error.message));
  }

  private handleOtherError(error: Error, res: Response, _next: NextFunction) {
    this.logger.error(error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(createErrorObject(error.message));
  }

  public catch(error: Error | HttpError, res: Response, next: NextFunction): void {
    if (error instanceof HttpError) {
      return this.handleHttpError(error, res, next);
    }

    this.handleOtherError(error, res, next);
  }
}
