export interface Session {
  sessionId: string;
  title: string;
  goalTime: number; // in minutes
  startTime: Date;
  endTime?: Date;
  beforePictureId?: string;
  afterPictureId?: string;
  comments: Comment[];
  sessionStatus: SessionStatus;
}

export enum SessionStatus {
  IN_PROGRESS = "IN_PROGRESS",
  PAUSED = "PAUSED",
  ENDED = "ENDED"
}

export interface Comment {
  commentId: string;
  sessionId: string;
  timestamp: Date;
  text: string;
  pictureData?: string; // Base64 encoded image data for comment
}

export interface Picture {
  pictureId: string;
  sessionId: string;
  pictureData: string; // Base64 encoded image data
  pictureType: PictureType;
}

export enum PictureType {
  BEFORE = "BEFORE",
  AFTER = "AFTER"
}