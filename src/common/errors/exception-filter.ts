import HttpError from './http-error.js';
import { Response, Request } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import ValidationError from './validation-error.js';
import { createErrorObject } from '../../utils/common.js';
import { Component } from '../../types/component.type.js';
import {ServiceError} from '../../types/service-error.enum.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import { ExceptionFilterInterface } from './exception-filter.interface.js';

@injectable()
export default class ExceptionFilter implements ExceptionFilterInterface {
  constructor(@inject(Component.LoggerInterface) private logger: LoggerInterface) {
    this.logger.info('Register ExceptionFilter');
  }

  private handleHttpError(error: HttpError, _req: Request, res: Response) {
    this.logger.error(`[${error.detail}]: ${error.httpStatusCode} — ${error.message}`);
    res.status(error.httpStatusCode).json(createErrorObject(ServiceError.COMMON_ERROR, error.message));
  }

  private handleOtherError(error: Error, _req: Request, res: Response) {
    this.logger.error(error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(createErrorObject(ServiceError.SERVICE_ERROR, error.message));
  }

  private handleValidationError(error: ValidationError, _req: Request, res: Response) {
    this.logger.error(`[Validation Error]: ${error.message}`);
    error.details.forEach(
      (errorField) => this.logger.error(`[${errorField.property}] — ${errorField.messages}`)
    );

    res
      .status(StatusCodes.BAD_REQUEST)
      .json(createErrorObject(ServiceError.VALIDATION_ERROR, error.message, error.details));
  }

  public catch(error: Error | HttpError, req: Request, res: Response): void {
    if (error instanceof HttpError) {
      return this.handleHttpError(error, req, res);
    } else if (error instanceof ValidationError) {
      return this.handleValidationError(error, req, res);
    }

    this.handleOtherError(error, req, res);
  }
}
