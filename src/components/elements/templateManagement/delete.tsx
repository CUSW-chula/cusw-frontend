import type React from 'react';
import BASE_URL from '@/lib/shared';
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
import type { Template } from '@/app/types/createProjectType';
import { Button } from '@/components/ui/button';

interface ManageProps {
  template?: Template; // ทำให้เป็น optional
}

const DeleteTemplate: React.FC<ManageProps> = ({ template }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  const handleDelete = async () => {
    if (!template) return;

    try {
      const response = await fetch(`${BASE_URL}/v2/template`, {
        // ลบ / ท้าย URL
        method: 'DELETE',
        headers: {
          Authorization: auth, // ใช้ token จริง
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId: template.id }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        toast({
          title: `🚨 Error ${response.status}`,
          description: errorMessage || 'Failed to delete template',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '🗑️ Template Deleted',
        description: `"${template.fileName}" has been deleted successfully`,
        variant: 'default',
      });

      // รีเฟรชหน้าหลังจากลบสำเร็จ
      window.location.reload();
    } catch (error) {
      console.error('Deletion error:', error);
      toast({
        title: '🚨 Deletion Failed',
        description: 'Please check your network connection',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="px-4 py-2 bg-rose-500 hover:bg-rose-700 text-white flex gap-2"
          disabled={!template}>
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the "{template?.fileName}" template.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-rose-500 hover:bg-rose-700">
            Confirm Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTemplate;
