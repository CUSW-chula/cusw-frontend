import { toast } from '@/hooks/use-toast';
import BASE_URL from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const AddUser = () => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [showPopover, setShowPopover] = useState(false);
  const [email, setEmail] = useState<string>();
  const [userName, setUserName] = useState<string>();
  const [organization, setOrganization] = useState<string>();
  const [position, setPosition] = useState<string>();
  const [isOutsource, setIsOutsource] = useState<boolean>(false);

  const addUser = async (
    email: string,
    userName: string,
    organization: string,
    position: string,
    isOutsource: boolean,
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/v2/users/`, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          email,
          organization,
          position,
          isOutsource,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', response.status);
        if (response.status === 422) {
          alert('Invalid email format. Check console for details.');
          return;
        }
        throw new Error(`${response.status} ${errorData}`);
      }

      alert('User added successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Failed to add user:', error);
      alert('Failed to add user. Check console for details.');
    }
  };

  return (
    <div>
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger
          type="button"
          className="flex justify-center items-center gap-1 px-4 h-[40px] min-w-[100px] rounded-md border border-brown hover:bg-neutral-100 transition"
          onClick={() => setShowPopover(!showPopover)}>
          <Plus />
          Add user
        </PopoverTrigger>

        <PopoverContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}>
            <div className="bg-white h-fit space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Add User</h3>

              {/* Email Field */}
              <div className="relative">
                <input
                  type="email"
                  required
                  className="peer w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
                <label
                  htmlFor="Email Field"
                  className="absolute left-3 top-[-8px] bg-white px-1 text-black text-[10px]">
                  Email <span className="text-red">*</span>
                </label>
              </div>

              {/* Name Field */}
              <div className="relative">
                <input
                  type="text"
                  required
                  className="peer w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  onChange={(e) => {
                    setUserName(e.target.value);
                  }}
                />
                <label
                  htmlFor="Name Field"
                  className="absolute left-3 top-[-8px] bg-white px-1 text-black text-[10px]">
                  User Name<span className="text-red">*</span>
                </label>
              </div>

              {/* Organization Field */}
              <div className="relative">
                <input
                  type="text"
                  required
                  className="peer w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  onChange={(e) => {
                    setOrganization(e.target.value);
                  }}
                />
                <label
                  htmlFor="Organization Field"
                  className="absolute left-3 top-[-8px] bg-white px-1 text-black text-[10px]">
                  Organization <span className="text-red">*</span>
                </label>
              </div>

              {/* Position Field */}
              <div className="relative">
                <input
                  type="text"
                  required
                  className="peer w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  onChange={(e) => {
                    setPosition(e.target.value);
                  }}
                />
                <label
                  htmlFor="Position Field"
                  className="absolute left-3 top-[-8px] bg-white px-1 text-black text-[10px]">
                  Position <span className="text-red">*</span>
                </label>
              </div>

              {/* Outsourced Checkbox */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isOutsource}
                  onCheckedChange={(checked) => setIsOutsource(checked)}
                  className="h-6 w-11 bg-brown rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-brown-500"
                />
                <div className="text-sm text-gray-700">Outsourced</div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-brown text-white py-2 rounded-md hover:bg-brown-700 transition"
                onClick={() =>
                  email &&
                  userName &&
                  organization &&
                  position &&
                  addUser(email, userName, organization, position, isOutsource)
                }>
                Submit
              </button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AddUser;
