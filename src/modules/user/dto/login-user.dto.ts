import {IsEmail, IsString} from 'class-validator';

export default class LoginUserDto {
  @IsEmail({}, {message: 'Емэйл должен быть валидным'})
  public email!: string;

  @IsString({message: 'Пароль должен быть строкой'})
  public password!: string;
}
