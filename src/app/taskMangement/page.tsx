"use client";

import { getCookie } from "cookies-next";
import BASE_URL from "@/lib/shared";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

const TasksManagementPage = () => {
  interface MenuItem {
    label: string;
    tag: string[];
    submenu?: MenuItem[];
  }

  const cookie = getCookie("auth");
  const auth = cookie?.toString() ?? "";
  const [alltag, setAllTag] = useState(null);
  const [allTaskAssigned, setAllTaskAssigned] = useState(null);

  const fetchDataAllTag = async () => {
    const url = `${BASE_URL}/tags/`;
    const options = { method: "GET", headers: { Authorization: auth } };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (data) {
        console.log(data);
        setAllTag(data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchDataTaskAssignedTag = async () => {
    const url = `${BASE_URL}/tags/getassigntask/__TAGID__`;
    const options = { method: "GET", headers: { Authorization: auth } };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (data) {
        console.log(data);
        setAllTaskAssigned(data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  //   const taskData = [
  //     {
  //       id: "a",
  //       title: "",
  //       description: "",
  //       status: "Unassigned",
  //       projectId: "cm2zuwvjv0000121jcol6grj5",
  //       parentTaskId: null,
  //       statusBudgets: "Initial",
  //       budget: 0,
  //       advance: 0,
  //       expense: 0,
  //       startDate: null,
  //       endDate: null,
  //       createdById: null,
  //     },
  //     {
  //       id: "a-1",
  //       title: "",
  //       description: "",
  //       status: "Unassigned",
  //       projectId: "cm2zuwvjv0000121jcol6grj5",
  //       parentTaskId: "a",
  //       statusBudgets: "Initial",
  //       budget: 0,
  //       advance: 0,
  //       expense: 0,
  //       startDate: null,
  //       endDate: null,
  //       createdById: null,
  //     },
  //     {
  //       id: "a-2",
  //       title: "",
  //       description: "",
  //       status: "Unassigned",
  //       projectId: "cm2zuwvjv0000121jcol6grj5",
  //       parentTaskId: "a",
  //       statusBudgets: "Initial",
  //       budget: 0,
  //       advance: 0,
  //       expense: 0,
  //       startDate: null,
  //       endDate: null,
  //       createdById: null,
  //     },
  //     {
  //       id: "a-1-1",
  //       title: "",
  //       description: "",
  //       status: "Unassigned",
  //       projectId: "cm2zuwvjv0000121jcol6grj5",
  //       parentTaskId: "a-1",
  //       statusBudgets: "Initial",
  //       budget: 0,
  //       advance: 0,
  //       expense: 0,
  //       startDate: null,
  //       endDate: null,
  //       createdById: null,
  //     },
  //     {
  //       id: "a-3",
  //       title: "",
  //       description: "",
  //       status: "Unassigned",
  //       projectId: "cm2zuwvjv0000121jcol6grj5",
  //       parentTaskId: "a",
  //       statusBudgets: "Initial",
  //       budget: 0,
  //       advance: 0,
  //       expense: 0,
  //       startDate: null,
  //       endDate: null,
  //       createdById: null,
  //     },
  //     {
  //       id: "b",
  //       title: "",
  //       description: "",
  //       status: "Unassigned",
  //       projectId: "cm2zuwvjv0000121jcol6grj5",
  //       parentTaskId: null,
  //       statusBudgets: "Initial",
  //       budget: 0,
  //       advance: 0,
  //       expense: 0,
  //       startDate: null,
  //       endDate: null,
  //       createdById: null,
  //     },
  //     {
  //       id: "c",
  //       title: "",
  //       description: "",
  //       status: "Unassigned",
  //       projectId: "cm2zuwvjv0000121jcol6grj5",
  //       parentTaskId: null,
  //       statusBudgets: "Initial",
  //       budget: 0,
  //       advance: 0,
  //       expense: 0,
  //       startDate: null,
  //       endDate: null,
  //       createdById: null,
  //     },
  //   ];

  const getItemsWithTag = (menu: MenuItem[], tag: string): MenuItem[] => {
    let result: MenuItem[] = [];

    // Recursive helper function
    function searchMenu(menu: MenuItem[]) {
      menu.forEach((item) => {
        // Check if item has the tag
        if (item.tag.includes(tag)) {
          result.push({ label: item.label, tag: item.tag });
        }

        // If submenu exists, search within it
        if (item.submenu) {
          searchMenu(item.submenu);
        }
      });
    }

    // Start the search
    searchMenu(menu);
    return result;
  };

  const renderSubMenu = (subMenu: any[]) => {
    return (
      <ul className="submenu">
        {subMenu.map((subItem, index) => (
          <li key={index} onClick={toggleSubMenu}>
            {subItem.label} {subItem.tag}
            {subItem.submenu && renderSubMenu(subItem.submenu)}
          </li>
        ))}
      </ul>
    );
  };
  const toggleSubMenu = (e) => {
    e.stopPropagation();

    let submenu = e.target.querySelector("ul");

    if (!submenu) return;

    if (submenu.style.display === "none" || !submenu.style.display) {
      submenu.style.display = "block";
    } else {
      submenu.style.display = "none";
    }
  };
  fetchDataAllTag();
  fetchDataTaskAssignedTag();

  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <div className="h-10 px-4 bg-white rounded-md border border-brown gap-2.5 flex flex-row justify-center items-center ">
            <div className="text-brown text-base font-medium font-BaiJamjuree leading-normal">
              Filter By :
            </div>
            <div className="text-black text-base font-normal font-BaiJamjuree leading-normal">
              Default
            </div>
            <ChevronDown className="w-6 h-6" />
          </div>
        </PopoverTrigger>
        <PopoverContent>Place content for the popover here.</PopoverContent>
      </Popover>
      {/* <ul>
        {itemsWithTag.map((item, index) => (
          <li key={index} onClick={toggleSubMenu}>
            {item.label} {item.tag}
            {item.submenu && renderSubMenu(item.submenu)}
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default TasksManagementPage;
