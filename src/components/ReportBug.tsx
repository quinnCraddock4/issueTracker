import { useState } from 'react';
import { useNavigate, Navigate as NavigateComponent } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import { Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const reportBugSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  stepsToReproduce: z.string().min(1, 'Steps to reproduce is required'),
});

interface ReportBugProps {
  auth: any;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const ReportBug = ({ auth, showError, showSuccess }: ReportBugProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [stepsToReproduceError, setStepsToReproduceError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setTitleError('');
    setDescriptionError('');
    setStepsToReproduceError('');
    setError('');

    const result = reportBugSchema.safeParse({
      title,
      description,
      stepsToReproduce,
    });

    if (!result.success) {
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        if (field === 'title') {
          setTitleError(err.message);
        } else if (field === 'description') {
          setDescriptionError(err.message);
        } else if (field === 'stepsToReproduce') {
          setStepsToReproduceError(err.message);
        }
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/bugs`, {
        title,
        description,
        stepsToReproduce
      }, {
        withCredentials: true
      });

      showSuccess('Bug reported successfully!');
      navigate(`/bug/${response.data.bugId}`);
    } catch (err: any) {
      let errorMessage = 'Failed to report bug';
      
      if (err?.response?.data?.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error?.details) {
          errorMessage = err.response.data.error.details;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return <NavigateComponent to="/login" replace />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="w-full shadow-lg border-2 bg-card relative z-10">
        <CardHeader>
          <CardTitle>Report Bug</CardTitle>
          <CardDescription>Create a new bug report</CardDescription>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter bug title"
              className={titleError ? 'border-red-500' : ''}
            />
            {titleError && <p className="text-sm text-red-500">{titleError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter bug description"
              className={descriptionError ? 'border-red-500' : ''}
            />
            {descriptionError && <p className="text-sm text-red-500">{descriptionError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="stepsToReproduce">Steps to Reproduce *</Label>
            <Textarea
              id="stepsToReproduce"
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              placeholder="Enter steps to reproduce the bug"
              className={stepsToReproduceError ? 'border-red-500' : ''}
            />
            {stepsToReproduceError && <p className="text-sm text-red-500">{stepsToReproduceError}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" /> Report Bug
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/bug/list')}>
              Cancel
            </Button>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportBug;

