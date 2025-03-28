import type React from 'react';
import { useEffect, useState } from 'react';
import BASE_URL, { type Tag } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
interface ManageProps {
  tag: Tag;
}
const FormSchema = z.object({
  tag: z.string(),
});

const Rename: React.FC<ManageProps> = ({ tag }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [name, setName] = useState<string>(tag.name);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tag: tag.name,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const tagid = tag.id;
    const url = `${BASE_URL}/v2/tags/${tagid}`;
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        name: data.tag,
        isProject: tag.isProject,
      }),
    };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorMessage = await response.text();
        toast({
          title: `🚨 Error ${response.status}: ${response.statusText}`,
          description: `🔥 error: ${errorMessage || 'An unexpected error occurred.'}🗂️ file: manage.tsx`,
          variant: 'default',
        });
      } else if (response.ok) {
        toast({
          title: `🛠️ Edited tag name: ${tag.name}`,
          description: `The tag "${tag.name}" has been successfully edited.`,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem className="w-[400px]">
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="bg-brown">
            Rename
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Rename;
