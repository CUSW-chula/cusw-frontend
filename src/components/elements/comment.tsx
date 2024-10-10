'use client';

import type React from 'react';
import { useState, useEffect } from 'react';

interface CommentBoxProp {
  comment:string;
}

function CommentBox({comment}:CommentBoxProp) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
    <div className="w-[530px] h-[90px] flex-col justify-start items-start gap-[18px] inline-flex">
    <div className="self-stretch h-[244px] flex-col justify-start items-start gap-18 flex">
    <div/>
      <div className="self-stretch h-[200px] flex-col justify-start items-start gap-2 flex"> 
        <div className="h-24 px-3 w-full py-1 bg-gray-50 rounded-md flex-col justify-start items-start gap-2 flex">
          <div className="self-stretch h-[52px] justify-between items-center inline-flex">
            <div className="justify-start items-center gap-2 flex">
              <div className="w-10 h-10 relative">
                <div className="w-10 h-10 left-0 top-0 absolute bg-slate-200 rounded-full" />
                <div className="left-[10px] top-[8px] absolute text-center text-slate-900 text-base font-normal font-['Inter'] leading-7">
                  PP
                </div>
              </div>
              <div className="text-slate-900 text-base font-semibold font-['Bai Jamjuree'] leading-7">
                Pongsakorn
              </div>
              <div className="text-gray-600 text-base font-normal font-['Bai Jamjuree'] leading-7">
                5 min ago
              </div>
            </div>
            <div className="relative">
              <button
              type='button'
                className="w-6 h-6 text-gray-600 hover:text-gray-800 justify-center items-center flex"
                onClick={toggleDropdown}>
                •••
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-lg border z-10">
                  <ul className="py-1 text-gray-700">
                    <li>
                      <button
                      type='button'
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          alert("Edit clicked");
                        }}>
                        Edit
                      </button>
                    </li>
                    <li>
                      <button
                      type='button'
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          alert("Delete clicked");
                        }}>
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="self-stretch text-slate-900 text-base font-normal font-['Bai Jamjuree'] leading-7">
            {comment}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

const Typesend: React.FC = () => {
  const [comment, setComment] = useState('');
  const [list, setList] = useState<string[]>([]);
  
  const handleInputChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setComment(e.target.value);
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // Do something with the comment
    setList([...list,comment])
    setComment(''); // Clear the input field after submission
  };

  return (
    <div className="w-[530px] h-[362px] flex-col justify-start items-start gap-[18px] inline-flex">
      <div className='max-h-64 overflow-y-scroll'>
      <ul>
        {list.map((item) => (
          <li key={item}>
            <CommentBox comment={item} />
          </li>
        ))}
      </ul>
      </div>
      <div className='flex flex-col w-[530px] border-2 rounded-lg p-[10px]'>
        <form onSubmit={handleSubmit}>
          <textarea className='w-full h-[60px] outline-none'
            placeholder="Add your comment..."
            value={comment}
            onChange={handleInputChange}
          />
          <div className='flex justify-between items-center mt-[10px]'>
            <div />
            <button
              type="submit"
              className='bg-cyan-500 text-white border-0 rounded py-[5px] px-[10px] cursor-pointer'>
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Typesend;

/**
 * list comment = [];
 * comment = fetch
 * foreach(comment) => <CommentBox profile = comment[i].profile, time = comment[i].time, content = comment[i].contemt /> *
 *
 */
