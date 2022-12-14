import {IsInt, Max, Min, IsMongoId, IsString, Length} from 'class-validator';

export default class CreateCommentDto {
  @IsString({message: 'Возможен только ввод текста'})
  @Length(5, 1024, {message: 'Длина комментария должна быть от 5 до 1024 символов'})
  public text!: string;

  @IsInt({message: 'Рейтинг должен быть числом'})
  @Min(1, {message: 'Минимальный рейтинг равен 1'})
  @Max(10, {message: 'Максимальный рейтинг равен 10'})
  public rating!: number;

  @IsMongoId({message: 'ID фильма должен быть валидным'})
  public movieId!: string;

  @IsMongoId({message: 'ID пользователя должен быть валидным'})
  public userId!: string;
}
