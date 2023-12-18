import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
  private async logToFile(entry: string): Promise<void> {
    const formattedEntry = `${Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date())}\t${entry}\n`;

    try {
      if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
        await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'));
      }
      //   await fsPromises.appendFile(
      //     path.join(__dirname, '..', '..', 'logs', 'myLogFile.log'),
      //     formattedEntry,
      //   );
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
  }

  async log(message: any, context?: string) {
    const entry = `${context}\t${message}`;
    await this.logToFile(entry);
    super.log(message, context);
  }

  async error(message: any, stackOrContext?: string) {
    const entry = `${stackOrContext}\t${message}`;
    await this.logToFile(entry);
    super.error(message, stackOrContext);
  }
}
