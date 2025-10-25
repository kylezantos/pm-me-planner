import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/ui/dropdown-menu";
import {
  AlarmClock,
  ArrowUp,
  Bell,
  Calendar,
  CheckCircle,
  CheckSquare,
  Clock,
  Home,
  LogOut,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  Terminal,
  ToyBrick,
} from "lucide-react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { formatDistanceToNow } from "date-fns";

// Store hooks
import { useTasksStore, useBlocksStore, useBlockTypesStore } from "@/lib/store";

// Calendar sync
import { useCalendarSync } from "@/lib/google";

// UI Components
import { SimpleCreateTaskModal } from "@/components/tasks/SimpleCreateTaskModal";
import { SimpleCreateBlockModal } from "@/components/blocks/SimpleCreateBlockModal";
import { CreateBlockTypeModal } from "@/components/blocks/CreateBlockTypeModal";
import { DraggableTaskList } from "@/components/tasks/DraggableTaskList";
import { SkeletonTaskCard } from "@/components/loading/SkeletonTaskCard";
import { SkeletonBlock } from "@/components/loading/SkeletonBlock";
import { EmptyBacklog } from "@/components/empty/EmptyBacklog";
import { EmptyCalendar } from "@/components/empty/EmptyCalendar";
import { EmptyBlock } from "@/components/empty/EmptyBlock";
import { InlineError } from "@/components/error/InlineError";
import { CalendarDropZone } from "@/components/blocks/CalendarDropZone";
import { TaskCard } from "@/components/tasks/TaskCard";
import { showSuccess, showError } from "@/components/error/toastUtils";
import { CalendarView } from "@/components/calendar/CalendarView";
import type { BlockInstance, Task } from "@/lib/types";
import type { BlockCalendarEvent } from "@/lib/calendar/events";

interface DashboardProps {
  userId: string;
}

function Dashboard({ userId }: DashboardProps) {
  const navigate = useNavigate();

  // Task backlog state
  const backlogTasks = useTasksStore((state) => state.backlogTasks);
  const loading = useTasksStore((state) => state.loading);
  const backlogError = useTasksStore((state) => state.error);
  const toggleTaskStatus = useTasksStore((state) => state.toggleTaskStatus);
  const assignTaskToBlock = useTasksStore((state) => state.assignTaskToBlock);
  const fetchTasksByBlockInstance = useTasksStore((state) => state.fetchTasksByBlockInstance);
  const fetchBacklogTasks = useTasksStore((state) => state.fetchBacklogTasks);

  // Blocks state
  const blocks = useBlocksStore((state) => state.blocks);
  const blocksLoading = useBlocksStore((state) => state.loading);
  const fetchBlocksForWeek = useBlocksStore((state) => state.fetchBlocksForWeek);

  // Block types state
  const blockTypes = useBlockTypesStore((state) => state.blockTypes);

  // Calendar sync state
  const { syncNow, syncing, lastSync, connectionsCount, error: syncError } = useCalendarSync();

  // Modal state
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreateBlockModalOpen, setIsCreateBlockModalOpen] = useState(false);
  const [isCreateBlockTypeModalOpen, setIsCreateBlockTypeModalOpen] = useState(false);
  const [blockCreationDefaults, setBlockCreationDefaults] = useState<{
    start?: Date;
    end?: Date;
  }>({});

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Block tasks cache (to avoid re-fetching)
  const [blockTasks, setBlockTasks] = useState<Record<string, Task[]>>({});

  // Selected block state (for right sidebar)
  const [selectedBlock, setSelectedBlock] = useState<BlockInstance | null>(null);

  // Fetch blocks for current week on mount
  useEffect(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    fetchBlocksForWeek(userId, monday);
  }, [userId, fetchBlocksForWeek]);

  // Fetch tasks for each block when blocks change
  useEffect(() => {
    const fetchAllBlockTasks = async () => {
      const tasksMap: Record<string, Task[]> = {};
      for (const block of blocks) {
        const tasks = await fetchTasksByBlockInstance(block.id);
        tasksMap[block.id] = tasks;
      }
      setBlockTasks(tasksMap);
    };

    if (blocks.length > 0) {
      fetchAllBlockTasks();
    } else {
      setBlockTasks({});
    }
  }, [blocks, fetchTasksByBlockInstance]);

  // Filter backlog by search
  const filteredBacklog = backlogTasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle task toggle with toast feedback
  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTaskStatus(taskId);
      showSuccess("Task updated", "Task status changed successfully");
    } catch (error) {
      showError("Failed to update task", error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Handle drag-and-drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const blockInstanceId = over.data?.current?.blockInstanceId as string | undefined;

    if (!blockInstanceId) {
      showError("Invalid drop target", "Please drop the task on a calendar block");
      return;
    }

    try {
      await assignTaskToBlock(taskId, blockInstanceId);
      showSuccess("Task assigned", "Task has been added to the block");

      // Refresh block tasks
      const tasks = await fetchTasksByBlockInstance(blockInstanceId);
      setBlockTasks((prev) => ({ ...prev, [blockInstanceId]: tasks }));
    } catch (error) {
      showError("Failed to assign task", error instanceof Error ? error.message : "Unknown error");
    }
  };


  // Handle manual calendar sync
  const handleSyncNow = async () => {
    try {
      await syncNow();
      showSuccess("Calendar synced", "Successfully synced with Google Calendar");
    } catch (error) {
      console.error("Sync error:", error);
      showError(
        "Sync failed",
        syncError || (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };


  // Handle calendar event selection
  const handleCalendarEventSelect = (event: BlockCalendarEvent) => {
    // Find the full block instance from the blocks array
    const block = blocks.find((b) => b.id === event.blockInstanceId);
    if (block) {
      setSelectedBlock(block);
    }
  };

  // Handle calendar slot selection
  const handleCalendarSlotSelect = (slotInfo: { start: Date; end: Date; action: string }) => {
    setBlockCreationDefaults({ start: slotInfo.start, end: slotInfo.end });
    setIsCreateBlockModalOpen(true);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full w-full">
        {/* Main Row: Left nav + content */}
        <div className="flex flex-1 min-h-0 w-full items-stretch gap-2">
          {/* Left Sidebar */}
          <div className="flex flex-col w-16 flex-none items-center gap-2 self-stretch border-r border-solid border-neutral-border bg-default-background px-2 py-4">
          {/* Header - Logo */}
          <div className="flex flex-col items-center justify-center gap-2 px-1 py-1">
            <img
              className="h-6 w-6 flex-none object-cover"
              src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
            />
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col items-center gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-12 flex flex-col items-center justify-center gap-1 rounded-md bg-neutral-100"
              title="Home"
            >
              <Home className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-12 flex flex-col items-center justify-center gap-1 rounded-md"
              title="Tasks"
            >
              <CheckSquare className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-12 flex flex-col items-center justify-center gap-1 rounded-md"
              title="Blocks (Templates)"
            >
              <ToyBrick className="h-5 w-5" />
            </Button>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-12 flex items-center justify-center rounded-md"
              onClick={() => navigate("/settings")}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/m0kfajqpwkfief00it4v.jpg" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="start">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 min-h-0 items-start self-stretch bg-neutral-50">
        {/* Top Header Bar */}
        <div className="flex flex-none w-full items-center justify-between gap-2 border-b border-solid border-neutral-border bg-default-background px-6 py-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsCreateBlockTypeModalOpen(true)}
            >
              <ToyBrick className="mr-2 h-4 w-4" />
              New Block Type
            </Button>
          </div>
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              {lastSync && (
                <span className="text-caption font-caption text-subtext-color">
                  Last sync: {formatDistanceToNow(lastSync, { addSuffix: true })}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                disabled={connectionsCount === 0 || syncing}
                onClick={handleSyncNow}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 w-full items-start">
          {/* Task Backlog Panel */}
          <div className="flex w-64 lg:w-72 xl:w-80 flex-none flex-col items-start gap-4 self-stretch border-r border-solid border-neutral-border bg-default-background px-4 py-4 overflow-y-auto">
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Task Backlog
                </span>
              </div>
              <div className="flex w-full items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(event.target.value)
                    }
                    className="pl-9"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Task List */}
            <div className="flex w-full flex-col items-start gap-2 overflow-y-auto">
              {backlogError ? (
                // Inline error + retry
                <div className="flex w-full flex-col items-start gap-2">
                  <InlineError message={backlogError} />
                  <Button
                    size="sm"
                    onClick={() => fetchBacklogTasks(userId)}
                  >
                    Retry
                  </Button>
                </div>
              ) : loading ? (
                // Loading state
                <>
                  <SkeletonTaskCard />
                  <SkeletonTaskCard />
                  <SkeletonTaskCard />
                </>
              ) : filteredBacklog.length === 0 ? (
                // Empty state
                <EmptyBacklog onCreateTask={() => setIsCreateTaskModalOpen(true)} />
              ) : (
                // Task list with drag-and-drop
                <DraggableTaskList
                  tasks={filteredBacklog}
                  onToggleStatus={handleToggleTask}
                  expandable={true}
                />
              )}
            </div>

            {/* Add Task Button */}
            <Button
              className="w-full flex-none"
              size="sm"
              onClick={() => setIsCreateTaskModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>

          {/* Calendar View */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <CalendarView
              userId={userId}
              onSelectEvent={handleCalendarEventSelect}
              onSelectSlot={handleCalendarSlotSelect}
            />
          </div>

          {/* Right Sidebar - Block Details */}
          <div className="flex w-64 lg:w-72 xl:w-80 flex-none flex-col items-start gap-6 self-stretch border-l border-solid border-neutral-border bg-default-background px-4 py-4 overflow-y-auto">
            {selectedBlock ? (
              <div className="flex w-full flex-col items-start gap-4">
                {/* Block Header */}
                <div className="flex w-full items-start gap-2">
                  <div
                    className="flex h-3 w-3 flex-none flex-col items-start gap-2 rounded-full mt-1"
                    style={{
                      backgroundColor: blockTypes.find((bt) => bt.id === selectedBlock.block_type_id)?.color || '#888888'
                    }}
                  />
                  <div className="flex grow flex-col gap-1">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      {blockTypes.find((bt) => bt.id === selectedBlock.block_type_id)?.name || 'Block'}
                    </span>
                    <span className="text-caption font-caption text-subtext-color">
                      {new Date(selectedBlock.planned_start).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {new Date(selectedBlock.planned_end).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // TODO: Open edit modal
                      console.log('Edit block', selectedBlock);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                {/* Block Status */}
                <div className="flex w-full items-center gap-2 px-3 py-2 rounded bg-neutral-50">
                  <span className="text-caption-bold font-caption-bold text-subtext-color">
                    Status:
                  </span>
                  <span className={`text-caption font-caption ${
                    selectedBlock.status === 'completed' ? 'text-success-600' :
                    selectedBlock.status === 'in_progress' ? 'text-brand-600' :
                    selectedBlock.status === 'skipped' ? 'text-error-600' :
                    'text-subtext-color'
                  }`}>
                    {selectedBlock.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>

                {/* Block Notes */}
                {selectedBlock.notes && (
                  <div className="flex w-full flex-col gap-2">
                    <span className="text-caption-bold font-caption-bold text-subtext-color">
                      NOTES
                    </span>
                    <p className="text-caption font-caption text-default-font whitespace-pre-wrap">
                      {selectedBlock.notes}
                    </p>
                  </div>
                )}

                {/* Tasks in Block */}
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-caption-bold font-caption-bold text-subtext-color">
                      TASKS IN THIS BLOCK
                    </span>
                    <span className="text-caption font-caption text-subtext-color">
                      {blockTasks[selectedBlock.id]?.length || 0}
                    </span>
                  </div>
                  {blockTasks[selectedBlock.id]?.length > 0 ? (
                    <div className="flex w-full flex-col gap-2">
                      {blockTasks[selectedBlock.id].map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={handleToggleTask}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex w-full items-center justify-center py-6 border border-dashed border-neutral-border rounded">
                      <span className="text-caption font-caption text-subtext-color">
                        No tasks assigned
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full items-center gap-2">
                  <div className="flex h-3 w-3 flex-none flex-col items-start gap-2 rounded-full bg-brand-600" />
                  <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                    Select a block
                  </span>
                </div>
                <div className="flex w-full flex-col items-start gap-2">
                  <span className="text-caption-bold font-caption-bold text-subtext-color">
                    TASKS IN THIS BLOCK
                  </span>
                  <div className="flex w-full items-center justify-center py-8">
                    <span className="text-caption font-caption text-subtext-color">
                      Click on a calendar block to view its tasks
                    </span>
                  </div>
                </div>
              </div>
            )}
        </div>
        </div>
      </div>
    </div>

    {/* Bottom Claude Input Bar */}
    <div className="flex flex-none w-full items-center justify-center gap-3 border-t border-solid border-neutral-border bg-default-background px-36 py-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
        >
          <Terminal className="h-4 w-4" />
        </Button>
        <Input
          placeholder="Ask Claude..."
          value=""
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
          className="flex-1"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
        >
          <Clock className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
    </div>

    {/* Status Bar */}
    <div className="flex flex-none w-full items-start border-t border-solid border-neutral-border bg-default-background">
        <div className="flex grow shrink-0 basis-0 items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-brand-600" />
              <span className="text-body-bold font-body-bold text-default-font">
                No active task
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
              <span className="text-caption font-caption text-subtext-color">
                AI Accountability: Ready
              </span>
            </div>
            <div className="flex h-6 w-px flex-none flex-col items-center gap-2 bg-neutral-border" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  {backlogTasks.filter((t) => t.status === "completed").length}
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  tasks completed
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  0h
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  tracked today
                </span>
              </div>
            </div>
          </div>
        </div>
    </div>

      {/* Create Task Modal */}
      <SimpleCreateTaskModal
        open={isCreateTaskModalOpen}
        onOpenChange={setIsCreateTaskModalOpen}
        userId={userId}
      />

      {/* Create Block Modal */}
      <SimpleCreateBlockModal
        open={isCreateBlockModalOpen}
        onOpenChange={setIsCreateBlockModalOpen}
        userId={userId}
        defaultStart={blockCreationDefaults.start}
        defaultEnd={blockCreationDefaults.end}
      />

      {/* Create Block Type Modal */}
      <CreateBlockTypeModal
        open={isCreateBlockTypeModalOpen}
        onOpenChange={setIsCreateBlockTypeModalOpen}
        userId={userId}
      />
    </div>
    </DndContext>
  );
}

export default Dashboard;
