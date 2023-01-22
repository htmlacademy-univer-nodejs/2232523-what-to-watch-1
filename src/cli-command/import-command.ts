import { getURI } from '../utils/db.js';
import { Movie } from '../types/movie.type.js';
import { createMovie } from '../utils/common.js';
import UserService from '../modules/user/user.service.js';
import { UserModel } from '../modules/user/user.entity.js';
import MovieService from '../modules/movie/movie.service.js';
import { MovieModel } from '../modules/movie/movie.entity.js';
import ConfigService from '../common/config/config.service.js';
import { CliCommandInterface } from './cli-command.interface.js';
import {ConfigInterface} from '../common/config/config.interface.js';
import TSVFileReader from '../common/file-reader/tsv-file-reader.js';
import { LoggerInterface } from '../common/logger/logger.interface.js';
import DatabaseService from '../common/database-client/database.service.js';
import ConsoleLoggerService from '../common/logger/console-logger.service.js';
import { UserServiceInterface } from '../modules/user/user-service.interface.js';
import { DatabaseInterface } from '../common/database-client/database.interface.js';
import { MovieServiceInterface } from '../modules/movie/movie-service.interface.js';

const DEFAULT_USER_PASSWORD = '123456';

export default class ImportCommand implements CliCommandInterface {
  readonly name = '--import';
  private userService!: UserServiceInterface;
  private movieService!: MovieServiceInterface;
  private databaseService!: DatabaseInterface;
  private salt!: string;
  private readonly logger: LoggerInterface;
  private readonly config: ConfigInterface;

  constructor() {
    this.onLine = this.onLine.bind(this);
    this.onComplete = this.onComplete.bind(this);

    this.logger = new ConsoleLoggerService();
    this.movieService = new MovieService(this.logger, MovieModel);
    this.userService = new UserService(this.logger, UserModel, MovieModel);
    this.databaseService = new DatabaseService(this.logger);
    this.config = new ConfigService(this.logger);
  }

  private async saveMovie(movie: Movie) {
    const user = await this.userService.findOrCreate({
      ...movie.user,
      password: process.env.DB_PASSWORD || DEFAULT_USER_PASSWORD
    }, this.salt);

    await this.movieService.create(movie, user.id);
  }

  private async onLine(line: string, resolve: () => void) {
    const movie = createMovie(line);
    this.logger.info(`Created new movie: ${movie}`);
    await this.saveMovie(movie);
    resolve();
  }

  private onComplete(count: number) {
    this.logger.info(`${count} rows imported.`);
    this.databaseService.disconnect();
  }

  public async execute(filename: string): Promise<void> {
    const uri = getURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME')
    );

    this.salt = this.config.get('SALT');
    await this.databaseService.connect(uri);

    const fileReader = new TSVFileReader(filename.trim());
    fileReader.on('line', this.onLine);
    fileReader.on('end', this.onComplete);

    try {
      await fileReader.read();
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`Can't read the file: ${err.message}`);
      }
    }
  }
}

