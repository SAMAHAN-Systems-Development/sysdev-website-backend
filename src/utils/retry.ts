import { Logger } from '@nestjs/common';

export async function retry<T>(
  fn: () => Promise<T>,
  methodName = 'unknown method',
  retries = 3,
  delay = 500,
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      Logger.error(err, err.stack);
      attempt++;
      if (attempt > retries) {
        if ('Delete Images' === methodName) return;
        throw new Error(
          `${methodName} failed after ${retries} retries. Please try again later.`,
        );
      }
      await new Promise((res) => setTimeout(res, delay * attempt));
    }
  }
}
