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
        <p className="text-brown">Upload</p>
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

const Uploadfile = ({ task_id }: TaskManageMentProp) => {
  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append('taskId', task_id);
    formData.append('projectId', 'cm24w5yu000008tlglutu5czu');
    formData.append('file', file);
    formData.append('authorId', 'cm0siagz300003mbv5bsz6wty');
    const url = `${BASE_URL}/file/`;
    const options = {
      method: 'POST',
      body: formData,
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
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

const handleDelete = async (id: string) => {
  const url = `${BASE_URL}/file/`;
  const options = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId: id }),
  };

  try {
    const response = await fetch(url, options);
    await response.json();
    // setFileList((prevFiles) => prevFiles.filter((file) => file.id !== id));
  } catch (error) {
    console.error(error);
  }
};

async function getName(authorId: string) {
  try {
    const response = await fetch(`${BASE_URL}/users/${authorId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
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
          <div/>
        )}
      </ul>
    </div>
  );
};

const FileItem = ({ id, fileName, uploadedBy, filePath, fileSize, createdAt }: Files) => {
  const [name, setName] = useState('');

  useEffect(() => {
    getName(uploadedBy).then(setName);
  }, [uploadedBy]);
  return (
    <div
      className="flex items-center border-2 border-brown bg-gray-50 rounded-[6px] p-2 my-2"
      key={id}>
      <File />
      <div className="flex flex-col w-full justify-between ml-2">
        <div>
          <p>{fileName}</p>
        </div>
        <div className="flex gap-4 items-center">
          <p className="flex">Uploaded by {name || 'Loading...'}</p>
          <Circle className="fill-black size-2 mx-1" />
          <p className="flex">{formatDate(createdAt)}</p>
          <Circle className="fill-black size-2 mx-1" />
          <p className="flex">{Math.round(fileSize / 1024)} KB</p>
        </div>
      </div>
      <div className="flex-row">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <X className="m-auto mt-[-14px] mr-[-4px] size-4 cursor-pointer" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the file.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <a href={filePath}>
          <Download className="m-auto mt-[4px] cursor-pointer" />
        </a>
      </div>
    </div>
  );
};

export { Uploadfile, Displayfile };
