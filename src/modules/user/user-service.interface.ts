import {UserEntity} from './user.entity.js';
import {DocumentType} from '@typegoose/typegoose';
import LoginUserDto from './dto/login-user.dto.js';
import {MovieEntity} from '../movie/movie.entity.js';
import CreateUserDto from './dto/create-user.dto.js';


export interface UserServiceInterface {
  create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;
  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;
  findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;
  findToWatch(userId: string): Promise<DocumentType<MovieEntity>[]>;
  addToWatch(movieId: string, userId: string): Promise<void | null>;
  deleteToWatch(movieId: string, userId: string): Promise<void | null>;
  verifyUser(dto: LoginUserDto, salt: string): Promise<DocumentType<UserEntity> | null>;
}
