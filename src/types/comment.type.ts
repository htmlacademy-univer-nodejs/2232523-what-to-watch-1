import { User } from './user.type.js';

export type Comment = {
  text: string;
  raiting: number;
  publishingDate: Date;
  author: User;
}
