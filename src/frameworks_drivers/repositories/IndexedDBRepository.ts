import type { Session, Comment, Picture } from '../../core/entities/Session';
import type { SessionRepository, CommentRepository, PictureRepository } from '../../core/usecases/SessionUseCases';

const DB_NAME = 'session-tracker-db';
const DB_VERSION = 1;

class IndexedDBConnection {
  private static instance: IDBDatabase | null = null;

  static async getConnection(): Promise<IDBDatabase> {
    if (IndexedDBConnection.instance) {
      return IndexedDBConnection.instance;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        IndexedDBConnection.instance = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'sessionId' });
        }
        if (!db.objectStoreNames.contains('comments')) {
          db.createObjectStore('comments', { keyPath: 'commentId' });
        }
        if (!db.objectStoreNames.contains('pictures')) {
          db.createObjectStore('pictures', { keyPath: 'pictureId' });
        }
      };
    });
  }
}

export class IndexedDBSessionRepository implements SessionRepository {
  async saveSession(session: Session): Promise<void> {
    const db = await IndexedDBConnection.getConnection();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.put(session);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    const db = await IndexedDBConnection.getConnection();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const request = store.get(sessionId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const session = request.result;
        if (!session) {
          resolve(null);
          return;
        }
        
        resolve({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          comments: session.comments.map((c: Comment) => ({
            ...c,
            timestamp: new Date(c.timestamp)
          }))
        });
      };
    });
  }

  async getAllSessions(): Promise<Session[]> {
    const db = await IndexedDBConnection.getConnection();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const sessions = request.result;
        resolve(sessions.map(session => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          comments: session.comments.map((c: Comment) => ({
            ...c,
            timestamp: new Date(c.timestamp)
          }))
        })));
      };
    });
  }

  async updateSession(session: Session): Promise<void> {
    await this.saveSession(session);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const db = await IndexedDBConnection.getConnection();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.delete(sessionId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export class IndexedDBCommentRepository implements CommentRepository {
  async saveComment(comment: Comment): Promise<void> {
    const db = await IndexedDBConnection.getConnection();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['comments'], 'readwrite');
      const store = transaction.objectStore('comments');
      const request = store.put(comment);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCommentsBySessionId(sessionId: string): Promise<Comment[]> {
    const db = await IndexedDBConnection.getConnection();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['comments'], 'readonly');
      const store = transaction.objectStore('comments');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const comments = request.result.filter(c => c.sessionId === sessionId);
        resolve(comments.map(c => ({
          ...c,
          timestamp: new Date(c.timestamp)
        })));
      };
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    const db = await IndexedDBConnection.getConnection();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['comments'], 'readwrite');
      const store = transaction.objectStore('comments');
      const request = store.delete(commentId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export class IndexedDBPictureRepository implements PictureRepository {
  async savePicture(picture: Picture): Promise<void> {
    const db = await IndexedDBConnection.getConnection();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pictures'], 'readwrite');
      const store = transaction.objectStore('pictures');
      const request = store.put(picture);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getPictureById(pictureId: string): Promise<Picture | null> {
    const db = await IndexedDBConnection.getConnection();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pictures'], 'readonly');
      const store = transaction.objectStore('pictures');
      const request = store.get(pictureId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deletePicture(pictureId: string): Promise<void> {
    const db = await IndexedDBConnection.getConnection();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pictures'], 'readwrite');
      const store = transaction.objectStore('pictures');
      const request = store.delete(pictureId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}