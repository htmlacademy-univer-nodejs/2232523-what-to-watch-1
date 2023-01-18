import {ClassConstructor, plainToInstance} from 'class-transformer';
import {ValidationError} from 'class-validator';
import crypto from 'crypto';
import * as jose from 'jose';
import {DEFAULT_STATIC_IMAGES} from '../app/application.constant.js';
import { UnknownObject } from '../types/unknown-object.type.js';
import {checkGenre} from '../types/genre.type.js';
import {ServiceError} from '../types/service-error.enum.js';
import {ValidationErrorField} from '../types/validation-error-field.type.js';

export const createMovie = (row: string) => {
  const tokens = row.replace('\n', '').split('\t');
  const [
    title,
    description,
    publishingDate,
    genre,
    releaseYear,
    rating,
    previewPath,
    moviePath,
    actors,
    director,
    durationInMinutes,
    userName,
    email,
    posterPath,
    backgroundImagePath,
    backgroundColor
  ] = tokens;
  return {
    title,
    description,
    publishingDate: new Date(publishingDate),
    genre: checkGenre(genre),
    releaseYear: Number(releaseYear),
    rating: Number(rating),
    previewPath,
    moviePath,
    actors: actors.split(';'),
    director,
    durationInMinutes: Number(durationInMinutes),
    commentsCount: 0,
    user: {email, name: userName},
    posterPath,
    backgroundImagePath,
    backgroundColor
  };
};

export const checkPassword = (password: string) => {
  if (password.length < 6 || password.length > 12) {
    throw new Error('Пароль должен быть от 6 до 12 символов');
  }
};

export const createSHA256 = (line: string, salt: string): string => {
  const shaHasher = crypto.createHmac('sha256', salt);
  return shaHasher.update(line).digest('hex');
};

export const fillDTO = <T, V>(someDto: ClassConstructor<T>, plainObject: V) =>
  plainToInstance(someDto, plainObject, {excludeExtraneousValues: true, enableImplicitConversion: true});

export const createJWT = async (algorithm: string, jwtSecret: string, payload: object): Promise<string> =>
  new jose.SignJWT({...payload})
    .setProtectedHeader({ alg: algorithm})
    .setIssuedAt()
    .setExpirationTime('2d')
    .sign(crypto.createSecretKey(jwtSecret, 'utf-8'));

export const transformErrors = (errors: ValidationError[]): ValidationErrorField[] =>
  errors.map(({property, value, constraints}) => ({
    property,
    value,
    messages: constraints ? Object.values(constraints) : []
  }));

export const createErrorObject = (serviceError: ServiceError, message: string, details: ValidationErrorField[] = []) => ({
  errorType: serviceError,
  message,
  details: [...details]
});

const isObject = (value: unknown) => typeof value === 'object' && value !== null;

export const transformProperty = (
  property: string,
  someObject: Record<string, unknown>,
  transformFn: (object: Record<string, unknown>) => void
) => {
  Object.keys(someObject)
    .forEach((key) => {
      if (key === property) {
        transformFn(someObject);
      } else if (isObject(someObject[key])) {
        const obj = Object(someObject[key]);
        transformProperty(property, obj, transformFn);
      }
    });
};

export const transformObject = (
  properties: string[],
  staticPath: string,
  uploadPath: string,
  data: UnknownObject
) => {
  properties.forEach((property) =>
    transformProperty(property, data, (target: UnknownObject) => {
      const rootPath = DEFAULT_STATIC_IMAGES.includes(
        target[property] as string
      )
        ? staticPath
        : uploadPath;
      target[property] = `${rootPath}/${target[property]}`;
    })
  );
};

