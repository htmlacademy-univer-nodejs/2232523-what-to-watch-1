import { Genre, GenreEnum } from '../../../types/genre.type.js';
import { IsNumber, IsArray, IsDateString, IsEnum, IsInt, IsMongoId, IsString, Length, Matches, Min } from 'class-validator';

export default class CreateMovieDto {
  @Length(2, 100, {message: 'Название фильма обязано иметь длину от 2 до 100 символов'})
    title!: string;

  @Length(20, 1024, {message: 'Описание фильма обязано иметь длину от 20 до 1024 символов'})
    description!: string;

  @IsDateString({}, {message: 'Дата публикации должна быть валидной по стандарту ISO'})
    publishingDate!: Date;

  @IsEnum(GenreEnum, {message: 'Жанр должен быть одним из: \'comedy\', \'crime\', \'documentary\', \'drama\', \'horror\', \'family\', \'romance\', \'scifi\', \'thriller\''})
    genre!: Genre;

  @IsInt({message: 'Год выхода должен быть числом'})
    releaseYear!: number;

  @IsNumber({},{message: 'Рейтинг должен быть числом'})
    rating!: number;

  @IsString({message: 'Путь превью должен быть строкой'})
    previewPath!: string;

  @IsString({message: 'Путь фильма должен быть строкой'})
    moviePath!: string;

  @IsArray({message: 'Поле "актеры" должно быть массивом'})
    actors!: string[];

  @IsString({message: 'Имя режиссёра должно быть строкой'})
  @Length(2, 50, {message: 'Минимальное имя режиссера -- 2 символа, максимальное -- 50'})
    director!: string;

  @IsInt({message: 'Продолжительность фильма должна быть числом'})
  @Min(0, {message: 'Продолжительность фильма не должна быть меньше 0'})
    durationInMinutes!: number;

  @IsMongoId({message: 'ID пользователя должен быть валидным'})
    userId!: string;

  @IsString({message: 'Путь постера должен быть строкой'})
  @Matches(/(\S+(\.jpg)$)/, {message: 'Разрешение постера -- .jpg'})
    posterPath!: string;

  @IsString({message: 'Путь бэкграунда должен быть строкой'})
  @Matches(/(\S+(\.jpg)$)/, {message: 'Разрешение бэкграунда -- .jpg'})
    backgroundImagePath!: string;

  @IsString({message: 'Цвет бэкграунда должен быть строкой'})
    backgroundColor!: string;
}
