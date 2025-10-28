import { useState, useRef, useEffect } from 'react';
import { Command } from '@tauri-apps/plugin-shell';
import { Button } from '@/ui/button';
import { Textarea } from '@/ui/textarea';
import { Card } from '@/ui/card';
import { Avatar } from '@/ui/avatar';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { useAISettingsStore } from '@/stores/aiSettingsStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatTerminalProps {
  className?: string;
}

export function ChatTerminal({
  className = ''
}: ChatTerminalProps) {
  const { settings } = useAISettingsStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const commandRef = useRef<ReturnType<typeof Command.create> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get full AI command with args
  const aiCommand = settings.commandArgs
    ? `${settings.command} ${settings.commandArgs}`
    : settings.command;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize AI process on mount and when settings change
  useEffect(() => {
    connectToAI();
    return () => {
      // Cleanup on unmount
      commandRef.current = null;
    };
  }, [settings.command, settings.commandArgs]);

  const connectToAI = async () => {
    try {
      // Create command for AI process
      const command = Command.create(aiCommand);
      commandRef.current = command;

      // Listen to stdout
      command.stdout.on('data', (line) => {
        handleAIResponse(line);
      });

      // Listen to stderr for errors
      command.stderr.on('data', (line) => {
        console.error('AI stderr:', line);
      });

      // Listen to process close
      command.on('close', (data) => {
        console.log('AI process exited with code:', data.code);
        setIsConnected(false);
      });

      // Listen to errors
      command.on('error', (error) => {
        console.error('AI process error:', error);
        setIsConnected(false);
      });

      // Spawn the process
      await command.spawn();
      setIsConnected(true);

      // Add welcome message
      addMessage('assistant', `Connected to ${aiCommand}. How can I help you with your schedule?`);
    } catch (error) {
      console.error('Failed to connect to AI:', error);
      addMessage('assistant', `Failed to connect to ${aiCommand}. Please ensure it's installed and accessible.`);
    }
  };

  const handleAIResponse = (output: string) => {
    // Parse AI output and add as assistant message
    // TODO: Implement more sophisticated parsing for streaming responses
    if (output.trim()) {
      addMessage('assistant', output);
      setIsProcessing(false);
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = async () => {
    if (!input.trim() || !isConnected || isProcessing) return;

    const userInput = input;

    // Add user message
    addMessage('user', userInput);
    setInput('');
    setIsProcessing(true);

    try {
      // Create a new command instance for this message
      // This approach spawns a new process per message, which works better
      // for Claude Code/Codex that expect single-shot commands
      const helperCommand = Command.create('bash', [
        '-c',
        `echo "${userInput.replace(/"/g, '\\"')}" | ${aiCommand}`
      ]);

      let responseBuffer = '';

      helperCommand.stdout.on('data', (line) => {
        responseBuffer += line + '\n';
      });

      helperCommand.on('close', () => {
        if (responseBuffer.trim()) {
          addMessage('assistant', responseBuffer.trim());
        }
        setIsProcessing(false);
      });

      helperCommand.on('error', (error) => {
        console.error('Command error:', error);
        addMessage('assistant', 'Error: Failed to execute command');
        setIsProcessing(false);
      });

      await helperCommand.spawn();
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage('assistant', 'Error: Failed to send message to AI');
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-color">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <h3 className="font-semibold">AI Assistant</h3>
          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-subtext-color hover:text-default-font"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-subtext-color">
            <Bot className="w-12 h-12 mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm mt-1">Ask me to help with your schedule, tasks, or blocks</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <Avatar className="w-8 h-8 flex-shrink-0">
              {message.role === 'user' ? (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </Avatar>

            <Card className={`flex-1 p-3 ${message.role === 'user' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs text-subtext-color mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </Card>
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <Bot className="w-4 h-4 text-secondary-foreground" />
              </div>
            </Avatar>
            <Card className="flex-1 p-3 bg-secondary/10">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-subtext-color rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-subtext-color rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-subtext-color rounded-full animate-pulse delay-200" />
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-color">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about your schedule, tasks, or blocks..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={!isConnected || isProcessing}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || !isConnected || isProcessing}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-subtext-color mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
