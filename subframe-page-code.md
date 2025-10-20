"use client";

import React from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { Checkbox } from "@/ui/components/Checkbox";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { Progress } from "@/ui/components/Progress";
import { SidebarRailWithIcons } from "@/ui/components/SidebarRailWithIcons";
import { TextField } from "@/ui/components/TextField";
import { FeatherAlarmClock } from "@subframe/core";
import { FeatherAlertCircle } from "@subframe/core";
import { FeatherArrowUp } from "@subframe/core";
import { FeatherBell } from "@subframe/core";
import { FeatherCheckCircle } from "@subframe/core";
import { FeatherCheckSquare } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherChevronRight } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { FeatherHome } from "@subframe/core";
import { FeatherLogOut } from "@subframe/core";
import { FeatherPlayCircle } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherSlidersHorizontal } from "@subframe/core";
import { FeatherTag } from "@subframe/core";
import { FeatherTerminal } from "@subframe/core";
import { FeatherToyBrick } from "@subframe/core";
import * as SubframeCore from "@subframe/core";

function TimeFlowDashboard() {
  return (
    <div className="flex h-full w-full items-center gap-2">
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
            <SidebarRailWithIcons.NavItem icon={<FeatherSettings />}>
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
                      <DropdownMenu.DropdownItem icon={<FeatherSettings />}>
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
      <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch bg-neutral-50">
        <div className="flex w-full items-center justify-end gap-2 border-b border-solid border-neutral-border bg-default-background px-6 py-4">
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <FeatherCheckCircle className="text-body font-body text-success-600" />
              <span className="text-caption font-caption text-subtext-color">
                Synced with Google Calendar
              </span>
            </div>
            <IconButton
              size="small"
              icon={<FeatherSettings />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
            <IconButton
              size="small"
              icon={<FeatherBell />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 items-start">
          <div className="flex w-72 flex-none flex-col items-start gap-4 self-stretch border-r border-solid border-neutral-border bg-default-background px-4 py-4 overflow-auto">
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
                    value=""
                    onChange={(
                      event: React.ChangeEvent<HTMLInputElement>
                    ) => {}}
                  />
                </TextField>
                <IconButton
                  size="small"
                  icon={<FeatherSlidersHorizontal />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-2 overflow-y-auto">
              <div className="flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background">
                <div className="flex w-full items-center justify-between px-3 py-3 cursor-pointer">
                  <div className="flex grow shrink-0 basis-0 items-center gap-2">
                    <FeatherChevronRight className="text-body font-body text-default-font" />
                    <span className="text-body-bold font-body-bold text-default-font">
                      Review Q4 metrics
                    </span>
                  </div>
                  <IconWithBackground
                    variant="error"
                    icon={<FeatherAlertCircle />}
                  />
                </div>
                <div className="flex w-full items-center gap-2 px-3 pb-3">
                  <FeatherClock className="text-caption font-caption text-subtext-color" />
                  <span className="text-caption font-caption text-subtext-color">
                    45 mins
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background">
                <div className="flex w-full items-center justify-between px-3 py-3 cursor-pointer">
                  <div className="flex grow shrink-0 basis-0 items-center gap-2">
                    <FeatherChevronDown className="text-body font-body text-default-font" />
                    <span className="text-body-bold font-body-bold text-default-font">
                      Update design system docs
                    </span>
                  </div>
                  <IconWithBackground
                    variant="warning"
                    icon={<FeatherAlertCircle />}
                  />
                </div>
                <div className="flex w-full items-center gap-2 px-3 pb-2">
                  <FeatherClock className="text-caption font-caption text-subtext-color" />
                  <span className="text-caption font-caption text-subtext-color">
                    1 hour
                  </span>
                </div>
                <div className="flex w-full flex-col items-start gap-2 border-t border-solid border-neutral-border bg-neutral-50 px-3 py-3">
                  <span className="text-caption font-caption text-default-font">
                    Need to update component documentation for Button,
                    TextField, and new IconButton variants. Include usage
                    examples and accessibility guidelines.
                  </span>
                  <div className="flex items-center gap-2">
                    <FeatherTag className="text-caption font-caption text-subtext-color" />
                    <span className="text-caption font-caption text-subtext-color">
                      Documentation, Design System
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background">
                <div className="flex w-full items-center justify-between px-3 py-3 cursor-pointer">
                  <div className="flex grow shrink-0 basis-0 items-center gap-2">
                    <FeatherChevronRight className="text-body font-body text-default-font" />
                    <span className="text-body-bold font-body-bold text-default-font">
                      Team standup prep
                    </span>
                  </div>
                  <IconWithBackground
                    variant="success"
                    icon={<FeatherAlertCircle />}
                  />
                </div>
                <div className="flex w-full items-center gap-2 px-3 pb-3">
                  <FeatherClock className="text-caption font-caption text-subtext-color" />
                  <span className="text-caption font-caption text-subtext-color">
                    30 mins
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background">
                <div className="flex w-full items-center justify-between px-3 py-3 cursor-pointer">
                  <div className="flex grow shrink-0 basis-0 items-center gap-2">
                    <FeatherChevronRight className="text-body font-body text-default-font" />
                    <span className="text-body-bold font-body-bold text-default-font">
                      Email responses
                    </span>
                  </div>
                  <IconWithBackground
                    variant="success"
                    icon={<FeatherAlertCircle />}
                  />
                </div>
                <div className="flex w-full items-center gap-2 px-3 pb-3">
                  <FeatherClock className="text-caption font-caption text-subtext-color" />
                  <span className="text-caption font-caption text-subtext-color">
                    20 mins
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background">
                <div className="flex w-full items-center justify-between px-3 py-3 cursor-pointer">
                  <div className="flex grow shrink-0 basis-0 items-center gap-2">
                    <FeatherChevronRight className="text-body font-body text-default-font" />
                    <span className="text-body-bold font-body-bold text-default-font">
                      Code review for PR #234
                    </span>
                  </div>
                  <IconWithBackground
                    variant="warning"
                    icon={<FeatherAlertCircle />}
                  />
                </div>
                <div className="flex w-full items-center gap-2 px-3 pb-3">
                  <FeatherClock className="text-caption font-caption text-subtext-color" />
                  <span className="text-caption font-caption text-subtext-color">
                    1 hour
                  </span>
                </div>
              </div>
            </div>
            <Button
              className="h-8 w-full flex-none"
              icon={<FeatherPlus />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            >
              Add Task
            </Button>
          </div>
          <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch overflow-y-auto">
            <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border bg-default-background px-6 py-3">
              <div className="flex items-center gap-2">
                <IconButton
                  size="small"
                  icon={<FeatherChevronLeft />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <span className="text-body-bold font-body-bold text-default-font">
                  Nov 18 - Nov 24, 2024
                </span>
                <IconButton
                  size="small"
                  icon={<FeatherChevronRight />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
              </div>
              <Button
                variant="brand-secondary"
                size="small"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Today
              </Button>
            </div>
            <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
              <div className="flex w-full items-start border-b border-solid border-neutral-border bg-neutral-50">
                <div className="flex h-12 w-16 flex-none items-center justify-center border-r border-solid border-neutral-border" />
                <div className="flex grow shrink-0 basis-0 items-center justify-center border-r border-solid border-neutral-border px-2 py-2">
                  <div className="flex flex-col items-center">
                    <span className="text-caption font-caption text-subtext-color">
                      Mon
                    </span>
                    <span className="text-body-bold font-body-bold text-default-font">
                      18
                    </span>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 items-center justify-center border-r border-solid border-neutral-border px-2 py-2">
                  <div className="flex flex-col items-center">
                    <span className="text-caption font-caption text-subtext-color">
                      Tue
                    </span>
                    <span className="text-body-bold font-body-bold text-default-font">
                      19
                    </span>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 items-center justify-center border-r border-solid border-neutral-border px-2 py-2">
                  <div className="flex flex-col items-center">
                    <span className="text-caption font-caption text-subtext-color">
                      Wed
                    </span>
                    <span className="text-body-bold font-body-bold text-default-font">
                      20
                    </span>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 items-center justify-center border-r border-solid border-neutral-border px-2 py-2">
                  <div className="flex flex-col items-center">
                    <span className="text-caption font-caption text-subtext-color">
                      Thu
                    </span>
                    <span className="text-body-bold font-body-bold text-default-font">
                      21
                    </span>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 items-center justify-center border-r border-solid border-neutral-border px-2 py-2">
                  <div className="flex flex-col items-center">
                    <span className="text-caption font-caption text-subtext-color">
                      Fri
                    </span>
                    <span className="text-body-bold font-body-bold text-default-font">
                      22
                    </span>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 items-center justify-center border-r border-solid border-neutral-border px-2 py-2">
                  <div className="flex flex-col items-center">
                    <span className="text-caption font-caption text-subtext-color">
                      Sat
                    </span>
                    <span className="text-body-bold font-body-bold text-default-font">
                      23
                    </span>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 items-center justify-center px-2 py-2">
                  <div className="flex flex-col items-center">
                    <span className="text-caption font-caption text-subtext-color">
                      Sun
                    </span>
                    <span className="text-body-bold font-body-bold text-default-font">
                      24
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex w-full grow shrink-0 basis-0 items-start">
                <div className="flex flex-col items-start self-stretch border-r border-solid border-neutral-border bg-neutral-50">
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      8am
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      9am
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      10am
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      11am
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      12pm
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      1pm
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      2pm
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      3pm
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      4pm
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      5pm
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      6pm
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center border-b border-solid border-neutral-border">
                    <span className="text-caption font-caption text-subtext-color">
                      7pm
                    </span>
                  </div>
                  <div className="flex h-16 w-16 flex-none items-center justify-center">
                    <span className="text-caption font-caption text-subtext-color">
                      8pm
                    </span>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch border-r border-solid border-neutral-border">
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-32 w-full flex-none items-start justify-center border-b border-solid border-neutral-border px-2 py-2">
                    <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1 self-stretch rounded-md bg-brand-300 px-2 py-2">
                      <span className="text-caption-bold font-caption-bold text-brand-900">
                        Deep Work
                      </span>
                      <div className="flex w-full items-center gap-2">
                        <span className="text-caption font-caption text-brand-700">
                          8:00 AM
                        </span>
                        <div className="flex items-center gap-1">
                          <FeatherCheckSquare className="text-caption font-caption text-brand-700" />
                          <span className="text-caption font-caption text-brand-700">
                            2
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-start justify-center border-b border-solid border-neutral-border px-2 py-2">
                    <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1 self-stretch rounded-md bg-success-100 px-2 py-2">
                      <span className="text-caption-bold font-caption-bold text-success-900">
                        Meetings
                      </span>
                      <div className="flex w-full items-center gap-2">
                        <span className="text-caption font-caption text-success-700">
                          1:00 PM
                        </span>
                        <div className="flex items-center gap-1">
                          <FeatherCheckSquare className="text-caption font-caption text-success-700" />
                          <span className="text-caption font-caption text-success-700">
                            1
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center px-2" />
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch border-r border-solid border-neutral-border">
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-32 w-full flex-none items-start justify-center border-b border-solid border-neutral-border px-2 py-2">
                    <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1 self-stretch rounded-md bg-warning-100 px-2 py-2">
                      <span className="text-caption-bold font-caption-bold text-warning-900">
                        Planning
                      </span>
                      <div className="flex w-full items-center gap-2">
                        <span className="text-caption font-caption text-warning-700">
                          9:00 AM
                        </span>
                        <div className="flex items-center gap-1">
                          <FeatherCheckSquare className="text-caption font-caption text-warning-700" />
                          <span className="text-caption font-caption text-warning-700">
                            3
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-32 w-full flex-none items-start justify-center border-b border-solid border-neutral-border px-2 py-2">
                    <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1 self-stretch rounded-md bg-brand-300 px-2 py-2">
                      <span className="text-caption-bold font-caption-bold text-brand-900">
                        Deep Work
                      </span>
                      <div className="flex w-full items-center gap-2">
                        <span className="text-caption font-caption text-brand-700">
                          2:00 PM
                        </span>
                        <div className="flex items-center gap-1">
                          <FeatherCheckSquare className="text-caption font-caption text-brand-700" />
                          <span className="text-caption font-caption text-brand-700">
                            1
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center px-2" />
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch border-r border-solid border-neutral-border">
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-start justify-center border-b border-solid border-neutral-border px-2 py-2">
                    <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1 self-stretch rounded-md bg-success-100 px-2 py-2">
                      <span className="text-caption-bold font-caption-bold text-success-900">
                        Meetings
                      </span>
                      <div className="flex w-full items-center gap-2">
                        <span className="text-caption font-caption text-success-700">
                          1:00 PM
                        </span>
                        <div className="flex items-center gap-1">
                          <FeatherCheckSquare className="text-caption font-caption text-success-700" />
                          <span className="text-caption font-caption text-success-700">
                            2
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center px-2" />
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch border-r border-solid border-neutral-border">
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center px-2" />
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch">
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center border-b border-solid border-neutral-border px-2" />
                  <div className="flex h-16 w-full flex-none items-center justify-center px-2" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-80 flex-none flex-col items-start gap-6 self-stretch border-l border-solid border-neutral-border bg-default-background px-4 py-4 overflow-auto">
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex w-full items-center gap-2">
                <div className="flex h-3 w-3 flex-none flex-col items-start gap-2 rounded-full bg-brand-600" />
                <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                  Deep Work Block
                </span>
              </div>
              <div className="flex w-full flex-col items-start gap-2">
                <span className="text-caption-bold font-caption-bold text-subtext-color">
                  TASKS IN THIS BLOCK
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background">
                    <div className="flex w-full items-center gap-2 px-3 py-2 cursor-pointer">
                      <Checkbox
                        label=""
                        checked={false}
                        onCheckedChange={(checked: boolean) => {}}
                      />
                      <div className="flex grow shrink-0 basis-0 items-center gap-2">
                        <FeatherChevronDown className="text-body font-body text-default-font" />
                        <span className="grow shrink-0 basis-0 text-body font-body text-default-font">
                          Finish project proposal
                        </span>
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-2 border-t border-solid border-neutral-border bg-neutral-50 px-3 py-2">
                      <span className="text-caption font-caption text-default-font">
                        Complete sections 3-5, add financial projections, and
                        finalize timeline. Need to incorporate feedback from
                        Tuesday&#39;s meeting.
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-2 cursor-pointer">
                    <Checkbox
                      label=""
                      checked={false}
                      onCheckedChange={(checked: boolean) => {}}
                    />
                    <div className="flex grow shrink-0 basis-0 items-center gap-2">
                      <FeatherChevronRight className="text-body font-body text-default-font" />
                      <span className="grow shrink-0 basis-0 text-body font-body text-neutral-400 line-through">
                        Review design mockups
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
            <div className="flex w-full flex-col items-start gap-4">
              <span className="text-caption-bold font-caption-bold text-subtext-color">
                POMODORO TIMER
              </span>
              <div className="flex w-full flex-col items-center gap-4 rounded-md border border-solid border-neutral-border bg-neutral-50 px-6 py-6">
                <span className="text-heading-1 font-heading-1 text-default-font">
                  25:00
                </span>
                <Progress value={60} />
                <div className="flex items-center gap-2">
                  <span className="text-caption font-caption text-subtext-color">
                    Session 2 of 4
                  </span>
                </div>
              </div>
            </div>
            <Button
              className="h-10 w-full flex-none"
              variant="neutral-secondary"
              size="large"
              icon={<FeatherAlarmClock />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            >
              Start Timer
            </Button>
            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
            <div className="flex w-full flex-col items-start gap-4">
              <span className="text-caption-bold font-caption-bold text-subtext-color">
                BLOCK PROGRESS
              </span>
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center justify-between">
                  <span className="text-body font-body text-default-font">
                    Completion
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    50%
                  </span>
                </div>
                <Progress value={50} />
              </div>
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center justify-between">
                  <span className="text-caption font-caption text-subtext-color">
                    Time elapsed
                  </span>
                  <span className="text-caption font-caption text-default-font">
                    1h 15m
                  </span>
                </div>
                <div className="flex w-full items-center justify-between">
                  <span className="text-caption font-caption text-subtext-color">
                    Time remaining
                  </span>
                  <span className="text-caption font-caption text-default-font">
                    45m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-3 border-t border-solid border-neutral-border bg-default-background px-36 py-3">
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
        <div className="flex w-full items-start border-t border-solid border-neutral-border bg-default-background">
          <div className="flex grow shrink-0 basis-0 items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FeatherPlayCircle className="text-body font-body text-brand-600" />
                <span className="text-body-bold font-body-bold text-default-font">
                  Finish project proposal
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FeatherClock className="text-caption font-caption text-subtext-color" />
                <span className="text-caption font-caption text-subtext-color">
                  34:12
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FeatherCheckCircle className="text-body font-body text-success-600" />
                <span className="text-caption font-caption text-subtext-color">
                  AI Accountability: On Track
                </span>
              </div>
              <div className="flex h-6 w-px flex-none flex-col items-center gap-2 bg-neutral-border" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    6
                  </span>
                  <span className="text-caption font-caption text-subtext-color">
                    tasks completed
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    4.5h
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
    </div>
  );
}

export default TimeFlowDashboard;