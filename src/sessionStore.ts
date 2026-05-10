import { Session } from './types';

const STALE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

class SessionStore {
  private sessions = new Map<string, Session>();
  private receiverIndex = new Map<string, string>(); // receiverId -> sessionId
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => this.expireStale(), 60_000);
  }

  add(session: Session): void {
    this.sessions.set(session.id, session);
  }

  get(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  getByReceiverId(receiverId: string): Session | undefined {
    const sessionId = this.receiverIndex.get(receiverId);
    if (!sessionId) return undefined;
    return this.sessions.get(sessionId);
  }

  registerReceiver(sessionId: string, receiverId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.receiverId = receiverId;
      this.receiverIndex.set(receiverId, sessionId);
    }
  }

  remove(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session?.receiverId) {
      this.receiverIndex.delete(session.receiverId);
    }
    this.sessions.delete(sessionId);
  }

  private expireStale(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.createdAt > STALE_TIMEOUT_MS) {
        console.log(`[SessionStore] Expiring stale session: ${id}`);
        session.ws.close();
        this.remove(id);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

export const sessionStore = new SessionStore();
