import type React from 'react';
import BASE_URL, { type Tag } from '@/lib/shared';
import { Trash2 } from 'lucide-react';
import { getCookie } from 'cookies-next';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';

interface ManageProps {
  tag: Tag;
}
const Delete: React.FC<ManageProps> = ({ tag }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const handleDelete = async () => {
    const url = `${BASE_URL}/v2/tags/${tag.id}`;
    const options = { method: 'DELETE', headers: { Authorization: auth } };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorMessage = await response.text();
       toast({
          title: `❌ Failed to delete tag: ${tag.name}`,
          description:  'Unable to delete this tag. It might be currently in use. Please check and try again.',
          variant: 'default',
        });
        return;
      }
      if (response.ok) window.location.reload();
      toast({
        title: `🗑️ Deleted: ${tag.name}`,
        description: `
            The tag "${tag.name}" has been successfully deleted.
          `,
        variant: 'default',
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="h-9 w-45 px-2 py-1.5 bg-red-300 rounded-md border bg-white border-red justify-start items-start gap-[13px] inline-flex hover:bg-red group">
          <Trash2 className="w-6 h-6 text-red group-hover:text-white" />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently this tag from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Delete;
