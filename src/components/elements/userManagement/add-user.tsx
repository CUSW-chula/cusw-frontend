import React, { useState } from 'react';

const AddUser = () => {
  const [showPopover, setShowPopover] = useState(false);
  const [email, setEmail] = useState<string>();
  const [userName, setUserName] = useState<string>();

  function addUser(email: string, userName: string) {}
  return (
    <div className="relative">
      <button
        type="button"
        className="px-4 h-[40px] rounded-md border border-brown hover:bg-neutral-100 transition"
        onClick={() => setShowPopover(!showPopover)}>
        Add user
      </button>

      {showPopover && (
        <div className="absolute bg-white h-fit w-72 border shadow-lg p-4 right-0 mt-2 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Add User</h3>

          {/* Email Field */}
          <div className="relative">
            <input
              type="email"
              required
              className="peer w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <label
              htmlFor="Email Field"
              className="absolute left-3 top-2 text-gray-500 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
              Email
            </label>
          </div>

          {/* Name Field */}
          <div className="relative">
            <input
              type="text"
              required
              className="peer w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            />
            <label
              htmlFor="Name Field"
              className="absolute left-3 top-2 text-gray-500 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
              User Name
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
