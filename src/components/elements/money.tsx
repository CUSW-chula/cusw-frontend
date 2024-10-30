'use client';

import React, { useState } from 'react';
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

interface Budget {
  type: string;
  money: number;
}

const Money = () => {
  enum TypeMoney {
    null = '',
    exp = 'expect',
    real = 'real',
    used = 'used',
  }
  const [openDialog, setOpenDialog] = useState(false); // Manage dialog open state
  const [openType, setOpenType] = useState(false); //Manage Popover state Money type
  const [budget, setBudget] = useState<Budget>({
    type: TypeMoney.null,
    money: 0,
  });
  const [tempBudget, setTempBudget] = useState<Budget>({
    type: TypeMoney.null,
    money: budget.money,
  });

  const handleClear = () => {
    budget.type = TypeMoney.null;
    budget.money = 0;
    setOpenDialog(false);
    sentLog();
  };

  const handleCancel = () => {
    setBudget(tempBudget);
    setOpenDialog(false);
  };

  const handleSubmit = (budget: Budget) => {
    setTempBudget(budget);
    sentLog();
    setOpenDialog(false);
  };

  const sentLog = () => {
    budget.type === TypeMoney.exp
      ? console.log({
          taskId: 'constant taskID',
          expectedBudget: budget.money,
          realBudget: 0,
          usedBudget: 0,
        })
      : budget.type === TypeMoney.real
        ? console.log({
            taskId: 'constant taskID',
            expectedBudget: 0,
            realBudget: budget.money,
            usedBudget: 0,
          })
        : console.log({
            taskId: 'constant taskID',
            expectedBudget: 0,
            realBudget: 0,
            usedBudget: budget.money,
          });
  };

  return (
    <div className="h-10 justify-start items-center gap-[15px] inline-flex">
      <div className="h-6 justify-start items-center gap-2 inline-flex">
        <div className="text-center text-black text-2xl font-semibold font-BaiJamjuree leading-normal">
          ฿
        </div>
        <div className="text-black text-xs font-medium font-['Bai Jamjuree'] leading-tight">
          Money :{' '}
        </div>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <div
            className={`h-10 px-4 bg-white rounded-md border border-neutral-200 justify-center items-center flex min-w-32 font-BaiJamjuree hover:cursor-pointer ${
              budget.type === TypeMoney.real
                ? 'text-green'
                : budget.type === TypeMoney.used
                  ? 'text-red'
                  : 'text-black'
            }`}>
            {budget.type === TypeMoney.null
              ? 'Add Money'
              : Number.isNaN(budget.money)
                ? 'Add Money'
                : budget.money.toLocaleString()}
            {/* Allow up to three decimal */}
          </div>
        </DialogTrigger>
        <DialogContent className="w-[360px] h-[156px] px-3 pt-1 pb-3 bg-white rounded-md border border-brown flex-col justify-start items-start gap-4 inline-flex">
          <DialogTitle className="hidden" />
          {/* Content Zone */}
          <DialogDescription className="w-full flex flex-row self-stretch h-24 px-1.5 pt-9 justify-start gap-2">
            <Popover open={openType} onOpenChange={setOpenType}>
              <PopoverTrigger className="w-32 h-10 px-3 rounded-md border border-gray-300 justify-between items-center inline-flex">
                {budget.type === TypeMoney.null ? (
                  <div>Select Type</div>
                ) : budget.type === TypeMoney.exp ? (
                  <div>งบประมาณ</div>
                ) : budget.type === TypeMoney.real ? (
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
                    setBudget((prevBudget) => ({
                      ...prevBudget,
                      type: TypeMoney.exp,
                    }));
                    setOpenType(false);
                  }}>
                  งบประมาณ
                </Button>
                <Button
                  className="bg-gray-100 text-black text-sm font-normal font-Anuphan leading-normal hover:text-white "
                  onClick={() => {
                    setBudget((prevBudget) => ({
                      ...prevBudget,
                      type: TypeMoney.real,
                    }));
                    setOpenType(false);
                  }}>
                  สำรองจ่าย
                </Button>
                <Button
                  className="bg-gray-100 text-black text-sm font-normal font-Anuphan leading-normal hover:text-white "
                  onClick={() => {
                    setBudget((prevBudget) => ({
                      ...prevBudget,
                      type: TypeMoney.used,
                    }));
                    setOpenType(false);
                  }}>
                  ค่าใช้จ่าย
                </Button>
              </PopoverContent>
            </Popover>
            <Input
              id="budget"
              value={Number.isNaN(budget.money) ? '' : budget.money}
              onChange={(e) =>
                setBudget((prevBudget) => ({
                  ...prevBudget,
                  money: Number.parseFloat(e.target.value),
                }))
              }
              type="number"
              className={`h-10 w-48 px-4 bg-white rounded-md border-t border-gray-300 font-BaiJamjuree ${
                budget.type === TypeMoney.real
                  ? 'text-green'
                  : budget.type === TypeMoney.used
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
                onClick={() => handleSubmit(budget)}
                className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100"
                disabled={budget.type === TypeMoney.null || Number.isNaN(budget.money)}>
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
