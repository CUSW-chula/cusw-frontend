"use client";

import { Trash2 } from "lucide-react";
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
} from "../ui/alert-dialog";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";

interface DeleteTaskProps {
  task_id: string;
}

export const DeleteTask: React.FC<DeleteTaskProps> = ({ task_id }) => {
  const router = useRouter();
  const cookie = getCookie("auth");
  const auth = cookie?.toString() ?? "";
  const handleDeleteTask = async () => {
    const url = `http://localhost:4000/api/tasks/${task_id}`;
    const options = { method: "DELETE", headers: { Authorization: auth } };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(data);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
    console.log("Delete Task: " + task_id);
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="h-9 w-36 px-2 py-1.5 bg-red-300 rounded-md border bg-[#FCA5A5] border-brown justify-start items-start gap-[13px] inline-flex">
          <Trash2 className="w-6 h-6" />
          <div className="text-base font-normal font-BaiJamjuree">
            Delete Task
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteTask} className="bg-red">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
