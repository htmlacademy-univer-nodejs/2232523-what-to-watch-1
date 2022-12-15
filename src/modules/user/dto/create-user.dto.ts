import { IsEmail, IsString, Length, Matches } from 'class-validator';

export default class CreateUserDto {
  @IsEmail({}, {message: 'Емэйл должен быть валидным'})
  public email!: string ;

  @IsString({message: 'Путь до аватара должен быть строкой'})
  @Matches(/[^\\s]+\.(jpg|png)$/, {message: 'Путь до аватара должен иметь разрешение .jpg или .png'})
  public avatarPath?: string;

  @IsString({message: 'Имя должно быть строкой'})
  @Length(1, 15, {message: 'Имя обязано иметь длину от 1 до 15 символов'})
  public name!: string;

  @IsString({message: 'Имя должно быть строкой'})
  @Length(6, 12, {message: 'Пароль обязан иметь длину от 6 до 12 символов'})
  public password!: string;
}
