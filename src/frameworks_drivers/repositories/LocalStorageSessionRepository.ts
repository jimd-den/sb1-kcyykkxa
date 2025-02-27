import type { Session, Comment, Picture } from '../../core/entities/Session';
import type { SessionRepository, CommentRepository, PictureRepository } from '../../core/usecases/SessionUseCases';

export class LocalStorageSessionRepository implements SessionRepository {
  private readonly SESSIONS_KEY = 'sessions';

  async saveSession(session: Session): Promise<void> {
    const sessions = this.getSessions();
    sessions.push(session);
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.sessionId === sessionId);
    
    if (!session) {
      return null;
    }
    
    // Convert string dates back to Date objects
    return {
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
      comments: session.comments.map(c => ({
        ...c,
        timestamp: new Date(c.timestamp)
      }))
    };
  }

  async getAllSessions(): Promise<Session[]> {
    const sessions = this.getSessions();
    
    // Convert string dates back to Date objects
    return sessions.map(session => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
      comments: session.comments.map(c => ({
        ...c,
        timestamp: new Date(c.timestamp)
      }))
    }));
  }

  async updateSession(session: Session): Promise<void> {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.sessionId === session.sessionId);
    
    if (index !== -1) {
      sessions[index] = session;
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    }
  }

  private getSessions(): Session[] {
    const sessionsJson = localStorage.getItem(this.SESSIONS_KEY);
    return sessionsJson ? JSON.parse(sessionsJson) : [];
  }
}

export class LocalStorageCommentRepository implements CommentRepository {
  private readonly COMMENTS_KEY = 'comments';

  async saveComment(comment: Comment): Promise<void> {
    const comments = this.getComments();
    comments.push(comment);
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
  }

  async getCommentsBySessionId(sessionId: string): Promise<Comment[]> {
    const comments = this.getComments();
    return comments
      .filter(c => c.sessionId === sessionId)
      .map(c => ({
        ...c,
        timestamp: new Date(c.timestamp)
      }));
  }

  private getComments(): Comment[] {
    const commentsJson = localStorage.getItem(this.COMMENTS_KEY);
    return commentsJson ? JSON.parse(commentsJson) : [];
  }
}

export class LocalStoragePictureRepository implements PictureRepository {
  private readonly PICTURES_KEY = 'pictures';

  async savePicture(picture: Picture): Promise<void> {
    const pictures = this.getPictures();
    pictures.push(picture);
    localStorage.setItem(this.PICTURES_KEY, JSON.stringify(pictures));
  }

  async getPictureById(pictureId: string): Promise<Picture | null> {
    const pictures = this.getPictures();
    return pictures.find(p => p.pictureId === pictureId) || null;
  }

  private getPictures(): Picture[] {
    const picturesJson = localStorage.getItem(this.PICTURES_KEY);
    return picturesJson ? JSON.parse(picturesJson) : [];
  }
}