import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  createLabel?: string;
}

export function AutocompleteWithCreate({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  createLabel = 'Create',
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Check if the current search term is not in the options
  const shouldShowCreateOption =
    searchTerm.length > 0 &&
    !options.some((option) => option.toLowerCase() === searchTerm.toLowerCase());

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
    setSearchTerm('');
  };

  const handleCreate = () => {
    if (searchTerm.trim()) {
      onChange(searchTerm);
      setOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="col-span-3 justify-between font-normal pl-3 pr-3">
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command className="w-full">
          <CommandInput
            placeholder="Search or create..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {shouldShowCreateOption && (
              <CommandGroup>
                <CommandItem value={searchTerm} onSelect={handleCreate} className="text-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  {createLabel} "{searchTerm}"
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem key={option} value={option} onSelect={handleSelect}>
                  <Check
                    className={cn('mr-2 h-4 w-4', value === option ? 'opacity-100' : 'opacity-0')}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
