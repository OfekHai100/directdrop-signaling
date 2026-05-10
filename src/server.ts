import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { SignalingMessage, Session } from './types';
import { generateReceiverId } from './idGenerator';
import { sessionStore } from './sessionStore';

const PORT = Number(process.env.PORT) || 3001;

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('DirectDrop signaling server');
});

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws: WebSocket) => {
  const sessionId = randomUUID();
  const session: Session = {
    id: sessionId,
    ws,
    createdAt: Date.now(),
  };
  sessionStore.add(session);
  console.log(`[Signaling] New connection: ${sessionId}`);

  ws.on('message', (raw: Buffer) => {
    let msg: SignalingMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      sendError(ws, 'Invalid JSON');
      return;
    }
    handleMessage(sessionId, msg);
  });

  ws.on('close', () => {
    console.log(`[Signaling] Disconnected: ${sessionId}`);
    const session = sessionStore.get(sessionId);
    if (session?.pairedWith) {
      const peer = sessionStore.get(session.pairedWith);
      if (peer) {
        send(peer.ws, { type: 'peer-disconnected' });
        peer.pairedWith = undefined;
      }
    }
    sessionStore.remove(sessionId);
  });
});

function handleMessage(sessionId: string, msg: SignalingMessage): void {
  const session = sessionStore.get(sessionId);
  if (!session) return;

  switch (msg.type) {
    case 'register-receiver': {
      const receiverId = generateReceiverId();
      sessionStore.registerReceiver(sessionId, receiverId);
      send(session.ws, { type: 'receiver-registered', receiverId });
      console.log(`[Signaling] Receiver registered: ${receiverId}`);
      break;
    }

    case 'connect-to-receiver': {
      const receiver = sessionStore.getByReceiverId(msg.receiverId);
      if (!receiver) {
        sendError(session.ws, `Receiver ID "${msg.receiverId}" not found`);
        return;
      }
      session.pairedWith = receiver.id;
      receiver.pairedWith = sessionId;
      send(receiver.ws, { type: 'sender-connected', senderId: sessionId });
      console.log(`[Signaling] Paired sender ${sessionId} with receiver ${receiver.id}`);
      break;
    }

    case 'offer':
    case 'answer':
    case 'ice-candidate': {
      const targetId = msg.to || session.pairedWith;
      const target = targetId ? sessionStore.get(targetId) : undefined;
      if (!target) {
        if (msg.type !== 'ice-candidate') {
          sendError(session.ws, 'Target not found');
        }
        return;
      }
      send(target.ws, { ...msg, to: target.id, from: sessionId });
      break;
    }

    default:
      sendError(session.ws, 'Unknown message type');
  }
}

function send(ws: WebSocket, data: object): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function sendError(ws: WebSocket, message: string): void {
  send(ws, { type: 'error', message });
}

httpServer.listen(PORT, () => {
  console.log(`[Signaling] Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
  console.log('\n[Signaling] Shutting down...');
  wss.close();
  httpServer.close();
  process.exit(0);
});
