export interface Budget {
  type: string;
  money: number;
}

export enum TypeMoney {
  null = '',
  budget = 'budget',
  ad = 'advance',
  exp = 'expense',
}
