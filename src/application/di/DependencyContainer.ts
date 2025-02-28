import { SessionUseCases } from '../../core/usecases/SessionUseCases';
import { SessionService } from '../services/SessionService';
import { 
  IndexedDBSessionRepository, 
  IndexedDBCommentRepository, 
  IndexedDBPictureRepository 
} from '../../frameworks_drivers/repositories/IndexedDBRepository';
import { 
  BrowserTimeService, 
  UuidGenerator 
} from '../../frameworks_drivers/services/BrowserTimeService';
import { CameraService } from '../../frameworks_drivers/services/CameraService';

// Singleton instance for dependency injection
export class DependencyContainer {
  private static instance: DependencyContainer;
  
  private sessionRepository = new IndexedDBSessionRepository();
  private commentRepository = new IndexedDBCommentRepository();
  private pictureRepository = new IndexedDBPictureRepository();
  private timeService = new BrowserTimeService();
  private idGenerator = new UuidGenerator();
  private cameraService = new CameraService();
  
  private sessionUseCases = new SessionUseCases(
    this.sessionRepository,
    this.commentRepository,
    this.pictureRepository,
    this.timeService,
    this.idGenerator
  );
  
  private sessionService = new SessionService(this.sessionUseCases);
  
  private constructor() {}
  
  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }
  
  getSessionService(): SessionService {
    return this.sessionService;
  }
  
  getCameraService(): CameraService {
    return this.cameraService;
  }
}