import { User } from './user.type.js';

export type Comment = {
  commentText: string;
  raiting: number;
  postDate: Date;
  commentAuthor: User;
}
