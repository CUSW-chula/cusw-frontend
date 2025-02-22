"use client";

import * as React from "react";
import { Circle, CircleFadingPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TooltipProvider } from "@/components/ui/tooltip"; // Import TooltipProvider
import { Profile } from "./profile";
import BASE_URL, {
  BASE_SOCKET,
  Task,
  User,
  type TaskManageMentProp,
} from "@/lib/shared";
import { getCookie } from "cookies-next";
import type { TaskProps } from "@/app/types/types";
import { toast } from "@/hooks/use-toast";
import { useToast } from "@/hooks/use-toast";

interface UsersInterfaces {
  id: string;
  name: string;
  email: string;
}

export function AssignedTaskToMember({ task }: { task: TaskProps }) {
  const cookie = getCookie("auth");
  const auth = cookie?.toString() ?? "";
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UsersInterfaces[]>([]);
  const [usersList, setUsersList] = React.useState<UsersInterfaces[]>([]);
  const [owner, setOwner] = React.useState<UsersInterfaces[]>([]);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const pareJsonValue = React.useCallback((values: any) => {
    const newValue: UsersInterfaces = {
      id: values.id,
      email: values.email,
      name: values.name,
    };
    return newValue;
  }, []);

  React.useEffect(() => {
    const fetchAssignAndUsers = async () => {
      const usersData = await fetch(`${BASE_URL}/v2/users`, {
        headers: {
          Authorization: auth,
        },
      });
      if (!usersData.ok) {
        const errorMessage = await usersData.text();
        // throw new Error("Failed to assign tag");
        toast({
          title: `🚨 Error ${usersData.status}: ${usersData.statusText}`,
          description: `
                         🔥 error: ${
                           errorMessage || "An unexpected error occurred."
                         }
                         
                         🗂️ file: assigned-task.tsx
                             `,
          variant: "default",
        });
      }
      const userList = await usersData.json();
      setUsersList(userList);
    };

    fetchAssignAndUsers();

    setSelectedUser(task.members);

    const fetchOwner = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/v2/projects/${task.projectId}`,
          {
            headers: {
              Authorization: auth,
            },
          }
        );
        if (!response.ok) {
          const errorMessage = await response.text();
          // throw new Error("Failed to assign tag");
          toast({
            title: `🚨 Error ${response.status}: ${response.statusText}`,
            description: `
        🔥 error: ${errorMessage || "An unexpected error occurred."}
        
        🗂️ file: assigned-task.tsx
            `,
            variant: "default",
          });
        }
        const data = await response.json();
        setOwner(data.owner);
      } catch (error) {
        console.error("Error fetching Owner:", error);
      }
    };
    fetchOwner();

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      try {
        const socketEvent = JSON.parse(event.data); // Parse incoming message
        const eventName = socketEvent.eventName;
        if (eventName === `assigned:${task.id}`) {
          const data = pareJsonValue(socketEvent.data);
          setSelectedUser((prevList) =>
            Array.isArray(prevList) ? [...prevList, data] : []
          );
        }
        if (eventName === `unassigned:${task.id}`) {
          const data = pareJsonValue(socketEvent.data);
          setSelectedUser((prevList) =>
            Array.isArray(prevList)
              ? prevList.filter((item) => item.id !== data.id)
              : []
          );
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {};

    return () => {
      ws.close();
    };
  }, [pareJsonValue, task, auth]);

  // Handle user selection and unselection
  const handleSelectUser = async (value: string) => {
    const selected = usersList.find((user) => user.name === value);
    if (selected && !owner.some((o) => o.id === selected.id)) {
      const isAlreadySelected = selectedUser.some(
        (user) => user.id === selected.id
      );

      const url = isAlreadySelected
        ? `${BASE_URL}/v2/tasks/unassigned` // Unassign user
        : `${BASE_URL}/v2/tasks/assign`; // Assign user

      const options = {
        method: isAlreadySelected ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: auth },
        body: JSON.stringify({ taskId: task.id, userId: selected.id }),
      };

      try {
        const response = await fetch(url, options);

        // เช็คว่าคำขอสำเร็จหรือไม่
        if (response.ok) {
          // throw new Error("Failed to assign tag");
          if (options.method === "POST")
            toast({
              title: "Complete",
              description: `You assigned "${selected.name}" to this task`,
              variant: "default", // หรือใช้ 'success' ถ้ามี custom variant
            });
          if (options.method === "DELETE")
            toast({
              title: "Complete",
              description: `You unassigned "${selected.name}" from this task`,
              variant: "default", // หรือใช้ 'success' ถ้ามี custom variant
            });
        } else {
          toast({
            title: "Error",
            description: "You cannot assign task to yourself",
            variant: "default", // ใช้สีแดงสำหรับ error
          });
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      toast({
        title: "Error",
        description: "You cannot assign task to the project owner",
        variant: "default", // ใช้สีแดงสำหรับ error
      });
    }
    setOpen(false);
  };

  const { toast } = useToast();

  return (
    <TooltipProvider>
      <div className="flex flex-row gap-1 flex-wrap">
        <div className="flex items-center space-x-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className=" border-brown text-brown">
              <Button variant="outline">
                {selectedUser.length > 0 ? (
                  // Display selected users as circles with initials
                  <div className="flex space-x-2 ">
                    {selectedUser.map((user) => (
                      <Profile
                        key={user.id}
                        userId={user.id}
                        userName={user.name}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="p-ui ">Assigned</p>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="right" align="start">
              <Command>
                <CommandInput placeholder="Search Member ..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {usersList.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.name}
                        onSelect={handleSelectUser}
                      >
                        <Circle
                          className={cn(
                            "mr-2 h-4 w-4 fill-greenLight text-greenLight ",
                            selectedUser?.length > 0 &&
                              selectedUser.some((u) => u.id === user.id)
                              ? "opacity-100"
                              : "opacity-40"
                          )}
                        />
                        <span>{user.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TooltipProvider>
  );
}
