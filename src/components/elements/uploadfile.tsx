'use client';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

const Uploadfile = () => {
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
          className="bg-white border-brown rounded-[6px] border-[2px] gap-2 text-brown"
          variant="outline"
          onClick={handleClick}>
          <UploadCloud />
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
  // handleFile : to handle the uploaded file
  const handleFile = (file: File) => {
    console.log('File uploaded:', file);
  };

  return (
    <div>
      <FileUploader handleFile={handleFile} />
    </div>
  );
};

export default Uploadfile;
