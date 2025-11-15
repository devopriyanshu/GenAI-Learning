
export enum ChatRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: ChatRole;
  parts: { text: string }[];
}
