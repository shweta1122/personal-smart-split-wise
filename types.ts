
export interface Member {
  id: string;
  name: string;
  email?: string;
}

export interface Split {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string; // Member ID
  splits: Split[];
  category: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: Member[];
  expenses: Expense[];
  type: 'apartment' | 'trip' | 'other';
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
}

export interface AppState {
  groups: Group[];
  friends: Member[];
  activeGroupId: string | null;
}
