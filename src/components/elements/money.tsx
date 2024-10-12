import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const Money = () => {
  const [expectedBudget, setExpectedBudget] = useState(0);
  const [realBudget, setRealBudget] = useState(0);
  const [usedBudget, setUsedBudget] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // Manage dialog open state

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
    setExpectedBudget(tempExpectedBudget);
    setRealBudget(tempRealBudget);
    setUsedBudget(tempUsedBudget);

    setIsOpen(false);

  };

  const handleSubmit = () => {
    // Process your form submission logic here
    setTempExpectedBudget(expectedBudget);
    setTempRealBudget(realBudget);
    setTempUsedBudget(usedBudget);

    console.log(
      "expectedBudget:"+expectedBudget+
      "\nrealBudget:"+realBudget+
      "\nusedBudget:"+usedBudget
    );

    // Optionally save data to your state or send it to a server

    // Close the dialog
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
        <div className="self-stretch h-[200px] px-1.5 pt-9 flex-col justify-start items-start gap-4 flex">
          <div className="self-stretch justify-start items-center gap-4 inline-flex">
            <Label
              htmlFor="name"
              className="w-20 text-black text-sm font-normal font-Anuphan leading-normal"
            >
              งบประมาณ:
            </Label>
            <Input
              id="expectedBudget"
              value={expectedBudget}
              onChange={(e) => setExpectedBudget(parseInt(e.target.value))}
              className="h-10 w-[240px] px-4 bg-white rounded-md border border-brown text-brown underline"
              placeholder="Add Budget..."
            />
          </div>
          <div className="self-stretch justify-start items-center gap-4 inline-flex">
            <Label
              htmlFor="name"
              className="w-20 text-black text-sm font-normal font-['Inter'] leading-normal"
            >
              สำรองจ่าย:
            </Label>
            <Input
              id="realBudget"
              value={realBudget}
              onChange={(e) => setRealBudget(parseInt(e.target.value))}
              className="h-10 w-[240px] px-4 bg-white rounded-md border border-brown text-green underline"
              placeholder="Add Budget..."
            />
          </div>
          <div className="self-stretch justify-start items-center gap-4 inline-flex ">
            <Label
              htmlFor="name"
              className="w-20 text-black text-sm font-normal  leading-normal"
            >
              เบิกจริง:
            </Label>
            <Input
              id="usedBudget"
              value={usedBudget}
              onChange={(e) => setUsedBudget(parseInt(e.target.value))}
              className="h-10 w-[240px] px-4 bg-white rounded-md border border-brown text-red underline"
              placeholder="Add Budget..."
            />
          </div>
        </div>
        <div className="self-stretch px-3 pt-3 border-t border-gray-300 justify-between items-start inline-flex">
          <Button
            onClick={handleClear}
            className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:text-white"
          >
            Clear
          </Button>
          <div className="grow shrink basis-0 h-10 justify-end items-start gap-2 flex">
            <Button
              onClick={handleCancel}
              className="h-10 w-20 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:text-white hover:bg-neutral-900/90"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="h-10 bg-inherit rounded-[100px] flex-col justify-center items-center gap-2 inline-flex text-brown text-sm font-normal font-BaiJamjuree  hover:text-white"
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
