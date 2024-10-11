'use client';

import type React from 'react';
import { useState } from 'react';
import { commentlist } from '@/atom';
import { useAtom } from 'jotai';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';

interface CommentBoxProp {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
}

function CommentBox({ id, content, taskId, authorId, createdAt }: CommentBoxProp) {
  const userId = '865';
  const [, setCommentList] = useAtom<CommentBoxProp[]>(commentlist);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const deleteComment = () => {
    setCommentList((prevComments) =>
      prevComments.filter((comment) => comment.id !== id || comment.authorId !== userId),
    );
  };

  return (
    <div className="w-[530px] h-[90px] flex-col justify-start items-start gap-[18px] inline-flex">
      <div className="self-stretch h-[244px] flex-col justify-start items-start gap-18 flex">
        <div />
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
                  {createdAt.toDateString()}
                </div>
              </div>
              <div className="relative">
                <button
                  type="button"
                  className="w-6 h-6 text-gray-600 hover:text-gray-800 justify-center items-center flex"
                  onClick={toggleDropdown}>
                  •••
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-lg border z-10">
                    <ul className="py-1 text-gray-700">
                      <li>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsDropdownOpen(false);
                          }}>
                          Edit
                        </Button>
                      </li>
                      <li>
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <Button variant="ghost">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                message from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                }}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  deleteComment();
                                }}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="self-stretch text-slate-900 text-base font-normal font-['Bai Jamjuree'] leading-7">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Typesend: React.FC = () => {
  const [comment, setComment] = useState('');
  const [list, setList] = useAtom<CommentBoxProp[]>(commentlist);

  const handleInputChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setComment(e.target.value);
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // Do something with the comment
    setList([
      ...list,
      { id: '1324', content: comment, authorId: '865', createdAt: new Date(), taskId: '' },
    ]);
    setComment(''); // Clear the input field after submission
  };

  return (
    <div className="w-[530px] h-[362px] flex-col justify-start items-start gap-[18px] inline-flex">
      <div className="max-h-84 overflow-y-scroll">
        <ul>
          {list.map((item) => (
            <li key={item.createdAt.toDateString()}>
              <CommentBox
                id={item.id}
                content={item.content}
                taskId={item.taskId}
                authorId={item.authorId}
                createdAt={item.createdAt}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col w-[530px] border-2 rounded-lg p-[10px]">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-[60px] outline-none"
            placeholder="Add your comment..."
            value={comment}
            onChange={handleInputChange}
          />
          <div className="flex justify-between items-center mt-[10px]">
            <div />
            <button
              type="submit"
              className="bg-cyan-500 text-white border-0 rounded py-[5px] px-[10px] cursor-pointer">
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
