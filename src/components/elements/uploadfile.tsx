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

interface UploadfileProps {
  setFileList: React.Dispatch<React.SetStateAction<Files[]>>;
}

const Uploadfile: React.FC<UploadfileProps> = ({ setFileList }) => {
  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append('taskId', 'cm24lq0sx0001jkpdbc9lxu8x');
    formData.append('projectId', 'cm24w5yu000008tlglutu5czu');
    formData.append('file', file);
    formData.append('authorId', 'cm0siagz300003mbv5bsz6wty');
    const url = 'http://localhost:4000/api/file/';
    const options = {
      method: 'POST',
      body: formData,
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      setFileList((prevFiles) => [...prevFiles, data]);
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

async function getName(authorId: string) {
  try {
    const response = await fetch(`http://localhost:4000/api/users/${authorId}`);
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

const Displayfile: React.FC<DisplayfileProps> = ({ fileList, setFileList }) => {
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchNames = async () => {
      const namesArray = await Promise.all(
        fileList.map(async (file) => {
          if (!userNames[file.uploadedBy]) {
            const name = await getName(file.uploadedBy);
            return { [file.uploadedBy]: name };
          }
          return {}; // Return an empty object instead of null if name is already fetched
        }),
      );

      setUserNames((prevNames) =>
        namesArray.reduce(
          // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
          (acc, nameObj) => ({ ...acc, ...nameObj }),
          { ...prevNames }, // Use the existing state as the initial accumulator value
        ),
      );
    };

    fetchNames();
  }, [fileList, userNames]);

  const handleDelete = async (id: string) => {
    const url = 'http://localhost:4000/api/file/';
    const options = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId: id }),
    };

    try {
      const response = await fetch(url, options);
      await response.json();
      setFileList((prevFiles) => prevFiles.filter((file) => file.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-8">
      <ul>
        {fileList.map((file) => (
          <div
            className="flex items-center border-2 border-brown bg-gray-50 rounded-[6px] p-2 my-2"
            key={file.id}>
            <File />
            <div className="flex flex-col w-full justify-between ml-2">
              <div>
                <p>{file.fileName}</p>
              </div>
              <div className="flex gap-4 items-center">
                <p className="flex">Uploaded by {userNames[file.uploadedBy] || 'Loading...'}</p>
                <Circle className="fill-black size-2 mx-1" />
                <p className="flex">{file.createdAt.toLocaleString()}</p>
                <Circle className="fill-black size-2 mx-1" />
                <p className="flex">{Math.round(file.fileSize / 1024)} KB</p>
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
                    <AlertDialogAction onClick={() => handleDelete(file.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <a href={file.filePath}>
                <Download className="m-auto mt-[4px] cursor-pointer" />
              </a>
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
};

export { Uploadfile, Displayfile };
