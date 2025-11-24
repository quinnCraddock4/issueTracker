import { useState, useEffect } from 'react';
import type { Bug } from './BugSummary';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface BugEditorProps {
  bug?: Bug;
  onSave: (bug: Bug) => void;
  onCancel: () => void;
}

const BugEditor = ({ bug, onSave, onCancel }: BugEditorProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');

  useEffect(() => {
    if (bug) {
      setTitle(bug.title || '');
      setDescription(bug.description || '');
      setStepsToReproduce(bug.stepsToReproduce || '');
    } else {
      setTitle('');
      setDescription('');
      setStepsToReproduce('');
    }
  }, [bug]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title && description && stepsToReproduce) {
      const bugData: Bug = {
        ...bug,
        title,
        description,
        stepsToReproduce,
        status: bug?.status || 'open',
        classification: bug?.classification || 'unclassified',
        closed: bug?.closed || false,
      };
      onSave(bugData);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{bug ? 'Edit Bug' : 'New Bug'}</CardTitle>
        <CardDescription>
          {bug ? 'Update bug information' : 'Create a new bug report'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter bug title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter bug description"
              required
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stepsToReproduce">Steps to Reproduce *</Label>
            <textarea
              id="stepsToReproduce"
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              placeholder="Enter steps to reproduce the bug"
              required
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BugEditor;

