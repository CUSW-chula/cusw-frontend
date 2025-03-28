'use client';
import React, { useEffect, useState } from 'react';
import BASE_URL from '@/lib/shared';
import { toast } from '@/hooks/use-toast';
import { getCookie } from 'cookies-next';
import { Searchbar } from '../control-bar';
import type { Template } from '@/app/types/createProjectType';
import { Button } from '@/components/ui/button';
import type { TaskProps } from '@/app/types/types';
import { Task } from '@/app/projects/create/_components/taskpreview';

const TemplateManage = () => {
  const [searchTag, setSearchTag] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<TaskProps[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/template`, {
          headers: { Authorization: auth },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          toast({
            title: `🚨 Error ${response.status}: ${response.statusText}`,
            description: `🔥 error: ${errorMessage || 'An unexpected error occurred.'}`,
            variant: 'default',
          });
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid data format');
        setTemplates(data);
      } catch (error) {
        console.error('Fetch template error:', error);
      }
    };
    fetchTag();
  }, [auth]);

  const handleTemplateSelect = async (template: Template) => {
    try {
      const response = await fetch(template.filePath);
      const data: TaskProps[] = await response.json();
      setSelectedTemplateId(template.id);
      setSelectedTasks(data);
    } catch (error) {
      console.error('Error fetching template tasks:', error);
      toast({
        title: '🚨 Error Loading Template',
        description: 'Failed to load template tasks',
        variant: 'destructive',
      });
    }
  };

   const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) return;

    try {
      const response = await fetch(`${BASE_URL}/v2/template/${selectedTemplateId}`, {
        method: 'DELETE',
        headers: { Authorization: auth },
      });

      if (!response.ok) throw new Error('Delete failed');
      
      // Update template list
      const updatedTemplates = templates.filter(t => t.id !== selectedTemplateId);
      setTemplates(updatedTemplates);
      setSelectedTemplateId(null);
      setSelectedTasks([]);
      
      toast({
        title: '✅ Success',
        description: 'Template deleted successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: '🚨 Delete Failed',
        description: 'Could not delete template',
        variant: 'destructive',
      });
    }
  };

  const handleEditTemplate = () => {
    if (!selectedTemplateId) return;
    // Add edit logic here
    toast({
      title: '✏️ Edit Template',
      description: 'Edit feature coming soon!',
      variant: 'default',
    });
  };
  return (
    <div className="font-BaiJamjuree w-full h-[690px] bg-white p-4 rounded-lg border border-brown flex gap-4">
      {/* Left Panel - Template List */}
      <div className="w-1/3 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Templates</h2>
            <p className="text-sm text-green">Select a template</p>
          </div>
          {/* <Searchbar onSearchChange={setSearchTag} placeholder="Search..." /> */}
        </div>
        <div className="overflow-y-auto flex-1">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant={selectedTemplateId === template.id ? 'default' : 'secondary'}
              className={`mb-2 w-full text-left ${
                selectedTemplateId === template.id ? 'bg-blue-600 text-white' : 'hover:bg-neutral-200'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              {template.fileName.replace('.json', '')}
            </Button>
          ))}
        </div>
      </div>

      {/* Right Panel - Task Preview */}
      <div className="w-2/3 flex flex-col border-l pl-4">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <div className="overflow-y-auto flex-1 pr-2">
          {selectedTasks.length > 0 ? (
            selectedTasks.map((item) => (
              <Task key={item.id} item={item} depth={0} hiddenDate={false} />
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 italic">Select a template to preview</p>
            </div>
          )}
        </div>
      </div>

       {/* Footer
       <div className="border-t p-4 bg-white">
        <div className="flex justify-end">
          <Button
            type="submit"
            className="px-4 py-2 bg-brown justify-center items-center flex"
            disabled={!inputs.task?.template}>
            Delete
          </Button>
        </div>
      </div> */}
    </div>
  );
};

export default TemplateManage;