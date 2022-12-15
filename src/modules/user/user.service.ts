import { UserEntity, UserModel } from './user.entity.js';
import { DocumentType } from '@typegoose/typegoose/lib/types.js';
import CreateUserDto from './dto/create-user.dto.js';
import { UserServiceInterface } from './user-service.interface.js';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/component.type.js';
import { LoggerInterface } from '../../common/logger/logger.interface.js';
import {types} from '@typegoose/typegoose';
import {MovieEntity} from '../movie/movie.entity.js';

@injectable()
export default class UserService implements UserServiceInterface {
  constructor(
    @inject(Component.LoggerInterface) private logger: LoggerInterface,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>,
    @inject(Component.MovieModel) private readonly movieModel: types.ModelType<MovieEntity>
  ) {}

  public async create(
    dto: CreateUserDto,
    salt: string
  ): Promise<DocumentType<UserEntity>> {
    const user = new UserEntity(dto);
    user.setPassword(dto.password, salt);

    const result = await UserModel.create(user);
    this.logger.info(`New user created: ${user.email}`);

    return result;
  }

  public async findByEmail(
    email: string
  ): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({ email });
  }

  public async findOrCreate(
    dto: CreateUserDto,
    salt: string
  ): Promise<DocumentType<UserEntity>> {
    const existedUser = await this.findByEmail(dto.email);

    if (existedUser) {
      return existedUser;
    }

    return this.create(dto, salt);
  }

  async findToWatch(userId: string): Promise<DocumentType<MovieEntity>[]> {
    const moviesToWatch = await this.userModel.findById(userId).select('moviesToWatch');
    return this.movieModel.find({id: { $in: moviesToWatch }});
  }

  async addToWatch(movieId: string, userId: string): Promise<void | null> {
    return this.userModel.findByIdAndUpdate(userId, {
      $push: {moviesToWatch: movieId}
    });
  }

  async deleteToWatch(movieId: string, userId: string): Promise<void | null> {
    return this.userModel.findByIdAndUpdate(userId, {
      $addToSet: {moviesToWatch: movieId}
    });
  }
}
