import React, { useEffect, useRef, useState } from 'react';
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
import BASE_URL from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { useSetAtom } from 'jotai';
import { moneyAtom } from '@/atom';
import type { TaskProps } from '@/app/types/types';
interface Budget {
  type: string;
  money: number;
}

const Money = ({ task }: { task: TaskProps }) => {
  enum TypeMoney {
    null = '',
    budget = 'budget',
    ad = 'advance',
    exp = 'expense',
  }

  const [openDialog, setOpenDialog] = useState(false); // Manage dialog open state
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const setMoney = useSetAtom(moneyAtom);
  const [budgetList, setBudgetList] = useState<Budget>({
    type: TypeMoney.null,
    money: 0,
  });
  const prevBudgetList = useRef<Budget>({
    type: TypeMoney.null,
    money: 0,
  });

  const getMoneyColor = (budgetType: string) => {
    return budgetType === TypeMoney.ad
      ? 'text-green'
      : budgetType === TypeMoney.exp
        ? 'text-red'
        : 'text-black';
  };

  useEffect(() => {
    const data = [task.budget, task.advance, task.expense].find((item) => item !== 0);
    const types = [TypeMoney.budget, TypeMoney.ad, TypeMoney.exp];
    const index = [task.budget, task.advance, task.expense].findIndex((item) => item !== 0);
    setBudgetList({
      type: index === -1 ? TypeMoney.null : types[index],
      money: data ?? 0,
    });
    prevBudgetList.current = {
      type: types[index] || TypeMoney.null,
      money:
        [task.budget, task.advance, task.expense][index] ||
        [task.budget, task.advance, task.expense][0],
    };
  }, []);

  //submit input budget
  const handleSubmit = async (budget: Budget) => {
    //sent POST method
    const fetchDataPost = async (budgetList: number[]) => {
      const url = `${BASE_URL}/v2/tasks/money`;
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          taskID: task.id,
          budget: budgetList[0],
          advance: budgetList[1],
          expense: budgetList[2],
        }),
      };
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log(`POST:·${data}`);
        if (!response.ok) return false;
      } catch (error) {
        console.error(error);
      }
      return true;
    };

    const data =
      budget.type === TypeMoney.budget
        ? [budget.money, 0, 0]
        : budget.type === TypeMoney.ad
          ? [0, budget.money, 0]
          : [0, 0, budget.money];
    if (await fetchDataPost(data)) {
      prevBudgetList.current = budget;
      setOpenDialog(false);
    }
  };

  const handleSubmitWhenNoTaskID = async (budgetList: Budget) => {
    const budget = budgetList.type === TypeMoney.budget ? budgetList.money : 0;
    const advance = budgetList.type === TypeMoney.ad ? budgetList.money : 0;
    const expense = budgetList.type === TypeMoney.exp ? budgetList.money : 0;
    setMoney([budget, advance, expense]);
    setOpenDialog(false);
    console.log('MoneyAtom in money: ', moneyAtom);
  };

  //clear budget
  const handleClear = async () => {
    //sent DELETE method
    const fetchDataDelete = async () => {
      const url = `${BASE_URL}/v2/tasks/money`;
      const options = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: `{"taskID":"${task.id}"}`,
      };
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        if (!response.ok) return false;
        return data;
      } catch (error) {
        console.error(error);
      }
      return true;
    };

    if (await fetchDataDelete()) {
      budgetList.type = TypeMoney.null;
      budgetList.money = 0;
      setOpenDialog(false);
      // sentLog();
    }
  };

  //not save budget input
  const handleCancel = () => {
    setBudgetList(prevBudgetList.current);
    setOpenDialog(false);
  };

  function handleInputMoney(value: string): void {
    setBudgetList((prevBudget) => ({
      ...prevBudget,
      money: Number.parseFloat(value),
    }));
  }

  function changeTypeMoney(value: string): void {
    setBudgetList((prevBudget) => ({
      ...prevBudget,
      type: value,
    }));
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <div
          className={`h-10 px-4 bg-white rounded-md border justify-center items-center flex min-w-32 font-BaiJamjuree hover:cursor-pointer  border-brown text-brown ${getMoneyColor(budgetList.type)}`}>
          {budgetList.type === TypeMoney.null || Number.isNaN(budgetList.money)
            ? 'Add Money'
            : budgetList.money.toLocaleString()}
          {/* Allow up to three decimal */}
        </div>
      </DialogTrigger>
      <DialogContent className="w-[360px] px-3 pt-1 pb-3 bg-white rounded-md border border-brown gap-0">
        <DialogHeader>
          <DialogTitle className="hidden" />
          {/* Content Zone */}
          <DialogDescription className="w-full flex flex-row self-stretch h-24 px-1.5 pt-9 justify-start gap-2">
            <Select value={budgetList.type} onValueChange={(value) => changeTypeMoney(value)}>
              <SelectTrigger
                className={`w-32 h-10 px-3 rounded-md border border-gray-300 justify-between items-center inline-flex ${getMoneyColor(budgetList.type)}`}>
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
              value={Number.isNaN(budgetList.money) ? '' : budgetList.money}
              onChange={(e) => handleInputMoney(e.target.value)}
              type="number"
              className={`h-10 w-48 px-4 bg-white rounded-md border-t border-gray-300 font-BaiJamjuree  ${getMoneyColor(budgetList.type)}`}
              placeholder="Add Budget..."
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="px-3 pt-2 border-t border-gray-300 flex">
          <Button
            onClick={handleClear}
            className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100">
            Clear
          </Button>
          <div className="space-x-2 grow flex justify-end">
            <Button
              onClick={handleCancel}
              className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100">
              Cancel
            </Button>
            <Button
              onClick={() =>
                task.id ? handleSubmit(budgetList) : handleSubmitWhenNoTaskID(budgetList)
              }
              className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100"
              disabled={
                budgetList.type === TypeMoney.null ||
                Number.isNaN(budgetList.money) ||
                budgetList.money === 0
              }>
              Ok
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { Money };
