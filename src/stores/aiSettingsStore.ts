import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AISettings {
  command: string; // The AI command to execute (e.g., 'claude', 'codex', './scripts/my-ai.sh')
  commandArgs: string; // Optional command arguments
}

interface AISettingsState {
  settings: AISettings;
  updateSettings: (settings: Partial<AISettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AISettings = {
  command: 'claude',
  commandArgs: '',
};

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      resetSettings: () =>
        set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'ai-settings-storage',
    }
  )
);
