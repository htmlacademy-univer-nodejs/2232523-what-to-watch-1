import { types } from '@typegoose/typegoose';
import { UserEntity } from './user.entity.js';
import { inject, injectable } from 'inversify';
import LoginUserDto from './dto/login-user.dto.js';
import CreateUserDto from './dto/create-user.dto.js';
import { MovieEntity } from '../movie/movie.entity.js';
import { Component } from '../../types/component.type.js';
import { DocumentType } from '@typegoose/typegoose/lib/types.js';
import { UserServiceInterface } from './user-service.interface.js';
import { LoggerInterface } from '../../common/logger/logger.interface.js';

@injectable()
export default class UserService implements UserServiceInterface {
  constructor(
    @inject(Component.LoggerInterface) private logger: LoggerInterface,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>,
    @inject(Component.MovieModel) private readonly movieModel: types.ModelType<MovieEntity>
  ) {}

  public async create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const user = new UserEntity(dto);
    user.setPassword(dto.password, salt);
    const result = await this.userModel.create(user);
    this.logger.info(`Новый пользователь создан: ${user.email}`);
    return result;
  }

  async findUserById(userId: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findById(userId);
  }

  async setUserAvatarPath(userId: string, avatarPath: string): Promise<void | null> {
    return this.userModel.findByIdAndUpdate(userId, {avatarPath});
  }

  public async findUserByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({ email });
  }

  public async findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const existedUser = await this.findUserByEmail(dto.email);
    return existedUser ? existedUser : this.create(dto, salt);
  }

  async findToWatch(userId: string): Promise<DocumentType<MovieEntity>[]> {
    const moviesToWatch = await this.userModel.findById(userId).select('moviesToWatch');
    return this.movieModel.find({_id: { $in: moviesToWatch?.moviesToWatch }}).populate('user');
  }

  async addToWatch(movieId: string, userId: string): Promise<void | null> {
    return this.userModel.findByIdAndUpdate(userId, {
      $addToSet: {moviesToWatch: movieId}
    });
  }

  async deleteToWatch(movieId: string, userId: string): Promise<void | null> {
    return this.userModel.findByIdAndUpdate(userId, {
      $pull: {moviesToWatch: movieId}
    });
  }

  async verifyUser(dto: LoginUserDto, salt: string): Promise<DocumentType<UserEntity> | null> {
    const user = await this.findUserByEmail(dto.email);
    if (user && user.verifyPassword(dto.password, salt)) {
      return user;
    }
    return null;
  }
}
