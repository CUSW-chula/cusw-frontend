'use client';
import type React from 'react';
import { Send } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
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
import { Profile } from './profile';
import { TooltipProvider } from '@/components/ui/tooltip'; // Import TooltipProvider
import BASE_URL, { type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';

interface CommentBoxProp {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
  isDelete: boolean;
  editTime: Date | null;
}

function formatDate(date?: Date | string): string {
  if (!date) return ''; // Return an empty string if no date is provided

  // Ensure the input is a Date object
  const validDate = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(validDate.getTime())) {
    console.error('Invalid date:', date);
    return 'Invalid date';
  }

  const day = String(validDate.getDate()).padStart(2, '0');
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  const year = validDate.getFullYear();
  const hours = String(validDate.getHours()).padStart(2, '0');
  const minutes = String(validDate.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

function EditBox({
  content,
  onCancel,
  onSave,
}: {
  content: string;
  onCancel: () => void;
  onSave: (newContent: string) => void;
}) {
  const [editedContent, setEditedContent] = useState(content);
  const charLimit = 200;
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value;
    if (inputText.length <= charLimit) {
      setEditedContent(inputText);
    }
  };

  const handleSave = () => {
    if (editedContent.trim().length === 0) {
      alert('Comment cannot be empty!');
      return;
    }
    onSave(editedContent);
  };

  return (
    <div className="flex w-full items-end space-x-2">
      <Textarea
        className="resize-none outline-none bg-gray-50"
        value={editedContent}
        onChange={handleInputChange}
      />
      <span className="text-sm text-gray-500">
        {editedContent.length} / {charLimit} characters
      </span>
      <Button className="border-[#6b5c56]" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        className="bg-[#6b5c56] text-white hover:bg-[#6b5c56]"
        onClick={handleSave}
        disabled={editedContent.trim().length === 0 || editedContent === content}>
        Confirm
      </Button>
    </div>
  );
}

async function getName(authorId: string, auth: string) {
  try {
    const response = await fetch(`${BASE_URL}/users/${authorId}`, {
      headers: {
        Authorization: auth,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error('Failed to fetch user name:', error);
    return 'Unknown'; // Handle error gracefully
  }
}

function formatName(name: string) {
  const nameParts = (name ?? '').split(' ');
  return nameParts[0];
}

function CommentBox({
  id,
  content,
  taskId,
  authorId,
  createdAt,
  isDelete,
  editTime,
}: CommentBoxProp) {
  const [isEditing, setIsEditing] = useState(false);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    getName(authorId, auth).then(setName);
  }, [authorId, auth]);

  const deleteComment = async () => {
    try {
      await fetch(`${BASE_URL}/comments/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const saveEditedContent = async (newContent: string) => {
    try {
      await fetch(`${BASE_URL}/comments/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ content: newContent }),
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save comment:', error);
    }
  };

  return (
    <div className="w-[530px] h-auto flex flex-col p-1 gap-4">
      <div className="bg-gray-50 rounded-md p-3">
        {!isDelete && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Profile userId="test" userName={name ?? '?'} />
              </TooltipProvider>
              <div className="text-slate-900 font-BaiJamjuree font-semibold">
                {formatName(name ?? '') || 'Loading...'}
              </div>
              <div className="text-[#6b5c56] text-base font-normal font-['Bai Jamjuree'] leading-7">
                {editTime ? (
                  <>
                    {formatDate(editTime)} <span>(Edited)</span>
                  </>
                ) : (
                  formatDate(createdAt)
                )}
              </div>
            </div>

            {!isEditing && (
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
                  <DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" onClick={(e) => e.stopPropagation()}>
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Do you want to delete your comment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red text-white" onClick={deleteComment}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {isDelete ? (
          <div className="text-gray-500 italic">This comment was deleted</div>
        ) : isEditing ? (
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

const Comment = ({ task_id }: TaskManageMentProp) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [comment, setComment] = useState('');
  const [list, setList] = useAtom<CommentBoxProp[]>(commentlist);
  const charLimit = 200;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const pareJsonValues = useCallback((values: any[]) => {
    const newValue: CommentBoxProp[] = [];
    for (const value of values) {
      newValue.push({
        id: value.id,
        content: value.content,
        createdAt: new Date(value.createdAt),
        taskId: value.taskId,
        authorId: value.authorId,
        isDelete: value.isDelete,
        editTime: value.editTime,
      });
    }
    return newValue;
  }, []);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const pareJsonValue = useCallback((values: any) => {
    const newValue: CommentBoxProp = {
      id: values.id,
      content: values.content,
      createdAt: new Date(values.createdAt),
      taskId: values.taskId,
      authorId: values.authorId,
      isDelete: values.isDelete,
      editTime: values.editTime,
    };
    return newValue;
  }, []);

  useEffect(() => {
    const fetchComment = async () => {
      const commentData = await fetch(`${BASE_URL}/comments/${task_id}`, {
        headers: {
          Authorization: auth,
        },
      });
      const commentList = await commentData.json();
      setList(pareJsonValues(commentList));
    };
    fetchComment();

    const ws = new WebSocket('ws://161.200.199.68:3001');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);

      try {
        const socketEvent = JSON.parse(event.data); // Parse incoming message
        const eventName = socketEvent.eventName;
        const data = pareJsonValue(socketEvent.data); // Comment Data
        if (eventName === 'comment')
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          setList((prevList: any) => [...prevList, data]); // Functional update
        else if (eventName === 'comment-delete') {
          setList((prevList: CommentBoxProp[]) =>
            prevList.map((item) =>
              item.id === data.id
                ? {
                    ...item,
                    isDelete: true,
                  }
                : item,
            ),
          ); // Remove deleted comment
        } else if (eventName === 'comment-edit') {
          setList((prevList: CommentBoxProp[]) =>
            prevList.map((item) =>
              item.id === data.id
                ? {
                    ...item,
                    content: data.content,
                    editTime: new Date(),
                  }
                : item,
            ),
          );
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, [pareJsonValue, pareJsonValues, setList, task_id, auth]); // Add pareJsonValue and pareJsonValues to the dependency array

  const handleInputChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (comment.trim().length === 0) {
      alert('Comment cannot be empty!');
      return;
    }

    await fetch(`${BASE_URL}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      body: JSON.stringify({
        content: comment,
        taskId: task_id,
      }),
    });
    setComment(''); // Clear the input field after submission
  };

  return (
    <div className="w-[530px] h-[362px] flex-col justify-start items-start gap-[18px] inline-flex ">
      <div className="font-semibold font-Anuphan text-2xl">Comment</div>
      <div className="max-h-84 overflow-y-scroll">
        <ul>
          {list
            .slice() // Create a shallow copy to avoid mutating the state
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) // Sort by createdAt in descending order
            .map((item) => (
              <li key={item.id}>
                <CommentBox
                  id={item.id}
                  content={item.content}
                  taskId={item.taskId}
                  authorId={item.authorId}
                  createdAt={item.createdAt}
                  isDelete={item.isDelete}
                  editTime={item.editTime}
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
            maxLength={200}
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
