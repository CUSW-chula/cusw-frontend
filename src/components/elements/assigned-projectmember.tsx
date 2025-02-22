"use client";

import * as React from "react";
import { Circle } from "lucide-react";

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
import BASE_URL, { BASE_SOCKET, type Project } from "@/lib/shared";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

interface UsersInterfaces {
  id: string;
  name: string;
  email: string;
}

export function AssignedProjectMember({ project }: { project: Project }) {
  const auth = useAuth();
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
    const fetchUsers = async () => {
      const usersData = await fetch(`${BASE_URL}/v2/users`, {
        headers: {
          Authorization: auth,
        },
      });
      if (!usersData.ok) {
        const errorMessage = await usersData.text();
        toast({
          title: `🚨 Error ${usersData.status}: ${usersData.statusText}`,
          description: `
              🔥 error: ${errorMessage || "An unexpected error occurred."}
              
              🗂️ file: assigned-projectmember.tsx
                  `,
          variant: "default",
        });
      }
      const userList = await usersData.json();
      setUsersList(userList);
    };
    fetchUsers();
    setSelectedUser(project.members);

    const fetchOwner = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${project.id}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          toast({
            title: `🚨 Error ${response.status}: ${response.statusText}`,
            description: `
        🔥 error: ${errorMessage || "An unexpected error occurred."}
        
        🗂️ file: assigned-projectmember.tsx
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
        if (eventName === `assigned:${project.id}`) {
          const data = pareJsonValue(socketEvent.data);
          setSelectedUser((prevList) =>
            Array.isArray(prevList) ? [...prevList, data] : []
          );
        }
        if (eventName === `unassigned:${project.id}`) {
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
  }, [pareJsonValue, auth, project]);

  // Handle user selection and unselection
  const handleSelectUser = async (value: string) => {
    const selected = usersList.find((user) => user.name === value);
    if (selected && !owner.some((o) => o.id === selected.id)) {
      const isAlreadySelected = selectedUser.some(
        (user) => user.id === selected.id
      );

      const url = `${BASE_URL}/v2/projects/assign/${project.id}`; // Assign or unassign user

      const options = {
        method: isAlreadySelected ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: auth },
        body: JSON.stringify({ projectId: project.id, userId: selected.id }),
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorMessage = await response.text();
          toast({
            title: `🚨 Error ${response.status}: ${response.statusText}`,
            description: `
        🔥 error: ${errorMessage || "An unexpected error occurred."}
        
        🗂️ file: assigned-projectmember.tsx
            `,
            variant: "default",
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    setOpen(false);
  };

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
