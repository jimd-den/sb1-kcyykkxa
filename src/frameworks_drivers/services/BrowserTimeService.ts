import type { TimeService, IdGenerator } from '../../core/usecases/SessionUseCases';
import { v4 as uuidv4 } from 'uuid';

export class BrowserTimeService implements TimeService {
  getCurrentTime(): Date {
    return new Date();
  }
}

export class UuidGenerator implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}