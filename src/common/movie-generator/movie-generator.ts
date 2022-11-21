import {MockData} from '../../types/mock-data.type.js';
import {getRandomItem, getRandomItems, generateRandomValue} from '../../utils/random.js';
import {GENRE} from '../../types/genre.type.js';
import dayjs from 'dayjs';
import {MovieGeneratorInterface} from './movie-generator.interface';

const MAX_RELEASE_YEAR = 2022;
const MIN_RELEASE_YEAR = 1990;
const MAX_DURATION = 180;
const MIN_DURATION = 70;
const MIN_RATING = 1;
const MAX_RATING = 5;
const FIRST_WEEK_DAY = 1;
const LAST_WEEK_DAY = 7;
const MAX_COMMENTS_COUNT = 1000;
const MIN_COMMENTS_COUNT = 0;

export default class MovieGenerator implements MovieGeneratorInterface {
  constructor(private readonly mockData: MockData) {}

  public generate(): string {
    const title = getRandomItem<string>(this.mockData.titles);
    const description = getRandomItem<string>(this.mockData.descriptions);
    const publishingDate = dayjs().subtract(generateRandomValue(FIRST_WEEK_DAY, LAST_WEEK_DAY), 'day').toISOString();
    const genre = getRandomItem(GENRE);
    const releaseYear = generateRandomValue(MIN_RELEASE_YEAR, MAX_RELEASE_YEAR);
    const rating = generateRandomValue(MIN_RATING, MAX_RATING, 1);
    const moviePreview = getRandomItem<string>(this.mockData.moviePreviews);
    const movie = getRandomItem<string>(this.mockData.movies);
    const actors = getRandomItems<string>(this.mockData.actors).join(';');
    const producer = getRandomItem<string>(this.mockData.producers);
    const movieDuration = generateRandomValue(MIN_DURATION, MAX_DURATION);
    const commentsCount = generateRandomValue(MIN_COMMENTS_COUNT, MAX_COMMENTS_COUNT);
    const userName = getRandomItem<string>(this.mockData.users);
    const email = getRandomItem<string>(this.mockData.emails);
    const avatarPath = getRandomItem<string>(this.mockData.avatarPaths);
    const password = getRandomItem<string>(this.mockData.passwords);
    const poster = getRandomItem<string>(this.mockData.posters);
    const backgroundImage = getRandomItem<string>(this.mockData.backgroundImages);
    const backgroundColor = getRandomItem<string>(this.mockData.backgroundColors);

    return [
      title,
      description,
      publishingDate,
      genre,
      releaseYear,
      rating,
      moviePreview,
      movie,
      actors,
      producer,
      movieDuration,
      commentsCount,
      userName,
      email,
      avatarPath,
      password,
      poster,
      backgroundImage,
      backgroundColor
    ].join('\t');
  }
}
