import {Expose} from 'class-transformer';
import { Genre } from '../../../types/genre.type';

export default class MovieListItemDto {
  
  @Expose()
  public title!: string;
  
  @Expose()
  public publicationDate!: Date;
  
  @Expose()
  public genre!: Genre;
  
  @Expose()
  public videoPreviewUri!: string;
  
  @Expose()
  public userId!: string;
  
  @Expose()
  public posterUri!: string;

  @Expose()
  public commentAmount!: number;
}
