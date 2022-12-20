import {NextFunction, Response} from 'express';

export interface ExceptionFilterInterface {
  catch(error: Error, res: Response, next: NextFunction): void;
}
