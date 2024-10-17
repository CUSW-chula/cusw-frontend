'use client';

import type React from 'react';
import { Send, Target } from 'lucide-react';
import { useState } from 'react';
import { commentlist } from '@/atom';
import { useAtom } from 'jotai';
import { Textarea } from '../ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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

function formatDate(date?: Date): string {
  if (!date) return ''; // Return an empty string if no date is provided
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

function EditBox({
  content,
  onCancel,
  onSave,
}: { content: string; onCancel: () => void; onSave: (newContent: string) => void }) {
  const [editedContent, setEditedContent] = useState(content);
  const charLimit = 200;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value;
    if (inputText.length <= charLimit) {
      setEditedContent(inputText);
    }
  };

  return (
    <div className="flex w-full items-end space-x-2">
      <Textarea
        className="resize-none outline-none bg-gray-50"
        value={editedContent}
        onChange={handleInputChange}
      />
      <span className="text-sm text-gray-500">
        {content.length} / {charLimit} characters
      </span>
      <Button className="border-[#6b5c56]" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        className="bg-[#6b5c56] text-white hover:bg-[#6b5c56]"
        onClick={() => onSave(editedContent)}>
        Confirm
      </Button>
    </div>
  );
}

function CommentBox({ id, content, taskId, authorId, createdAt }: CommentBoxProp) {
  const userId = '865';
  const [, setCommentList] = useAtom<CommentBoxProp[]>(commentlist);
  const [isEditing, setIsEditing] = useState(false);

  const deleteComment = () => {
    setCommentList((prevComments) =>
      prevComments.filter((comment) => comment.id !== id || comment.authorId !== userId),
    );
  };

  const saveEditedContent = (newContent: string) => {
    setCommentList((prevComments) =>
      prevComments.map((comment) =>
        comment.id === id ? { ...comment, content: newContent, createdAt: new Date() } : comment,
      ),
    );
    setIsEditing(false);
  };

  return (
    <div className="w-[530px] h-auto flex flex-col p-1 gap-4 ">
      <div className="bg-gray-50 rounded-md p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-900">PP</span>
            </div>
            <div className="font-semibold font-BaiJamjuree text-slate-900">Pongsakorn</div>
            <div className="text-[#6b5c56] text-base font-normal font-['Bai Jamjuree'] leading-7">
              {formatDate(createdAt)}
            </div>
          </div>
          {!isEditing && (
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="hover:text-gray-800" variant="ghost">
                    •••
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-7">
                  <DropdownMenuItem>
                    <Button variant="ghost" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  </DropdownMenuItem>

                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost">Delete</Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Do you want to delete your comment? this progress can not be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>cannel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red text-white" onClick={deleteComment}>
                            continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        {isEditing ? (
          <EditBox
            content={content}
            onCancel={() => setIsEditing(false)}
            onSave={saveEditedContent}
          />
        ) : (
          <div
            className="text-black text-base font-normal leading-7 mt-2 break-words font-BaiJamjuree max-h-20 overflow-hidden"
            style={{ wordBreak: 'break-word' }}>
            {content}
          </div>
        )}
      </div>
    </div>
  );
}

const Comment: React.FC = () => {
  const [comment, setComment] = useState('');
  const [list, setList] = useAtom<CommentBoxProp[]>(commentlist);
  const charLimit = 200;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value;
    if (inputText.length <= charLimit) {
      setComment(inputText);
    }
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (comment.trim().length === 0) {
      alert('Comment cannot be empty!');
      return;
    }
    // Do something with the comment
    setList([
      ...list,
      { id: '1324', content: comment, authorId: '865', createdAt: new Date(), taskId: '' },
    ]);
    setComment(''); // Clear the input field after submission
  };

  return (
    <div className="w-[530px] h-[500px] flex-col justify-start items-start gap-[18px] inline-flex ">
      <div className="font-semibold font-Anuphan text-2xl">Comment</div>
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
      <div className="text-black text-sm font-medium font-Bai Jamjuree leading-[14px]">
        Your Comment
      </div>
      <div className="flex flex-col w-[530px] h-[115px] border-2 border-[#6b5c56] rounded-lg p-[10px]">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-[50px] outline-none resize-none maxlength=150"
            placeholder="Add your comment..."
            value={comment}
            onChange={handleInputChange}
          />
          <div className="flex justify-between items-center mt-[10px]">
            <span className="text-sm text-gray-500">
              {comment.length} / {charLimit} characters
            </span>
            <div />
            <button
              type="submit"
              className=" text-black border-0 rounded py-[5px] px-[10px] cursor-pointer">
              <Send />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Comment;

/**
 * list comment = [];
 * comment = fetch
 * foreach(comment) => <CommentBox profile = comment[i].profile, time = comment[i].time, content = comment[i].contemt /> *
 *
 */
