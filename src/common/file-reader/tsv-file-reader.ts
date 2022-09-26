import { readFileSync } from 'fs';
import { Movie } from '../../types/movie.type.js';
import { Genre } from '../../types/genre-type.enum.js';
import { FileReaderInterface } from './file-reader.interface.js';

export default class TSVFileReader implements FileReaderInterface {
  private rawData = '';

  constructor(public filename: string) { }

  public read(): void {
    this.rawData = readFileSync(this.filename, { encoding: 'utf8' });
  }

  public toArray(): Movie[] {
    if (!this.rawData) {
      return [];
    }

    return this.rawData
      .split('\n')
      .filter((row) => row.trim() !== '')
      .map((line) => line.split('\t'))
      .map(([title, description, createdDate, genre, releaseYear, rating, moviePreview, movie, actors, producer, movieDuration, commentsCount, userName, email, avatarPath, password, poster, backgroundImage, backgroundColor]) => ({
        name: title,
        description,
        postDate: new Date(createdDate),
        genre: Genre[genre as 'comedy' | 'crime' | 'documentary' | 'drama' | 'horror' | 'family' | 'romance' |'scifi' | 'thriller'],
        releaseYear : Number.parseInt(releaseYear, 10),
        rating: parseFloat(rating),
        moviePreview,
        movie,
        actors: actors.split(';')
          .map((name) => ({name})),
        producer,
        movieDuration: Number.parseInt(movieDuration, 10),
        commentsCount: Number.parseInt(commentsCount, 10),
        user: {userName, email, avatarPath, password},
        poster,
        backgroundImage,
        backgroundColor
      }));
  }
}
