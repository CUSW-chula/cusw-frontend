import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import BASE_URL from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { Plus } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

const Create = () => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [showPopover, setShowPopover] = useState(false);
  const [name, setName] = useState<string>();
  const [isProject, setIsProject] = useState<boolean>(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);

  const addTag = async (name: string, isProject: boolean) => {
    try {
      const response = await fetch(`${BASE_URL}/v2/tags/`, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          isProject: isProject,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
      }
      if (response.ok)
        toast({
          title: `➕ Created tag: ${name}`,
          description: `
                  The tag "${name}" has been successfully created.
                `,
          variant: 'default',
        });

      setShowPopover(false);
      setName('');
      setIsProject(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex justify-center items-center gap-1 px-4 h-[40px] min-w-[100px] rounded-md border border-brown hover:bg-neutral-100 transition"
        onClick={() => setShowPopover(!showPopover)}>
        <Plus />
        Add tag
      </button>

      {showPopover && (
        <div
          ref={popoverRef}
          className="absolute bg-white h-fit w-72 border shadow-lg p-4 right-0 mt-2 rounded-lg space-y-4 z-50">
          <h3 className="text-lg font-semibold text-gray-700">Add tag</h3>

          {/* Name Field */}
          <div className="relative">
            <input
              required
              className="peer w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <label
              htmlFor="Name Field"
              className="absolute left-3 top-[-8px] bg-white px-1 text-black text-[10px]">
              Tag name <span className="text-red">*</span>
            </label>
          </div>

          {/* isProject Field */}
          <div className="relative flex items-center gap-2">
            <p className="px-1 text-black text-[14px]">isProject:</p>
            <select
              onChange={(e) => setIsProject((e.target as HTMLSelectElement).value === 'project')}>
              <option value="task">Task</option>
              <option value="project">Project</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            className="w-full bg-brown text-white py-2 rounded-md hover:bg-brown-700 transition"
            onClick={() => name && addTag(name, isProject)}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default Create;
