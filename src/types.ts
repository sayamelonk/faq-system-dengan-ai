export interface Question {
  id: string;
  name: string;
  email: string;
  questionText: string;
  status: 'Menunggu' | 'Terjawab';
  createdAt: string;
  aiDraft: string;
  humanAnswer: string;
  isDraftSaved: boolean;
  answeredAt?: string;
}

export interface Stats {
  total: number;
  pending: number;
  answered: number;
}
