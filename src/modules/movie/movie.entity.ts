import typegoose, {defaultClasses, getModelForClass, Ref} from '@typegoose/typegoose';
import {UserEntity} from '../user/user.entity.js';
import {GENRE, Genre} from '../../types/genre.type.js';

const {prop, modelOptions} = typegoose;

export interface MovieEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'movies'
  }
})
export class MovieEntity extends defaultClasses.TimeStamps {
  @prop({trim: true, required: true, minlength: 2, maxlength: 100})
  public name!: string;

  @prop({trim: true, required: true, minlength: 20, maxlength: 1024})
  public description!: string;

  @prop({required: true})
  public postDate!: Date;

  @prop({
    type: () => String,
    required: true,
    enum: GENRE
  })
  public genre!: Genre;

  @prop({required: true})
  public releaseYear!: number;

  @prop({required: true})
  public rating!: number;

  @prop({required: true})
  public moviePreview!: string;

  @prop({required: true})
  public movie!: string;

  @prop({required: true})
  public actors!: string[];

  @prop({required: true, minlength: 2, maxlength: 50})
  public producer!: string;

  @prop({required: true})
  public movieDuration!: number;

  @prop({default: 0})
  public commentsCount!: number;

  @prop({
    ref: UserEntity,
    required: true
  })
  public user!: Ref<UserEntity>;

  @prop({required: true, match: /([^\s]+(\.jpg)$)/})
  public poster!: string;

  @prop({required: true, match: /([^\s]+(\.jpg)$)/})
  public backgroundImage!: string;

  @prop({required: true})
  public backgroundColor!: string;
}

export const MovieModel = getModelForClass(MovieEntity);
