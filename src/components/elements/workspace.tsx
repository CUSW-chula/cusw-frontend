import { useState } from 'react';
import { Displayfile, Uploadfile } from './uploadfile';
import Emoji from './emoji';

// Ensure the Files interface matches what you're using in Uploadfile and Displayfile
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

const Workspace = () => {
  // Change fileList type to Files[] instead of File[]
  const [fileList, setFileList] = useState<Files[]>([]);

  return (
    <div className="">
      <h2>Workspace</h2>
      <Displayfile fileList={fileList} setFileList={setFileList} />
      <div className="flex justify-between">
        <Emoji />
        <Uploadfile setFileList={setFileList} />
      </div>
    </div>
  );
};

export default Workspace;
