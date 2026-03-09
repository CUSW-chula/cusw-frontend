'use client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL, { type TaskManageMentOverviewProp, type Project } from '@/lib/shared';
import type { TaskProps } from '@/app/types/types';
import { ExportDialog, Filter, Sort, CreateTask, Task } from '@/components/elements/taskManagement';
import { groupingStatus, parseJsonValues, statusSections, statusToInt } from '@/lib/taskUtils';
import { toast } from '@/hooks/use-toast';
import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  MeasuringStrategy,
  type Modifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

const loadExpandedState = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  const saved = localStorage.getItem('expandedTaskIds');
  if (saved === '{}') return new Set();
  return saved ? new Set(JSON.parse(saved)) : new Set();
};

const saveExpandedState = (ids: Set<string>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('expandedTaskIds', JSON.stringify(Array.from(ids)));
  }
};

const reorderTasks = (tasks: TaskProps[], activeId: string, overId: string): TaskProps[] => {
  const activeIdx = tasks.findIndex((t) => t.id === activeId);
  const overIdx = tasks.findIndex((t) => t.id === overId);

  if (activeIdx !== -1 && overIdx !== -1) {
    return arrayMove(tasks, activeIdx, overIdx);
  }

  return tasks.map((task) => {
    if (!task.subtasks || task.subtasks.length === 0) return task;

    const newSubtasks = reorderTasks(task.subtasks, activeId, overId);

    if (newSubtasks === task.subtasks) return task;

    return { ...task, subtasks: newSubtasks };
  });
};

export const TaskManager = ({ project_id }: TaskManageMentOverviewProp) => {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [showTasks, setShowTasks] = useState<TaskProps[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [project, setProject] = useState<Project | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(loadExpandedState);
  const [activeTask, setActiveTask] = useState<TaskProps | null>(null);
  const [isLayoutCollapsed, setIsLayoutCollapsed] = useState(false);

  useEffect(() => {
    saveExpandedState(expandedIds);
  }, [expandedIds]);

  const handleToggle = (taskId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(taskId) ? next.delete(taskId) : next.add(taskId);
      return next;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
          headers: { Authorization: auth },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const projectData = await response.json();
        console.log(projectData);
        setProject(projectData);
        setProjectName(projectData.title);

        const parsedData = parseJsonValues(projectData.tasks);
        setTasks(parsedData);
        setShowTasks(parsedData);

        if (!loadExpandedState().size) {
          const newIds = new Set<string>();
          const traverse = (t: TaskProps) => {
            newIds.add(t.id);
            t.subtasks?.forEach(traverse);
          };
          parsedData.forEach(traverse);
          setExpandedIds(newIds);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [project_id]);

  const TaskDragOverlay = ({ task }: { task: TaskProps }) => {
    return (
      <div className="flex items-center w-[300px] py-3 px-4 bg-white border border-blue-400 shadow-xl rounded-md cursor-grabbing ">
        <span className="text-blue-700 font-medium font-BaiJamjuree truncate">{task.title}</span>
      </div>
    );
  };

  const updatePositions = async (taskId: string, position: number) => {
    console.log(`Updating position for task ${taskId} to ${position}`);
    try {
      const response = await fetch(`${BASE_URL}/v2/tasks/position/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth,
        },
        body: JSON.stringify({ newPosition: position }),
      });

      if (!response.ok) throw new Error('Batch update failed');
    } catch (error) {
      console.error('Batch Update Error:', error);
      toast({ title: 'Error', description: 'Failed to save order', variant: 'destructive' });
    }
  };

  const customSnapToCursor: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
    if (activatorEvent && draggingNodeRect) {
      const event =
        'touches' in activatorEvent
          ? (activatorEvent as TouchEvent).touches[0]
          : (activatorEvent as MouseEvent);
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      const overlayWidth = draggingNodeRect.width || 300;
      const overlayHeight = draggingNodeRect.height || 50;

      const offsetX = mouseX - draggingNodeRect.left;
      const offsetY = mouseY - draggingNodeRect.top;

      return {
        ...transform,
        x: transform.x + offsetX - overlayWidth / 2,
        y: transform.y + offsetY - overlayHeight / 2,
      };
    }
    return transform;
  };

  const removeTaskFromState = (taskId: string) => {
    const removeRecursive = (list: TaskProps[]): TaskProps[] => {
      return list
        .filter((t) => t.id !== taskId)
        .map((t) => ({
          ...t,
          subtasks: t.subtasks ? removeRecursive(t.subtasks) : undefined,
        }));
    };
    const updated = removeRecursive(tasks);
    setTasks(updated);
    setShowTasks(updated);
    toast({ title: 'Task deleted', description: 'Success' });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findTaskById = (list: TaskProps[], id: string): TaskProps | null => {
    for (const t of list) {
      if (t.id === id) return t;
      if (t.subtasks) {
        const found = findTaskById(t.subtasks, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTaskById(tasks, event.active.id as string);

    setActiveTask(task ?? null);
    setTimeout(() => {
      setIsLayoutCollapsed(true);
    }, 0);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsLayoutCollapsed(false);
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveTask(null);
      return;
    }

    const newIndex = over.data.current?.sortable?.index;
    if (newIndex === undefined) {
      setActiveTask(null);
      return;
    }

    const newTasks = reorderTasks(tasks, active.id as string, over.id as string);
    setTasks(newTasks);
    setShowTasks(newTasks);
    updatePositions(active.id as string, newIndex);
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}>
      <div className="h-auto w-full p-11 font-BaiJamjuree bg-white rounded-md border border-brown flex flex-col">
        <header className="text-black text-3xl font-Anuphan font-semibold leading-9 mb-6 break-words whitespace-normal">
          {projectName}
        </header>

        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-4">
            <Filter tasks={tasks} setShowTasks={setShowTasks} />
            <ExportDialog tasks={tasks} />
          </div>
          <div className="flex items-center gap-4">
            <Sort showTasks={showTasks} setShowTasks={setShowTasks} />
            {project && <CreateTask project={project} />}
          </div>
        </div>

        {statusSections.map(({ status, displayName, icon }) => {
          const tasksInStatus = showTasks.filter(
            (item) => groupingStatus(item, 99) === statusToInt(status),
          );
          const isRootDragged = tasksInStatus.some((t) => t.id === activeTask?.id);

          return (
            <div key={status} className="w-full">
              <div className="flex items-center gap-2 border-b border-gray-300 py-3">
                <img src={icon} alt={`${status} Icon`} className="w-6 h-6" />
                <span className="text-black text-sm font-medium font-BaiJamjuree">
                  {displayName}
                </span>
              </div>

              <div className="w-full block overflow-x-auto min-h-[50px]">
                <SortableContext
                  items={tasksInStatus.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}>
                  {tasksInStatus.map((item) => {
                    const isRootDragged =
                      isLayoutCollapsed && tasksInStatus.some((t) => t.id === activeTask?.id);

                    return (
                      <Task
                        key={item.id}
                        item={item}
                        depth={0}
                        hiddenDate={false}
                        expandedIds={expandedIds}
                        onToggle={handleToggle}
                        onTaskDelete={removeTaskFromState}
                        activeId={activeTask?.id}
                        forceCollapse={isRootDragged}
                      />
                    );
                  })}
                </SortableContext>

                {tasksInStatus.length === 0 && (
                  <div className="text-gray-400 text-sm py-4 italic">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <DragOverlay
        dropAnimation={{ duration: 250, easing: 'ease' }}
        modifiers={[customSnapToCursor]}>
        {activeTask ? <TaskDragOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
