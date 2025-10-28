import { useState } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

export default function ComponentTest() {
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">shadcn/ui Component Test</h1>
          <p className="text-muted-foreground">
            Testing the newly installed primitive components
          </p>
        </div>

        {/* Button variants */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        {/* Input component */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Input</h2>
          <div className="max-w-sm space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input id="disabled" disabled placeholder="Disabled input" />
            </div>
          </div>
        </section>

        {/* Select component */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Select</h2>
          <div className="max-w-sm">
            <Label htmlFor="framework">Select a framework</Label>
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger id="framework">
                <SelectValue placeholder="Choose a framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
                <SelectItem value="svelte">Svelte</SelectItem>
              </SelectContent>
            </Select>
            {selectedValue && (
              <p className="mt-2 text-sm text-muted-foreground">
                Selected: {selectedValue}
              </p>
            )}
          </div>
        </section>

        {/* Dialog component */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Dialog</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This is a test dialog component. It demonstrates the modal
                  functionality with proper accessibility features.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline">Cancel</Button>
                <Button>Confirm</Button>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Summary */}
        <section className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-2">✅ All Components Working</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Button - All variants and sizes</li>
            <li>Input - Text, email, password inputs with labels</li>
            <li>Label - Accessible form labels</li>
            <li>Dialog - Modal with proper accessibility</li>
            <li>Select - Dropdown with multiple options</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
