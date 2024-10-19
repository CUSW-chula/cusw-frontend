import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Money= () => {
  const [expectedBudget, setExpectedBudget] = useState<number>(0.0);
  const [realBudget, setRealBudget] = useState<number>(0.0);
  const [usedBudget, setUsedBudget] = useState<number>(0.0);
  const [isOpen, setIsOpen] = useState(false); // Manage dialog open state

  //temp is value before changed, used in handle cancel
  const [tempExpectedBudget, setTempExpectedBudget] = useState(expectedBudget);
  const [tempRealBudget, setTempRealBudget] = useState(realBudget);
  const [tempUsedBudget, setTempUsedBudget] = useState(usedBudget);

  const handleClear = () => {
    // Reset the inputs
    setExpectedBudget(0);
    setRealBudget(0);
    setUsedBudget(0);
  };

  const handleCancel = () => {
    // Unsave the change
    setExpectedBudget(tempExpectedBudget);
    setRealBudget(tempRealBudget);
    setUsedBudget(tempUsedBudget);

    setIsOpen(false);
  };

  const handleSubmit = () => {
    // Summit the change
    setTempExpectedBudget(expectedBudget);
    setTempRealBudget(realBudget);
    setTempUsedBudget(usedBudget);
    // sent log to backend
    console.log({
      taskId: "constant taskID",
      expectedBudget: expectedBudget,
      realBudget: realBudget,
      usedBudget: usedBudget,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="h-10 px-4 bg-white rounded-md border border-[#6b5c56] flex-col justify-center items-start gap-2.5 inline-flex">
          <div className="justify-start items-center gap-2 inline-flex">
            <div className="text-[#6b5c56] text-base font-normal font-BaiJamjuree leading-normal">
              Add Money
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-[360px] h-72 p-3 bg-white rounded-md border border-brown flex-col justify-start items-start gap-4 inline-flex">
        {/* Content Zone */}
        <DialogTitle className="self-stretch h-[200px] px-1.5 pt-9 flex-col justify-start items-start gap-4 flex">
          {/* Avoid warnings */}
          <DialogDescription className="hidden" /> 
          <div className="self-stretch justify-start items-center gap-4 inline-flex">
            <Label
              htmlFor="expectedBudget"
              className="w-20 text-black text-sm font-normal font-Anuphan leading-normal"
            >
              งบประมาณ:
            </Label>
            <Input
              id="expectedBudget"
              value={expectedBudget}
              onChange={(e) =>
                setExpectedBudget(Number.parseFloat(e.target.value))
              }
              type="number"
              className="h-10 w-[240px] px-4 bg-white rounded-md border border-brown text-brown "
              placeholder="Add Budget..."
            />
          </div>
          <div className="self-stretch justify-start items-center gap-4 inline-flex">
            <Label
              htmlFor="realBudget"
              className="w-20 text-black text-sm font-normal font-Anuphan leading-normal"
            >
              สำรองจ่าย:
            </Label>
            <Input
              id="realBudget"
              value={realBudget}
              onChange={(e) => setRealBudget(Number.parseFloat(e.target.value))}
              type="number"
              className="h-10 w-[240px] px-4 bg-white rounded-md border border-brown text-green "
              placeholder="Add Budget..."
            />
          </div>
          <div className="self-stretch justify-start items-center gap-4 inline-flex ">
            <Label
              htmlFor="usedBudget"
              className="w-20 text-black text-sm font-normal  leading-normal"
            >
              เบิกจริง:
            </Label>
            <Input
              id="usedBudget"
              value={usedBudget}
              onChange={(e) => setUsedBudget(Number.parseFloat(e.target.value))}
              type="number"
              className="h-10 w-[240px] px-4 bg-white rounded-md border border-brown text-red "
              placeholder="Add Budget..."
            />
          </div>
        </DialogTitle>
        {/* Controller Zone */}
        <div className="self-stretch px-3 pt-3 border-t border-gray-300 justify-between items-start inline-flex">
          <Button
            onClick={handleClear}
            className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100"
          >
            Clear
          </Button>
          <div className="grow shrink basis-0 h-10 justify-end items-start gap-2 flex">
            <Button
              onClick={handleCancel}
              className="h-10 w-20 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:bg-gray-100"
            >
              Ok
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { Money };
