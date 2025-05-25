'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, File, Circle, Download, X } from 'lucide-react';
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
import BASE_URL, { type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import type { TaskProps } from '@/app/types/types';
import { toast } from '@/hooks/use-toast';

interface Files {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  taskId: string;
  projectId: string;
  uploadedBy: string;
  createdAt: Date;
}
const File_list: Array<File> = [];

const FileUploader = ({ handleFile }: { handleFile: (file: File) => void }) => {
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileUploaded = event.target.files?.[0];
    if (fileUploaded) {
      handleFile(fileUploaded);
      File_list.push(fileUploaded);
    }
  };

  return (
    <div className="w-fit">
      <Button
        className="bg-white border-brown rounded-[6px] border-[1px] gap-2 "
        variant="outline"
        onClick={handleClick}>
        <UploadCloud className="text-brown" />
        <span className="text-brown text-sm">Upload</span>
      </Button>
      <input
        type="file"
        onChange={handleChange}
        ref={hiddenFileInput}
        style={{ display: 'none' }}
      />
    </div>
  );
};

function formatDate(_date: Date): string {
  const date = new Date(_date);
  if (!date) return ''; // Return an empty string if no date is provided
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

const Uploadfile = ({ task }: { task: TaskProps }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${BASE_URL}/v2/file/${task.id}`;
    const options = {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: auth,
      },
    };

    try {
      const response = await fetch(url, options);
      await response.json();
      if (!response.ok) {
        const errorMessage = await response.text();
        toast({
          title: `🚨 Error ${response.status}: ${response.statusText}`,
          description: `
      🔥 error: ${errorMessage || 'An unexpected error occurred.'}
      
      🗂️ file: uploadfile.tsx
          `,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <FileUploader handleFile={handleFile} />
    </div>
  );
};

interface DisplayfileProps {
  fileList: Files[];
  setFileList: React.Dispatch<React.SetStateAction<Files[]>>;
}

const handleDelete = async (taskId: string, id: string, auth: string) => {
  const url = `${BASE_URL}/v2/file/${taskId}`;
  const options = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify({ fileId: id }),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorMessage = await response.text();
      toast({
        title: `🚨 Error ${response.status}: ${response.statusText}`,
        description: `
    🔥 error: ${errorMessage || 'An unexpected error occurred.'}
    
    🗂️ file: uploadfile.tsx
        `,
        variant: 'default',
      });
    }
    await response.json();
    // setFileList((prevFiles) => prevFiles.filter((file) => file.id !== id));
  } catch (error) {
    console.error(error);
  }
};

async function getName(authorId: string, auth: string) {
  try {
    const response = await fetch(`${BASE_URL}/v2/users/${authorId}`, {
      headers: {
        Authorization: auth,
      },
    });
    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error('Failed to fetch user name:', error);
    return 'Unknown';
  }
}

const Displayfile: React.FC<DisplayfileProps> = ({ fileList }) => {
  return (
    <div className="mt-8">
      <ul>
        {Array.isArray(fileList) && fileList.length > 0 ? (
          fileList.map((file) => (
            <FileItem
              key={file.id}
              createdAt={file.createdAt}
              fileName={file.fileName}
              filePath={file.filePath}
              fileSize={file.fileSize}
              uploadedBy={file.uploadedBy}
              id={file.id}
              projectId={file.projectId}
              taskId={file.taskId}
            />
          ))
        ) : (
          <div />
        )}
      </ul>
    </div>
  );
};

const FileItem = ({ id, fileName, uploadedBy, filePath, fileSize, createdAt, taskId }: Files) => {
  const [name, setName] = useState('');
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  useEffect(() => {
    if (uploadedBy) {
      getName(uploadedBy, auth).then((fetchedName) => {
        setName(fetchedName || 'Unknown');
      });
    }
  }, [uploadedBy, auth]);

  return (
    <div className="flex items-center justify-between border-2 border-brown bg-gray-50 rounded-[6px] p-3 my-2 gap-4">
      <div className="flex items-center flex-1 min-w-0">
        <File className="flex-shrink-0 text-brown" />
        <a
          href={filePath}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0 ml-3">
          <div className="flex flex-col min-w-0">
            <p className="font-medium truncate">{fileName}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span>Uploaded by {name || 'Loading...'}</span>
              <Circle className="fill-black size-2 mx-1" />
              <span>{formatDate(createdAt)}</span>
              <Circle className="fill-black size-2 mx-1" />
              <span>{Math.round(fileSize / 1024)} KB</span>
            </div>
          </div>
        </a>
      </div>

      {/* Delete button aligned to right with better spacing */}
      <div className="flex-shrink-0 ml-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button" className="p-1 hover:bg-gray-200 rounded-full transition-colors">
              <X className="size-5 text-gray-600 hover:text-red-600" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The file will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleDelete(taskId, id, auth)}>
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export { Uploadfile, Displayfile };
