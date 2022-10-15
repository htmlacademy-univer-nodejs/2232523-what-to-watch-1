import chalk from 'chalk';
import { CliCommandInterface } from './cli-command.interface.js';

export default class HelpCommand implements CliCommandInterface {
  public readonly name = '--help';

  public async execute(): Promise<void> {
    console.log(`
        Программа для подготовки данных для ${chalk.redBright('REST API сервера')}.
        Пример:
            main.js --<${chalk.cyan('command')}> [${chalk.cyan('--arguments')}]
        Команды:
            --${chalk.magenta('version')}:                   # выводит номер версии
            --${chalk.magenta('help')}:                      # печатает этот текст
            --${chalk.magenta('import')} <path>:             # импортирует данные из TSV
            --${chalk.magenta('generator')} <n> <path> <url> # генерирует произвольное количество тестовых данных
        `);
  }
}
