import React from 'react';
import { Search } from 'lucide-react';

interface EmptySearchProps {
  searchQuery: string;
}

export function EmptySearch({ searchQuery }: EmptySearchProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 py-12 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <Search className="h-8 w-8 text-neutral-400" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-body-bold font-body-bold text-default-font">
          No results found
        </span>
        <span className="text-caption font-caption text-subtext-color max-w-xs">
          No tasks match "{searchQuery}". Try a different search term or create a new task.
        </span>
      </div>
    </div>
  );
}
