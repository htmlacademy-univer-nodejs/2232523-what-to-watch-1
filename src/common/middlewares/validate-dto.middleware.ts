import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { NextFunction, Request, Response } from 'express';
import ValidationError from '../errors/validation-error.js';
import { MiddlewareInterface } from '../../types/middleware.interface.js';
import { ClassConstructor } from 'class-transformer/types/interfaces/class-constructor.type.js';

export class ValidateDtoMiddleware implements MiddlewareInterface {
  constructor(private dto: ClassConstructor<object>) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const dtoInstance = plainToInstance(this.dto, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length) {
      throw new ValidationError(`Validation error: "${req.path}"`,
        errors.map(({property, value, constraints}) => ({
          property,
          value,
          messages: constraints ? Object.values(constraints) : []
        }))
      );
    }

    next();
  }
}
