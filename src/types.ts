export interface RegisterReceiverMessage {
  type: 'register-receiver';
}

export interface ReceiverRegisteredMessage {
  type: 'receiver-registered';
  receiverId: string;
}

export interface ConnectToReceiverMessage {
  type: 'connect-to-receiver';
  receiverId: string;
}

export interface SenderConnectedMessage {
  type: 'sender-connected';
  senderId: string;
}

export interface OfferMessage {
  type: 'offer';
  to: string;
  sdp: string;
}

export interface AnswerMessage {
  type: 'answer';
  to: string;
  sdp: string;
}

export interface IceCandidateMessage {
  type: 'ice-candidate';
  to: string;
  candidate: any;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export interface PeerDisconnectedMessage {
  type: 'peer-disconnected';
}

export type SignalingMessage =
  | RegisterReceiverMessage
  | ReceiverRegisteredMessage
  | ConnectToReceiverMessage
  | SenderConnectedMessage
  | OfferMessage
  | AnswerMessage
  | IceCandidateMessage
  | ErrorMessage
  | PeerDisconnectedMessage;

export interface Session {
  id: string;
  ws: import('ws').WebSocket;
  receiverId?: string;
  pairedWith?: string;
  createdAt: number;
}
