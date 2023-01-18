import { Response, Request } from 'express';

export interface ExceptionFilterInterface {
  catch(error: Error, req: Request, res: Response): void;
}
