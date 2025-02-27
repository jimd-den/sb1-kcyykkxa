import type { Session, Comment, Picture } from '../entities/Session';
import { SessionStatus, PictureType } from '../entities/Session';

export interface SessionRepository {
  saveSession(session: Session): Promise<void>;
  getSessionById(sessionId: string): Promise<Session | null>;
  getAllSessions(): Promise<Session[]>;
  updateSession(session: Session): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
}

export interface CommentRepository {
  saveComment(comment: Comment): Promise<void>;
  getCommentsBySessionId(sessionId: string): Promise<Comment[]>;
  deleteComment(commentId: string): Promise<void>;
}

export interface PictureRepository {
  savePicture(picture: Picture): Promise<void>;
  getPictureById(pictureId: string): Promise<Picture | null>;
  deletePicture(pictureId: string): Promise<void>;
}

export interface TimeService {
  getCurrentTime(): Date;
}

export interface IdGenerator {
  generate(): string;
}

export class SessionUseCases {
  constructor(
    private sessionRepository: SessionRepository,
    private commentRepository: CommentRepository,
    private pictureRepository: PictureRepository,
    private timeService: TimeService,
    private idGenerator: IdGenerator
  ) {}

  async startSession(title: string, goalTime: number, beforePictureData: string): Promise<Session> {
    if (!title || title.trim() === '') {
      throw new Error('Session title cannot be empty');
    }

    if (goalTime <= 0) {
      throw new Error('Goal time must be greater than zero');
    }

    const sessionId = this.idGenerator.generate();
    const pictureId = this.idGenerator.generate();

    // Save the before picture
    const beforePicture: Picture = {
      pictureId,
      sessionId,
      pictureData: beforePictureData,
      pictureType: PictureType.BEFORE
    };
    await this.pictureRepository.savePicture(beforePicture);

    // Create and save the session
    const session: Session = {
      sessionId,
      title,
      goalTime,
      startTime: this.timeService.getCurrentTime(),
      beforePictureId: pictureId,
      comments: [],
      sessionStatus: SessionStatus.IN_PROGRESS
    };
    await this.sessionRepository.saveSession(session);

    return session;
  }

  async addComment(sessionId: string, text: string): Promise<Comment> {
    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.sessionStatus === SessionStatus.ENDED) {
      throw new Error('Cannot add comments to an ended session');
    }

    const comment: Comment = {
      commentId: this.idGenerator.generate(),
      sessionId,
      timestamp: this.timeService.getCurrentTime(),
      text
    };

    await this.commentRepository.saveComment(comment);
    
    // Update session with new comment
    session.comments.push(comment);
    await this.sessionRepository.updateSession(session);

    return comment;
  }

  async pauseSession(sessionId: string): Promise<Session> {
    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.sessionStatus === SessionStatus.ENDED) {
      throw new Error('Cannot pause an ended session');
    }

    session.sessionStatus = SessionStatus.PAUSED;
    await this.sessionRepository.updateSession(session);

    return session;
  }

  async resumeSession(sessionId: string): Promise<Session> {
    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.sessionStatus === SessionStatus.ENDED) {
      throw new Error('Cannot resume an ended session');
    }

    session.sessionStatus = SessionStatus.IN_PROGRESS;
    await this.sessionRepository.updateSession(session);

    return session;
  }

  async endSession(sessionId: string, afterPictureData: string): Promise<Session> {
    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.sessionStatus === SessionStatus.ENDED) {
      throw new Error('Session is already ended');
    }

    const pictureId = this.idGenerator.generate();

    // Save the after picture
    const afterPicture: Picture = {
      pictureId,
      sessionId,
      pictureData: afterPictureData,
      pictureType: PictureType.AFTER
    };
    await this.pictureRepository.savePicture(afterPicture);

    // Update and save the session
    session.afterPictureId = pictureId;
    session.endTime = this.timeService.getCurrentTime();
    session.sessionStatus = SessionStatus.ENDED;
    await this.sessionRepository.updateSession(session);

    return session;
  }

  async getAllSessions(): Promise<Session[]> {
    return this.sessionRepository.getAllSessions();
  }

  async getSessionDetails(sessionId: string): Promise<Session> {
    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Load comments if they're not already loaded
    if (!session.comments || session.comments.length === 0) {
      session.comments = await this.commentRepository.getCommentsBySessionId(sessionId);
    }

    return session;
  }

  async getPicture(pictureId: string): Promise<Picture | null> {
    return this.pictureRepository.getPictureById(pictureId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Delete associated pictures
    if (session.beforePictureId) {
      await this.pictureRepository.deletePicture(session.beforePictureId);
    }
    if (session.afterPictureId) {
      await this.pictureRepository.deletePicture(session.afterPictureId);
    }

    // Delete associated comments
    const comments = await this.commentRepository.getCommentsBySessionId(sessionId);
    for (const comment of comments) {
      await this.commentRepository.deleteComment(comment.commentId);
    }

    // Delete the session
    await this.sessionRepository.deleteSession(sessionId);
  }
}