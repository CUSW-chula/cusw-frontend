'use client';

import type React from 'react';
import { useState } from 'react';
import { commentlist } from '@/atom';
import { useAtom } from 'jotai';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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

function EditBox({
  content,
  onCancel,
  onSave,
}: { content: string; onCancel: () => void; onSave: (newContent: string) => void }) {
  const [editedContent, setEditedContent] = useState(content);

  return (
    <div className="flex w-full items-center space-x-2">
      <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={() => onSave(editedContent)}>Confirm</Button>
    </div>
  );
}

function CommentBox({ id, content, taskId, authorId, createdAt }: CommentBoxProp) {
  const userId = '865';
  const [, setCommentList] = useAtom<CommentBoxProp[]>(commentlist);
  const [, setCreateAt] = useAtom<CommentBoxProp[]>(commentlist);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const deleteComment = () => {
    setCommentList((prevComments) =>
      prevComments.filter((comment) => comment.id !== id || comment.authorId !== userId),
    );
  };

  const saveEditedContent = (newContent: string) => {
    setCommentList((prevComments) =>
      prevComments.map((comment) =>
        comment.id === id ? { ...comment, content: newContent } : comment,
      ),
    );
    setCreateAt((prevCreateAt) =>
      prevCreateAt.map((createdAt) =>
        createdAt.id === id ? { ...createdAt, createdAt: new Date() } : createdAt,
      ),
    );
    setIsEditing(false);
  };

  return (
    <div className="w-[530px] h-auto flex flex-col gap-4">
      <div className="bg-gray-50 rounded-md p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-900">PP</span>
            </div>
            <div className="font-semibold text-slate-900">Pongsakorn</div>
            <div className="text-gray-600">{createdAt.toDateString()}</div>
          </div>
          <div className="relative">
            <button
              type="button"
              className="w-6 h-6 text-gray-600 hover:text-gray-800"
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
                        setIsEditing(true);
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
                            This action cannot be undone. This will permanently delete your message.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setIsDropdownOpen(false)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={deleteComment}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Content Section: Handles long text gracefully */}
        {isEditing ? (
          <EditBox
            content={content}
            onCancel={() => setIsEditing(false)}
            onSave={saveEditedContent}
          />
        ) : (
          <div
            className="mt-2 text-slate-900 break-words max-h-20 overflow-hidden"
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
export default Comment;

/**
 * list comment = [];
 * comment = fetch
 * foreach(comment) => <CommentBox profile = comment[i].profile, time = comment[i].time, content = comment[i].contemt /> *
 *
 */
