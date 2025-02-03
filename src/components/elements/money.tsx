'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import BASE_URL from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { atom, useAtom, useSetAtom } from 'jotai';
import { moneyAtom } from '@/atom';
interface Budget {
  type: string;
  money: number;
}

const Money = () => {
  enum TypeMoney {
    null = '',
    budget = 'budget',
    ad = 'advance',
    exp = 'expense',
  }

  const [openDialog, setOpenDialog] = useState(false); // Manage dialog open state
  const [openType, setOpenType] = useState(false); //Manage Popover state Money type
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const setMoney = useSetAtom(moneyAtom);
  const [budgetList, setBudgetList] = useState<Budget>({
    type: TypeMoney.null,
    money: 0,
  });
  const [tempBudget, setTempBudget] = useState<Budget>({
    type: TypeMoney.null,
    money: budgetList.money,
  });
  const url = typeof window !== 'undefined' ? window.location.pathname : '';
  const path = url.split('/');
  const taskID = path[path.length - 2] === 'tasks' ? path[path.length - 1] : null;

  const pareJsonValue = React.useCallback(
    (budgetList: { budget: number; advance: number; expense: number }) => {
      return budgetList.budget
        ? { type: TypeMoney.budget, money: budgetList.budget }
        : budgetList.advance
          ? { type: TypeMoney.ad, money: budgetList.advance }
          : budgetList.expense
            ? { type: TypeMoney.exp, money: budgetList.expense }
            : { type: TypeMoney.null, money: 0 };
    },
    [],
  );

  //get budget
  useEffect(() => {
    //sent GET method
    const fetchDataGet = async () => {
      const url = `${BASE_URL}/tasks/money/${taskID}`;
      const options = {
        method: 'GET',
        headers: {
          Authorization: auth,
        },
      };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        const types = [TypeMoney.budget, TypeMoney.ad, TypeMoney.exp];
        const index = data.findIndex((value: number) => value !== 0);
        setBudgetList({
          type: types[index] || TypeMoney.null,
          money: data[index] || data[0],
        });
        if (!response.ok) return console.log('GET failed. Operation aborted.');
      } catch (error) {
        console.error(error);
      }
    };
    fetchDataGet();
  }, [taskID, auth]);

  //submit input budget
  const handleSubmit = async (budget: Budget) => {
    //sent POST method
    const fetchDataPost = async (budgetList: number[]) => {
      const url = `${BASE_URL}/tasks/money`;
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: `{"taskID":"${taskID}","budget":${budgetList[0]},"advance":${budgetList[1]},"expense":${budgetList[2]}}`,
      };
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        // console.log("POST: " + data);
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
      setTempBudget(budget);
      setOpenDialog(false);
      // sentLog();
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
      const url = `${BASE_URL}/tasks/money`;
      const options = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: `{"taskID":"${taskID}"}`,
      };
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        // console.log("DELETE: " + data);
        if (!response.ok) return false;
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
    setBudgetList(tempBudget);
    setOpenDialog(false);
  };

  //sent log of budget
  const sentLog = () => {
    const { budget, advance, expense } =
      budgetList.type === TypeMoney.budget
        ? { budget: budgetList.money, advance: 0, expense: 0 }
        : budgetList.type === TypeMoney.ad
          ? { budget: 0, advance: budgetList.money, expense: 0 }
          : { budget: 0, advance: 0, expense: budgetList.money };

    console.log({
      taskId: taskID,
      budget,
      advance,
      expense,
    });
  };

  return (
    <div className="h-10 justify-start items-center gap-[15px] inline-flex ">
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <div
            className={`h-10 px-4 bg-white rounded-md border justify-center items-center flex min-w-32 font-BaiJamjuree hover:cursor-pointer  border-brown text-brown${
              budgetList.type === TypeMoney.ad
                ? 'text-green'
                : budgetList.type === TypeMoney.null
                  ? 'text-brown'
                  : budgetList.type === TypeMoney.exp
                    ? 'text-red'
                    : 'text-black'
            }`}>
            {budgetList.type === TypeMoney.null
              ? 'Add Money'
              : Number.isNaN(budgetList.money)
                ? 'Add Money'
                : budgetList.money.toLocaleString()}
            {/* Allow up to three decimal */}
          </div>
        </DialogTrigger>
        <DialogContent className="w-[360px] h-[156px] px-3 pt-1 pb-3 bg-white rounded-md border border-brown flex-col justify-start items-start gap-4 inline-flex">
          <DialogTitle className="hidden" />
          {/* Content Zone */}
          <DialogDescription className="w-full flex flex-row self-stretch h-24 px-1.5 pt-9 justify-start gap-2">
            <Popover open={openType} onOpenChange={setOpenType}>
              <PopoverTrigger className="w-32 h-10 px-3 rounded-md border border-gray-300 justify-between items-center inline-flex ">
                {budgetList.type === TypeMoney.null ? (
                  <div>Select Type</div>
                ) : budgetList.type === TypeMoney.budget ? (
                  <div>งบประมาณ</div>
                ) : budgetList.type === TypeMoney.ad ? (
                  <div className="text-green">สำรองจ่าย</div>
                ) : (
                  <div className="text-red">ค่าใช้จ่าย</div>
                )}

                <ChevronDown className="w-4 h-4" />
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-1 w-44">
                <div className="text-lg font-Anuphan font-semibold">เลือกประเภท</div>
                <Button
                  className="bg-gray-100 text-black text-sm font-normal font-Anuphan leading-normal hover:text-white "
                  onClick={() => {
                    setBudgetList((prevBudget) => ({
                      ...prevBudget,
                      type: TypeMoney.budget,
                    }));
                    setOpenType(false);
                  }}>
                  งบประมาณ
                </Button>
                <Button
                  className="bg-gray-100 text-black text-sm font-normal font-Anuphan leading-normal hover:text-white "
                  onClick={() => {
                    setBudgetList((prevBudget) => ({
                      ...prevBudget,
                      type: TypeMoney.ad,
                    }));
                    setOpenType(false);
                  }}>
                  สำรองจ่าย
                </Button>
                <Button
                  className="bg-gray-100 text-black text-sm font-normal font-Anuphan leading-normal hover:text-white "
                  onClick={() => {
                    setBudgetList((prevBudget) => ({
                      ...prevBudget,
                      type: TypeMoney.exp,
                    }));
                    setOpenType(false);
                  }}>
                  ค่าใช้จ่าย
                </Button>
              </PopoverContent>
            </Popover>
            <Input
              id="budget"
              value={Number.isNaN(budgetList.money) ? '' : budgetList.money}
              onChange={(e) =>
                setBudgetList((prevBudget) => ({
                  ...prevBudget,
                  money: Number.parseFloat(e.target.value),
                }))
              }
              type="number"
              className={`h-10 w-48 px-4 bg-white rounded-md border-t border-gray-300 font-BaiJamjuree  ${
                budgetList.type === TypeMoney.ad
                  ? 'text-green'
                  : budgetList.type === TypeMoney.exp
                    ? 'text-red'
                    : 'text-black'
              }
              `}
              placeholder="Add Budget..."
            />
          </DialogDescription>
          {/* Controller Zone */}
          <div className="self-stretch px-3 pt-2 border-t border-gray-300 justify-between items-start inline-flex">
            <Button
              onClick={handleClear}
              className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100">
              Clear
            </Button>
            <div className="grow shrink basis-0 h-10 justify-end items-start gap-2 flex">
              <Button
                onClick={handleCancel}
                className="h-10 w-20 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100">
                Cancel
              </Button>
              <Button
                onClick={() =>
                  taskID ? handleSubmit(budgetList) : handleSubmitWhenNoTaskID(budgetList)
                }
                className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100 "
                disabled={
                  budgetList.type === TypeMoney.null ||
                  Number.isNaN(budgetList.money) ||
                  budgetList.money === 0
                }>
                Ok
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { Money };
