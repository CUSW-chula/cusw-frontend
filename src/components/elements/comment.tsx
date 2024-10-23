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
        onClick={() => onSave(editedContent)}>
        Confirm
      </Button>
    </div>
  );
}

async function getName(authorId: string) {
  try {
    const response = await fetch(`http://localhost:4000/api/users/${authorId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.name; // Assuming the API response has a 'name' field
  } catch (error) {
    console.error('Failed to fetch user name:', error);
    return 'Unknown'; // Handle error gracefully
  }
}

function CommentBox({ id, content, taskId, authorId, createdAt }: CommentBoxProp) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the author's name once when the component mounts
    getName(authorId).then(setName);
  }, [authorId]);

  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts.map((part) => part[0]).join('');
  };

  const deleteComment = () => {
    fetch('http://localhost:4000/api/comments/', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, authorId }),
    });
  };

  const saveEditedContent = (newContent: string) => {
    fetch('http://localhost:4000/api/comments/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, authorId, content: newContent }),
    });
    setIsEditing(false);
  };

  return (
    <div className="w-[530px] h-auto flex flex-col p-1 gap-4">
      <div className="bg-gray-50 rounded-md p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-900">{name ? getInitials(name) : '?'}</span>
            </div>
            <div className="font-semibold font-BaiJamjuree text-slate-900">
              {name || 'Loading...'}
            </div>
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
                            Do you want to delete your comment? This progress cannot be undone.
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

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const pareJsonValues = useCallback((values: any[]) => {
    const newValue: CommentBoxProp[] = [];
    console.log('VAL', values);
    for (const value of values) {
      newValue.push({
        id: value.id,
        content: value.content,
        createdAt: new Date(value.createdAt),
        taskId: value.taskId,
        authorId: value.authorId,
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
    };
    return newValue;
  }, []);

  useEffect(() => {
    const fetchComment = async () => {
      const commentData = await fetch(
        'http://localhost:4000/api/comments/cm24lq0sx0001jkpdbc9lxu8x',
      );
      const commentList = await commentData.json();
      setList(pareJsonValues(commentList));
    };

    fetchComment();

    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);

      try {
        const socketEvent = JSON.parse(event.data); // Parse incoming message
        console.log(socketEvent);
        const eventName = socketEvent.eventName;
        const data = pareJsonValue(socketEvent.data); // Comment Data
        if (eventName === 'comment')
          setList((prevList) => [...prevList, data]); // Functional update
        else if (eventName === 'comment-delete') {
          setList((prevList) => prevList.filter((item) => item.id !== data.id)); // Remove deleted comment
        } else if (eventName === 'comment-edit') {
          setList((prevList) =>
            prevList.map((item) =>
              item.id === data.id ? { ...item, content: data.content } : item,
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
  }, [pareJsonValue, pareJsonValues, setList]); // Add pareJsonValue and pareJsonValues to the dependency array

  const handleInputChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // // Do something with the comment
    // setList([
    //   ...list,
    //   { id: '1324', content: comment, authorId: '865', createdAt: new Date(), taskId: '' },
    // ]);
    await fetch('http://localhost:4000/api/comments/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: comment,
        authorId: 'cm24ll4370008kh59coznldal',
        taskId: 'cm24lq0sx0001jkpdbc9lxu8x',
      }),
    });
    setComment(''); // Clear the input field after submission
  };

  return (
    <div className="w-[530px] h-[362px] flex-col justify-start items-start gap-[18px] inline-flex ">
      <div className="font-semibold font-Anuphan text-2xl">Comment</div>
      <div className="max-h-84 overflow-y-scroll">
        <ul>
          {list.map((item) => (
            <li key={item.id}>
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
