export enum Language {
  ZH_CN = 'zh-CN',
  ZH_TW = 'zh-TW',
  EN = 'en',
  JA = 'ja'
}

export enum ChalkColor {
  WHITE = '#F4F4F5',
  RED = '#FCA5A5',
  YELLOW = '#FDE047',
  BLUE = '#93C5FD',
  GREEN = '#86EFAC',
}

export interface Board {
  id: string;
  name: string;
  imageData?: string; // Base64 snapshot for restoring
}

export interface ToolState {
  color: ChalkColor;
  size: number;
  isEraser: boolean;
}

export interface Translation {
  title: string;
  boards: string;
  addBoard: string;
  clear: string;
  eraser: string;
  proModalTitle: string;
  proModalDesc: string;
  proAction: string;
  close: string;
  aiAnalyze: string;
  aiAnalyzing: string;
  aiPrompt: string;
}

export const MAX_FREE_BOARDS = 4;