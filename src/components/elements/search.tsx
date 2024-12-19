import React from 'react';
import { Search } from 'lucide-react';
const Searchbar = () => {
  return (
    <div className="flex flex-1 min-w-[300px] rounded-[6px] border-[1px] w-full h-[40px] px-4 border-brown bg-white items-center gap-2">
      <Search className="text-brown" />
      <input
        type="text"
        placeholder="Search the project.."
        className="resize-none w-full max-w-[575px] h-[40px] outline-none placeholder-gray-300 text-sm font-BaiJamjuree bg-transparent"
      />
    </div>
  );
};

export default Searchbar;
