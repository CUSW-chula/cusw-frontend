import type { FormInput } from '@/app/types/createProjectType';
import { MoneyUI } from '@/components/elements/moneyUI';
import React from 'react';
import { type Budget, TypeMoney } from '@/app/types/moneyType';

interface MoneyProps {
  value: FormInput;
  onChange: (budgetList: Budget) => void;
}

export const MoneyContainer = ({ value, onChange }: MoneyProps) => {
  const budgetList: Budget = {
    type: TypeMoney.null,
    money: value.taskBudget ?? 0,
  };
  return <MoneyUI budgetList={budgetList} handleSubmit={onChange} />;
};
