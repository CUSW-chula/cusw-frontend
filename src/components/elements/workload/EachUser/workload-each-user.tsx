"use client";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import BASE_URL from "@/lib/shared";
import LoadingClient from "../../loading-screen";
import type { UserWorkload } from "@/lib/shared";
import React from "react";
import { FilterByDateRange, FilterByTags } from "../../control-bar";
import { WorkloadEachUserTable } from "../each-user-table";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

export function WorkloadEachUser() {
  const cookie = getCookie("auth");
  const auth = cookie?.toString() ?? "";

  const [isLoading, setIsLoading] = useState(true);
  const [eachUserWorkload, setEachUserWorkload] = useState<UserWorkload[]>([]);
  useEffect(() => {
    const fetchEachUserWorkload = async () => {
      try {
        const response = await fetch("/eachuserdata.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("dataeach", data); // จะเห็นว่าเป็น { users: [...] }

        setEachUserWorkload(data.users); // <-- ตรงนี้!!
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchEachUserWorkload(); // <-- เรียกตรงนี้ครั้งเดียวใน useEffect
  }, []);

  function handleDateRangeChange(
    dateRange: { from: string; to: string } | undefined
  ): void {
    throw new Error("Function not implemented.");
  }

  function handleTagSelection(selectedValues: string[]): void {
    throw new Error("Function not implemented.");
  }

  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    return nameParts.map((part) => part[0]).join(""); // Take the first letter of each part
  };
  return (
    <>
      {/* {isLoading ? (
        <div className="flex justify-center items-center w-full h-screen">
          <LoadingClient />
        </div>
      ) : (
        <>
          <div>
          <WorkloadChart userWorkload={userWorkload} setUserWorkload={setUserWorkload}/>
          </div>
        </>
      )} */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-row ">
          <div className="justify-start text-black text-5xl font-semibold font-['Anuphan'] leading-[48px]">
            Workload :
          </div>
          <div className=" ml-4 flex flex-row gap-1 items-center">
            {eachUserWorkload.length > 0 && (
              <>
              <div className="w-[36px] h-[36px]">
                    <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="w-[36px] h-[36px] bg-gray-100 rounded-full flex items-center justify-center border border-brown">
                        <span className="text-brown text-[18px] font-BaiJamjuree font-medium">
                          {getInitials(eachUserWorkload[0].name || "")}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="bg-white z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md">
                        {eachUserWorkload[0].name}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
                
                <span className="text-[21px] font-BaiJamjuree font-normal text-center">
                  {eachUserWorkload[0].name}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex w-full flex-row gap-2 py-4">
          <FilterByDateRange onDateChange={handleDateRangeChange} />
          <FilterByTags onSelectTagChange={handleTagSelection} />
        </div>
        <div>
          <WorkloadEachUserTable
            eachUserWorkload={eachUserWorkload}
            setEachUserWorkload={setEachUserWorkload}
          />
        </div>
      </div>
    </>
  );
}
export default WorkloadEachUser;
