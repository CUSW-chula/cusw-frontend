'use client';
import type React from 'react';
import { Send } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Profile, Profile2 } from './profile';
import { TooltipProvider } from '@/components/ui/tooltip'; // Import TooltipProvider
import BASE_URL, { BASE_SOCKET, type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';

interface CommentBoxProp {
  id: string;
  content: string;
  taskId: string;
  name: string;
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
    <div className="flex w-full flex-col items-end space-x-2 gap-[8px]">
      <Textarea
        className="resize-none outline-none bg-gray-50"
        value={editedContent}
        onChange={handleInputChange}
      />
      <div className="flex items-center gap-2">
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
    </div>
  );
}


function formatName(name: string) {
  const nameParts = (name ?? '').split(' ');
  return nameParts[0];
}

function CommentBox({
  id,
  content,
  taskId,
  name,
  createdAt,
  isDelete,
  editTime,
}: CommentBoxProp) {
  const [isEditing, setIsEditing] = useState(false);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';



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
        body: JSON.stringify({ id: id, content: newContent }),
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save comment:', error);
    }
  };

  return (
    <div className="h-auto w-full min-w-full flex flex-col p-1 gap-4">
      <div className="bg-gray-50 rounded-md p-3 w-full">
        {!isDelete && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 mb-2">
              <TooltipProvider>
                <Profile2 userId="test" userName={name ?? '?'} />
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

  const commentsEndRef = useRef<HTMLDivElement | null>(null); // Reference for the bottom of the comment list

  // Scroll to the bottom of the comment list
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }); // Run when the list updates

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValues = useCallback((values: any[]) => {
    return values.map((value) => ({
      id: value.id,
      content: value.content,
      createdAt: new Date(value.createdAt),
      taskId: value.taskId,
      name: value.author.name,
      isDelete: value.isDelete,
      editTime: value.editTime,
    }));
  }, []);

  const parseJsonValue = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (value: any) => ({
      id: value.id,
      content: value.content,
      createdAt: new Date(value.createdAt),
      taskId: value.taskId,
      name: value.author.name,
      isDelete: value.isDelete,
      editTime: value.editTime,
    }),
    [],
  );

  useEffect(() => {
    const fetchComment = async () => {
      const commentData = await fetch(`${BASE_URL}/v2/comments/${task_id}`, {
        headers: {
          Authorization: auth,
        },
      });
      const commentList = await commentData.json();
      setList(parseJsonValues(commentList));
    };
    fetchComment();

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);

      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const data = parseJsonValue(socketEvent.data);

        if (eventName === 'comment') {
          setList((prevList) => [...prevList, data]);
        } else if (eventName === 'comment-delete') {
          setList((prevList) =>
            prevList.map((item) => (item.id === data.id ? { ...item, isDelete: true } : item)),
          );
        } else if (eventName === 'comment-edit') {
          setList((prevList) =>
            prevList.map((item) =>
              item.id === data.id ? { ...item, content: data.content, editTime: new Date() } : item,
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
  }, [parseJsonValue, parseJsonValues, setList, task_id, auth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    setComment('');
  };

  return (
    <div className="w-full max-h-[550px] flex-col min-w-full justify-start items-start gap-[18px] inline-flex ">
      <div className="font-semibold font-Anuphan text-2xl">Comment</div>
      <div className="max-h-84 overflow-y-scroll w-full min-w-full">
        <ul>
          {list
            .slice()
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((item) => (
              <li key={item.id}>
                <CommentBox
                  id={item.id}
                  content={item.content}
                  taskId={item.taskId}
                  name={item.name}
                  createdAt={item.createdAt}
                  isDelete={item.isDelete}
                  editTime={item.editTime}
                />
              </li>
            ))}
          <div ref={commentsEndRef} /> {/* Empty div to anchor scroll to bottom */}
        </ul>
      </div>
      <div className="text-black text-sm font-medium font-Bai Jamjuree leading-[14px]">
        Your Comment
      </div>
      <div className="flex flex-col w-full h-[115px] border-[1px] border-[#6b5c56] rounded-lg p-[10px]">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-[50px] outline-none resize-none"
            placeholder="Add your comment..."
            value={comment}
            maxLength={200}
            onChange={handleInputChange}
          />
          <div className="flex justify-between items-center mt-[10px]">
            <span className="text-sm text-gray-500">
              {comment.length} / {charLimit} characters
            </span>
            <button
              type="submit"
              className="text-black border-0 rounded py-[5px] px-[10px] cursor-pointer">
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
