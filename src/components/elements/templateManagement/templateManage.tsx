'use client';
import React, { useEffect, useState } from 'react';
import BASE_URL from '@/lib/shared';
import { toast } from '@/hooks/use-toast';
import { getCookie } from 'cookies-next';
import type { Template } from '@/app/types/createProjectType';
import { Button } from '@/components/ui/button';
import type { TaskProps } from '@/app/types/types';
import { Task } from '@/app/projects/create/_components/taskpreview';
import DeleteTemplate from './delete';
import { EditTemplate } from './rename';
import { Searchbar } from '../control-bar';

const TemplateManage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<TaskProps[]>([]);
  const [searchTemplate, setSearchTemplate] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/template/`, {
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
    fetchTemplate();
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

  const filteredTemplate = templates
    .filter((temp) => temp.fileName.toLowerCase().includes(searchTemplate.toLowerCase()))
    .sort((a, b) => a.fileName.localeCompare(b.fileName));

  return (
    <div className="font-BaiJamjuree w-full h-[690px] bg-white p-4 rounded-lg border border-brown flex gap-4 flex-col  justify-between">
      <div className="flex w-full flex-1 min-h-0 p-6">
        {/* Left Panel - Template List */}
        <div className="w-1/3 flex flex-col border-r pr-4 overflow-hidden">
          <div className="gap-3 w-full space-y-2 mb-4 ">
            <h2 className="text-xl font-semibold">Templates</h2>
            <p className="text-sm text-green">Select a template</p>
            <Searchbar onSearchChange={setSearchTemplate} placeholder="Search template..." />
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredTemplate.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplateId === template.id ? 'default' : 'secondary'}
                className="mb-2 w-full text-left"
                onClick={() => handleTemplateSelect(template)}>
                {template.fileName.replace('.json', '')}
              </Button>
            ))}
          </div>
        </div>

        {/* Right Panel - Task Preview */}
        <div className="w-2/3 flex flex-col pl-4 overflow-hidden">
          <h2 className="text-xl font-semibold mb-4">
            {templates.find((t) => t.id === selectedTemplateId)?.fileName.replace('.json', '')}
          </h2>
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
      </div>

      {/* Footer */}
      <div className="border-t p-4 bg-white ">
        <div className="flex justify-end gap-2">
          <EditTemplate template={templates.find((t) => t.id === selectedTemplateId)} />
          <DeleteTemplate template={templates.find((t) => t.id === selectedTemplateId)} />
        </div>
      </div>
    </div>
  );
};

export default TemplateManage;
