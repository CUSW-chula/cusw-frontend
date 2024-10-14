'use client';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

// FileUploader component definition
const FileUploader = ({ handleFile }: { handleFile: (file: File) => void }) => {
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);
  // handleClick : to trigger the hidden file input
  const handleClick = () => {
    hiddenFileInput.current?.click();
  };
  // handleChange : to handle file selection
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileUploaded = event.target.files?.[0];
    if (fileUploaded) {
      handleFile(fileUploaded);
    }
  };
  return (
    <div className=" w-fit ">
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

const Uploadfile = () => {
  // handleFile : to handle the uploaded file
  const file_list: Array<File> = [];
  const handleFile = (file: File) => {
    file_list.push(file);
    console.log({
      person: 'constant person',
      file_uploaded: file,
      file_list,
    });
  };

  return (
    <div>
      <FileUploader handleFile={handleFile} />
    </div>
  );
};

export default Uploadfile;
