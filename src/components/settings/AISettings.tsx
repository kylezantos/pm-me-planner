import { useAISettingsStore } from '@/stores/aiSettingsStore';
import { Card } from '@/ui/card';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Button } from '@/ui/button';
import { Bot, RotateCcw } from 'lucide-react';

export function AISettings() {
  const { settings, updateSettings, resetSettings } = useAISettingsStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <h2 className="text-xl font-semibold">AI Assistant Settings</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetSettings}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </Button>
      </div>

      {/* Settings Form */}
      <Card className="p-6 space-y-6">
        {/* AI Command */}
        <div className="space-y-2">
          <Label htmlFor="ai-command">AI Command</Label>
          <Input
            id="ai-command"
            value={settings.command}
            onChange={(e) => updateSettings({ command: e.target.value })}
            placeholder="claude"
            className="font-mono"
          />
          <p className="text-sm text-subtext-color">
            The command to execute when chatting with AI. Default: <code>claude</code>
          </p>
        </div>

        {/* Command Arguments */}
        <div className="space-y-2">
          <Label htmlFor="ai-args">Command Arguments (Optional)</Label>
          <Input
            id="ai-args"
            value={settings.commandArgs}
            onChange={(e) => updateSettings({ commandArgs: e.target.value })}
            placeholder="--model claude-3-opus"
            className="font-mono"
          />
          <p className="text-sm text-subtext-color">
            Optional arguments to pass to the AI command
          </p>
        </div>

        {/* Examples Section */}
        <div className="space-y-3 pt-4 border-t border-border-color">
          <h3 className="font-medium">Example Configurations</h3>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <code className="text-sm bg-secondary/20 px-2 py-1 rounded">claude</code>
              <p className="text-sm text-subtext-color">Use Claude Code subscription</p>
            </div>

            <div className="flex items-start gap-3">
              <code className="text-sm bg-secondary/20 px-2 py-1 rounded">codex</code>
              <p className="text-sm text-subtext-color">Use Codex subscription</p>
            </div>

            <div className="flex items-start gap-3">
              <code className="text-sm bg-secondary/20 px-2 py-1 rounded">./scripts/my-ai.sh</code>
              <p className="text-sm text-subtext-color">Custom script (for API keys, local models, etc.)</p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-secondary/10 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Note</h4>
          <p className="text-sm text-subtext-color">
            PM Me Planner does not manage API keys or subscriptions. You are responsible for:
          </p>
          <ul className="text-sm text-subtext-color list-disc list-inside space-y-1 ml-2">
            <li>Having Claude Code or Codex installed and accessible</li>
            <li>Managing your own API keys if using custom scripts</li>
            <li>Ensuring the command is executable and in your PATH</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
