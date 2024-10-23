'use client';

import * as React from 'react';
import { Circle, CircleFadingPlus, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'; // Import TooltipProvider

interface UsersInterfaces {
  id: string;
  userName: string;
}

// mock data
const users: UsersInterfaces[] = [
  { id: '1', userName: 'Bunyaphon Kongthum' },
  { id: '2', userName: 'Pongsakorn Pimphongpaisarn' },
  { id: '3', userName: 'Bunyawat Naunnak' },
  { id: '4', userName: 'Siwadol Rangmart' },
  { id: '5', userName: 'Jirayu Nampaisarn' },
];

export function AssignedTaskToMember() {
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UsersInterfaces[]>([]);

  // Function to get initials from a full name
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts.map((part) => part[0]).join(''); // Take the first letter of each part
  };

  // Handle user selection and unselection
  const handleSelectUser = (value: string) => {
    const selected = users.find((user) => user.userName === value);
    if (selected) {
      setSelectedUser(
        (prev) =>
          prev.some((user) => user.id === selected.id)
            ? prev.filter((user) => user.id !== selected.id) // Unselect user if already selected
            : [...prev, selected], // Add user if not already selected
      );
    }
    setOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-row gap-1 flex-wrap">
        <div className="flex items-center space-x-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {selectedUser.length > 0 ? (
                  // Display selected users as circles with initials
                  <div className="flex space-x-2">
                    {selectedUser.map((user) => (
                      <Tooltip key={user.id}>
                        <TooltipTrigger>
                          <div className="flex items-center space-x-2">
                            {/* Circle with initials */}
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                              <span className="text-slate-900">{getInitials(user.userName)}</span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        {/* Tooltip content showing the full name */}
                        <TooltipContent>
                          <span>{user.userName}</span>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ) : (
                  <>
                    <CircleFadingPlus className="mr-2 h-4 w-4" />
                    <p className="p-ui">Assigned</p>
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
                    {users.map((user) => (
                      <CommandItem key={user.id} value={user.userName} onSelect={handleSelectUser}>
                        <Circle
                          className={cn(
                            'mr-2 h-4 w-4 fill-greenLight text-greenLight',
                            selectedUser.some((u) => u.id === user.id)
                              ? 'opacity-100'
                              : 'opacity-40',
                          )}
                        />
                        <span>{user.userName}</span>
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
