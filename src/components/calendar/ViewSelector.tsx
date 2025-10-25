import React from 'react';
import { motion } from 'framer-motion';
import { ToggleGroup, ToggleGroupItem } from '@/ui/toggle-group';
import { List, Columns2, Grid3x3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalendarViewType = 'day' | 'week' | 'month';

interface ViewSelectorProps {
  value: CalendarViewType;
  onValueChange: (value: CalendarViewType) => void;
  className?: string;
}

interface ViewOption {
  value: CalendarViewType;
  icon: React.ReactNode;
  label: string;
}

// Animation configuration constants
const ANIMATION_CONFIG = {
  SELECTED_FLEX: 1.6,
  UNSELECTED_FLEX: 1,
  ICON_SCALE_SELECTED: 0.89732,
  ICON_SCALE_UNSELECTED: 1.00268,
  CONTAINER_SCALE_SELECTED: 1,
  CONTAINER_SCALE_UNSELECTED: 0.95,
  DURATION: 0.2,
  EASE: [0.32, 0.72, 0, 1] as const,
} as const;

const viewOptions: ViewOption[] = [
  { value: 'day', icon: <List className="h-5 w-5" />, label: 'Day' },
  { value: 'week', icon: <Columns2 className="h-5 w-5" />, label: 'Week' },
  { value: 'month', icon: <Grid3x3 className="h-5 w-5" />, label: 'Month' },
];

// Type guard for CalendarViewType
function isValidViewType(value: string): value is CalendarViewType {
  return value === 'day' || value === 'week' || value === 'month';
}

export function ViewSelector({ value, onValueChange, className }: ViewSelectorProps) {
  const handleValueChange = (val: string) => {
    if (val && isValidViewType(val)) {
      onValueChange(val);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={handleValueChange}
      className={cn(
        'gap-0 -space-x-px rounded-sm border overflow-hidden shadow-sm shadow-black/5',
        className
      )}
    >
      {viewOptions.map((option) => {
        const isSelected = value === option.value;

        return (
          <motion.div
            key={option.value}
            className="flex-1 flex divide-x"
            animate={{
              flex: isSelected
                ? `${ANIMATION_CONFIG.SELECTED_FLEX} 1 0%`
                : `${ANIMATION_CONFIG.UNSELECTED_FLEX} 1 0%`,
            }}
            transition={{
              duration: ANIMATION_CONFIG.DURATION,
              ease: ANIMATION_CONFIG.EASE,
            }}
          >
            <ToggleGroupItem
              value={option.value}
              className={`
                w-full rounded-none shadow-none focus-visible:z-10 text-base
                flex items-center justify-center gap-2 relative border-none
                ${isSelected ? 'z-10' : ''}
              `}
            >
              <motion.div
                className="flex items-center justify-center gap-2 py-2 px-3"
                animate={{
                  scale: isSelected ? ANIMATION_CONFIG.CONTAINER_SCALE_SELECTED : ANIMATION_CONFIG.CONTAINER_SCALE_UNSELECTED,
                }}
                transition={{
                  duration: ANIMATION_CONFIG.DURATION,
                  ease: ANIMATION_CONFIG.EASE,
                }}
              >
                <motion.div
                  animate={{
                    scale: isSelected ? ANIMATION_CONFIG.ICON_SCALE_SELECTED : ANIMATION_CONFIG.ICON_SCALE_UNSELECTED,
                  }}
                  transition={{
                    duration: ANIMATION_CONFIG.DURATION,
                    ease: ANIMATION_CONFIG.EASE,
                  }}
                >
                  {option.icon}
                </motion.div>

                <motion.p
                  className="font-medium origin-left whitespace-nowrap"
                  animate={{
                    opacity: isSelected ? 1 : 0,
                    width: isSelected ? 'auto' : 0,
                  }}
                  transition={{
                    duration: ANIMATION_CONFIG.DURATION,
                    ease: ANIMATION_CONFIG.EASE,
                  }}
                  style={{
                    overflow: 'hidden',
                  }}
                >
                  {option.label}
                </motion.p>
              </motion.div>
            </ToggleGroupItem>
          </motion.div>
        );
      })}
    </ToggleGroup>
  );
}
