import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { type Budget, TypeMoney } from '@/app/types/moneyType';

interface MoneyProps {
  budgetList: Budget;
  handleSubmit: (value: Budget) => void;
}

export const MoneyUI = ({ budgetList, handleSubmit }: MoneyProps) => {
  const [budgets, setBudgetList] = useState<Budget>({
    type: budgetList.type,
    money: budgetList.money,
  });
  const prevBudgetList = useRef<Budget>({
    type: TypeMoney.null,
    money: 0,
  });
  const [openDialog, setOpenDialog] = useState(false); // Manage dialog open state
  function getMoneyColor(budgetType: string): string {
    return budgetType === TypeMoney.ad
      ? 'text-green'
      : budgetType === TypeMoney.exp
        ? 'text-red'
        : 'text-black';
  }
  function handleChangeType(value: string): void {
    setBudgetList((prevBudget) => ({
      ...prevBudget,
      type: value,
    }));
  }
  function handleClear(): void {
    const _budgetList: Budget = {
      type: TypeMoney.null,
      money: 0,
    };
    setBudgetList(_budgetList);
    handleSubmit(_budgetList);
  }
  function handleSubmitBudget(): void {
    const _budgetList: Budget = {
      type: budgets.type,
      money: budgets.money,
    };
    setBudgetList(_budgetList);
    handleSubmit(_budgetList);
    setOpenDialog(false);
  }
  function handleCancel(): void {
    setBudgetList(prevBudgetList.current);
    setOpenDialog(false);
  }
  function handleInputMoney(value: string): void {
    setBudgetList((prevBudget) => ({
      ...prevBudget,
      money: Number.parseFloat(value),
    }));
  }
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <div
          className={`h-10 px-4 bg-white rounded-md border justify-center items-center flex min-w-32 font-BaiJamjuree hover:cursor-pointer  border-brown text-brown ${getMoneyColor(budgets.type)}`}>
          {budgets.type === TypeMoney.null || Number.isNaN(budgets.money)
            ? 'Add Money'
            : budgets.money.toLocaleString()}
        </div>
      </DialogTrigger>
      <DialogContent className="w-[360px] px-3 pt-1 pb-3 bg-white rounded-md border border-brown gap-0">
        <DialogHeader>
          <DialogTitle className="hidden" />
          <DialogDescription className="w-full flex flex-row self-stretch h-24 px-1.5 pt-9 justify-start gap-2">
            <Select value={budgets.type} onValueChange={handleChangeType}>
              <SelectTrigger
                className={`w-32 h-10 px-3 rounded-md border border-gray-300 justify-between items-center inline-flex ${getMoneyColor(budgets.type)}`}>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="budget"
                  className="text-black text-sm font-normal font-Anuphan leading-normal hover:bg-gray-100">
                  งบประมาณ
                </SelectItem>
                <SelectItem
                  value="advance"
                  className="text-black text-sm font-normal font-Anuphan leading-normal hover:bg-gray-100">
                  สำรองจ่าย
                </SelectItem>
                <SelectItem
                  value="expense"
                  className="text-black text-sm font-normal font-Anuphan leading-normal hover:bg-gray-100">
                  ค่าใช้จ่าย
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="budget"
              value={Number.isNaN(budgets.money) ? '' : budgets.money}
              onChange={(e) => handleInputMoney(e.target.value)}
              type="number"
              className={`h-10 w-48 px-4 bg-white rounded-md border-t border-gray-300 font-BaiJamjuree  ${getMoneyColor(budgets.type)}`}
              placeholder="Add Budget..."
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="px-3 pt-2 border-t border-gray-300 flex">
          <Button
            type="button"
            onClick={handleClear}
            className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100">
            Clear
          </Button>
          <div className="space-x-2 grow flex justify-end">
            <Button
              type="button"
              onClick={handleCancel}
              className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitBudget}
              className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100"
              disabled={
                budgets.type === TypeMoney.null ||
                Number.isNaN(budgets.money) ||
                budgets.money === 0
              }>
              Ok
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
