import { SessionUseCases } from '../../core/usecases/SessionUseCases';
import type { Session, Comment, Picture } from '../../core/entities/Session';

export class SessionService {
  constructor(private sessionUseCases: SessionUseCases) {}

  async startSession(title: string, goalTime: number, beforePictureData: string): Promise<Session> {
    return this.sessionUseCases.startSession(title, goalTime, beforePictureData);
  }

  async addComment(sessionId: string, text: string): Promise<Comment> {
    return this.sessionUseCases.addComment(sessionId, text);
  }

  async pauseSession(sessionId: string): Promise<Session> {
    return this.sessionUseCases.pauseSession(sessionId);
  }

  async resumeSession(sessionId: string): Promise<Session> {
    return this.sessionUseCases.resumeSession(sessionId);
  }

  async endSession(sessionId: string, afterPictureData: string): Promise<Session> {
    return this.sessionUseCases.endSession(sessionId, afterPictureData);
  }

  async getAllSessions(): Promise<Session[]> {
    return this.sessionUseCases.getAllSessions();
  }

  async getSessionDetails(sessionId: string): Promise<Session> {
    return this.sessionUseCases.getSessionDetails(sessionId);
  }

  async getPicture(pictureId: string): Promise<Picture | null> {
    return this.sessionUseCases.getPicture(pictureId);
  }

  // Helper methods for UI presentation
  formatDuration(startTime: Date, endTime?: Date): string {
    const end = endTime || new Date();
    const durationMs = end.getTime() - startTime.getTime();
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleString();
  }
}