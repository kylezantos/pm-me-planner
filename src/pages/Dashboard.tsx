import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { SidebarRailWithIcons } from "@/ui/components/SidebarRailWithIcons";
import { TextField } from "@/ui/components/TextField";
import {
  FeatherAlarmClock,
  FeatherArrowUp,
  FeatherBell,
  FeatherCalendar,
  FeatherCheckCircle,
  FeatherCheckSquare,
  FeatherChevronLeft,
  FeatherChevronRight,
  FeatherClock,
  FeatherHome,
  FeatherLogOut,
  FeatherPlayCircle,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherSearch,
  FeatherSettings,
  FeatherSlidersHorizontal,
  FeatherTerminal,
  FeatherToyBrick,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";
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
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { CalendarDayView } from "@/components/calendar/CalendarDayView";
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

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Calendar view state (week or day)
  const [calendarView, setCalendarView] = useState<"week" | "day">("week");

  // Block tasks cache (to avoid re-fetching)
  const [blockTasks, setBlockTasks] = useState<Record<string, Task[]>>({});

  // Selected block state (for right sidebar)
  const [selectedBlock, setSelectedBlock] = useState<BlockInstance | null>(null);

  // Fetch blocks when week changes
  useEffect(() => {
    fetchBlocksForWeek(userId, currentWeekStart);
  }, [userId, currentWeekStart, fetchBlocksForWeek]);

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

  // Handle block creation from calendar slot click
  const handleSlotClick = (dayIndex: number, hour: number) => {
    const slotDate = new Date(currentWeekStart);
    slotDate.setDate(currentWeekStart.getDate() + dayIndex);
    slotDate.setHours(hour, 0, 0, 0);

    const endDate = new Date(slotDate);
    endDate.setHours(hour + 2, 0, 0, 0); // Default 2-hour block

    setBlockCreationDefaults({ start: slotDate, end: endDate });
    setIsCreateBlockModalOpen(true);
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

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  // Generate week header dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  // Format week range for display
  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const monthStart = start.toLocaleDateString('en-US', { month: 'short' });
    const monthEnd = end.toLocaleDateString('en-US', { month: 'short' });
    const dayStart = start.getDate();
    const dayEnd = end.getDate();
    const year = end.getFullYear();

    if (monthStart === monthEnd) {
      return `${monthStart} ${dayStart} - ${dayEnd}, ${year}`;
    }
    return `${monthStart} ${dayStart} - ${monthEnd} ${dayEnd}, ${year}`;
  };

  // Get blocks for a specific day and hour
  const getBlocksForSlot = (dayIndex: number, hour: number): BlockInstance[] => {
    const slotDate = new Date(currentWeekStart);
    slotDate.setDate(currentWeekStart.getDate() + dayIndex);
    slotDate.setHours(hour, 0, 0, 0);

    const slotEnd = new Date(slotDate);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return blocks.filter((block) => {
      const blockStart = new Date(block.planned_start);
      const blockEnd = new Date(block.planned_end);

      // Check if block overlaps with this hour slot
      return blockStart < slotEnd && blockEnd > slotDate;
    });
  };

  // Determine if a given day has any blocks at all
  const hasBlocksOnDay = (dayIndex: number): boolean => {
    const dayStart = new Date(currentWeekStart);
    dayStart.setDate(currentWeekStart.getDate() + dayIndex);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    return blocks.some((block) => {
      const start = new Date(block.planned_start);
      const end = new Date(block.planned_end);
      return start < dayEnd && end > dayStart;
    });
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
      <div className="flex h-full w-full items-center gap-2">
        {/* Left Sidebar */}
        <SidebarRailWithIcons
        header={
          <div className="flex flex-col items-center justify-center gap-2 px-1 py-1">
            <img
              className="h-6 w-6 flex-none object-cover"
              src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
            />
          </div>
        }
        footer={
          <>
            <SidebarRailWithIcons.NavItem
              icon={<FeatherSettings />}
              onClick={() => navigate("/settings")}
            >
              Settings
            </SidebarRailWithIcons.NavItem>
            <div className="flex flex-col items-center justify-end gap-1 px-1 py-1">
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Avatar
                    size="small"
                    image="https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/m0kfajqpwkfief00it4v.jpg"
                  >
                    A
                  </Avatar>
                </SubframeCore.DropdownMenu.Trigger>
                <SubframeCore.DropdownMenu.Portal>
                  <SubframeCore.DropdownMenu.Content
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    asChild={true}
                  >
                    <DropdownMenu>
                      <DropdownMenu.DropdownItem
                        icon={<FeatherSettings />}
                        onClick={() => navigate("/settings")}
                      >
                        Settings
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherLogOut />}>
                        Log out
                      </DropdownMenu.DropdownItem>
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>
            </div>
          </>
        }
      >
        <SidebarRailWithIcons.NavItem icon={<FeatherHome />} selected={true}>
          Home
        </SidebarRailWithIcons.NavItem>
        <SidebarRailWithIcons.NavItem icon={<FeatherCheckSquare />}>
          Tasks
        </SidebarRailWithIcons.NavItem>
        <SidebarRailWithIcons.NavItem icon={<FeatherToyBrick />}>
          Blocks (Templates)
        </SidebarRailWithIcons.NavItem>
      </SidebarRailWithIcons>

      {/* Main Content Area */}
      <div className="flex flex-col grow shrink-0 basis-0 items-start self-stretch bg-neutral-50">
        {/* Top Header Bar */}
        <div className="flex flex-none w-full items-center justify-between gap-2 border-b border-solid border-neutral-border bg-default-background px-6 py-4">
          <div className="flex items-center gap-2">
            <Button
              size="small"
              icon={<FeatherToyBrick />}
              onClick={() => setIsCreateBlockTypeModalOpen(true)}
            >
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
                size="small"
                variant="neutral-secondary"
                icon={<FeatherRefreshCw />}
                disabled={connectionsCount === 0 || syncing}
                loading={syncing}
                onClick={handleSyncNow}
              >
                Sync Now
              </Button>
            </div>
            <IconButton
              size="small"
              icon={<FeatherSettings />}
              onClick={() => navigate("/settings")}
            />
            <IconButton
              size="small"
              icon={<FeatherBell />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
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
              <div className="flex w-full items-center">
                <TextField
                  className="h-auto grow shrink-0 basis-0"
                  variant="filled"
                  label=""
                  helpText=""
                  icon={<FeatherSearch />}
                >
                  <TextField.Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(event.target.value)
                    }
                  />
                </TextField>
                <IconButton
                  size="small"
                  icon={<FeatherSlidersHorizontal />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
              </div>
            </div>

            {/* Task List */}
            <div className="flex w-full flex-col items-start gap-2 overflow-y-auto">
              {backlogError ? (
                // Inline error + retry
                <div className="flex w-full flex-col items-start gap-2">
                  <InlineError message={backlogError} />
                  <Button
                    size="small"
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
              className="h-8 w-full flex-none"
              icon={<FeatherPlus />}
              onClick={() => setIsCreateTaskModalOpen(true)}
            >
              Add Task
            </Button>
          </div>

          {/* Calendar View */}
          <div className="flex flex-1 flex-col items-start self-stretch overflow-hidden">
            <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border bg-default-background px-6 py-3">
              <div className="flex items-center gap-2">
                <IconButton
                  size="small"
                  icon={<FeatherChevronLeft />}
                  onClick={goToPreviousWeek}
                />
                <span className="text-body-bold font-body-bold text-default-font">
                  {formatWeekRange()}
                </span>
                <IconButton
                  size="small"
                  icon={<FeatherChevronRight />}
                  onClick={goToNextWeek}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border border-solid border-neutral-border rounded-md overflow-hidden">
                  <button
                    onClick={() => setCalendarView("week")}
                    className={`px-3 py-1 text-caption font-caption transition-colors ${
                      calendarView === "week"
                        ? "bg-brand-600 text-white"
                        : "bg-default-background text-subtext-color hover:bg-neutral-100"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setCalendarView("day")}
                    className={`px-3 py-1 text-caption font-caption transition-colors ${
                      calendarView === "day"
                        ? "bg-brand-600 text-white"
                        : "bg-default-background text-subtext-color hover:bg-neutral-100"
                    }`}
                  >
                    Day
                  </button>
                </div>
                <Button
                  variant="brand-secondary"
                  size="small"
                  onClick={goToToday}
                >
                  Today
                </Button>
              </div>
            </div>

            {/* New Calendar Views */}
            <div className="flex flex-1 w-full items-stretch p-4 overflow-hidden">
              {calendarView === "week" ? (
                <CalendarWeekView
                  userId={userId}
                  initialDate={currentWeekStart}
                  onSelectEvent={handleCalendarEventSelect}
                  onSelectSlot={handleCalendarSlotSelect}
                  height="100%"
                />
              ) : (
                <CalendarDayView
                  userId={userId}
                  initialDate={currentWeekStart}
                  onSelectEvent={handleCalendarEventSelect}
                  onSelectSlot={handleCalendarSlotSelect}
                  height="100%"
                />
              )}
            </div>
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
                  <IconButton
                    size="small"
                    variant="neutral-tertiary"
                    icon={<FeatherSettings />}
                    onClick={() => {
                      // TODO: Open edit modal
                      console.log('Edit block', selectedBlock);
                    }}
                  />
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

        {/* Bottom Claude Input Bar */}
        <div className="flex flex-none w-full items-center justify-center gap-3 border-t border-solid border-neutral-border bg-default-background px-36 py-3">
          <IconButton
            size="small"
            icon={<FeatherTerminal />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          />
          <TextField
            className="h-auto grow shrink-0 basis-0"
            variant="filled"
            label=""
            helpText=""
          >
            <TextField.Input
              placeholder="Ask Claude..."
              value=""
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
            />
          </TextField>
          <IconButton
            size="small"
            icon={<FeatherClock />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          />
          <IconButton
            variant="brand-primary"
            size="small"
            icon={<FeatherArrowUp />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          />
        </div>

        {/* Status Bar */}
        <div className="flex flex-none w-full items-start border-t border-solid border-neutral-border bg-default-background">
          <div className="flex grow shrink-0 basis-0 items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FeatherPlayCircle className="text-body font-body text-brand-600" />
                <span className="text-body-bold font-body-bold text-default-font">
                  No active task
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FeatherCheckCircle className="text-body font-body text-success-600" />
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
