import { toast } from '@/hooks/use-toast';
import { getCookie } from 'cookies-next';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';

const AddUser = () => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [showPopover, setShowPopover] = useState(false);
  const [email, setEmail] = useState<string>();
  const [userName, setUserName] = useState<string>();

  const addUser = async (email: string, userName: string) => {
    try {
      const response = await fetch('http://localhost:4000/api/v2/users/', {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: userName, email }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        toast({
          title: `🚨 Error ${response.status}: ${response.statusText}`,
          description: `🔥 error: ${errorMessage || 'An unexpected error occurred.'}🗂️ file: add-user.tsx`,
          variant: 'default',
        });
      }

      alert('User added successfully!');
      setShowPopover(false);
      setEmail('');
      setUserName('');
    } catch (error) {
      console.error('Failed to add user:', error);
      alert('Failed to add user. Check console for details.');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex justify-center items-center gap-1 px-4 h-[40px] min-w-[100px] rounded-md border border-brown hover:bg-neutral-100 transition"
        onClick={() => setShowPopover(!showPopover)}>
        <Plus />
        Add user
      </button>

      {showPopover && (
        <div className="absolute bg-white h-fit w-72 border shadow-lg p-4 right-0 mt-2 rounded-lg space-y-4 z-50">
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

          {/* Submit Button */}
          <button
            type="button"
            className="w-full bg-brown text-white py-2 rounded-md hover:bg-brown-700 transition"
            onClick={() => email && userName && addUser(email, userName)}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
