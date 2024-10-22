'use client';
import { useRef } from 'react';
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
  name: string;
  filePath: string;
  fileSize: number;
  taskId: string;
  projectId: string;
  uploadedBy: string;
  uploadedAt: Date;
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
      console.log(fileUploaded);
      console.log();
      console.log(File_list);
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
        className=""
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
  const handleFile = (file: File) => {
    const newFile: Files = {
      id: `${new Date().getTime()}`, // Unique ID
      name: file.name,
      filePath: URL.createObjectURL(file),
      fileSize: file.size,
      taskId: '1234',
      projectId: '5678',
      uploadedBy: 'Banyaphon',
      uploadedAt: new Date(),
      createdAt: new Date(file.lastModified),
    };
    setFileList((prevFiles) => [...prevFiles, newFile]);
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

const Displayfile: React.FC<DisplayfileProps> = ({ fileList, setFileList }) => {
  const handleDelete = (id: string) => {
    setFileList((prevFiles) => prevFiles.filter((file) => file.id !== id));
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
                <p>{file.name}</p>
              </div>
              <div className="flex gap-4 items-center">
                <p className="flex">Uploaded by {file.uploadedBy}</p>
                <Circle className="fill-black size-2 mx-1" />
                <p className="flex">{file.uploadedAt.toLocaleString()}</p>
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
              <Download className="m-auto mt-[4px] cursor-pointer" />
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
};

export { Uploadfile, Displayfile };
