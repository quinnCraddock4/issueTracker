import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate as NavigateComponent } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import moment from 'moment';
import { Save, User, DoorOpen, DoorClosed, Clock, Code } from 'lucide-react';
import type { Bug } from './BugSummary';
import type { User as UserType } from './UserSummary';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const bugSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  stepsToReproduce: z.string().min(1, 'Steps to reproduce is required'),
});

interface Comment {
  _id: string;
  bugId: string;
  author: string;
  content: string;
  createdAt: string | Date;
}

interface TimeEntry {
  _id: string;
  bugId: string;
  hours: number;
  description?: string;
  createdAt: string | Date;
  createdBy: {
    userId: string;
    email: string;
  };
}

interface BugEditorProps {
  auth: any;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const BugEditor = ({ auth, showError, showSuccess }: BugEditorProps) => {
  const { bugId } = useParams<{ bugId: string }>();
  const navigate = useNavigate();
  const [bug, setBug] = useState<Bug | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [stepsToReproduceError, setStepsToReproduceError] = useState('');
  
  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  
  // Classify
  const [classification, setClassification] = useState('');
  const [updatingClassification, setUpdatingClassification] = useState(false);
  
  // Assign
  const [users, setUsers] = useState<UserType[]>([]);
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [assigning, setAssigning] = useState(false);
  
  // Status
  const [status, setStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Time Tracking
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timeHours, setTimeHours] = useState('');
  const [timeDescription, setTimeDescription] = useState('');
  const [submittingTime, setSubmittingTime] = useState(false);
  
  // Version/Fix Date
  const [version, setVersion] = useState('');
  const [fixDate, setFixDate] = useState('');
  const [updatingVersion, setUpdatingVersion] = useState(false);

  useEffect(() => {
    const fetchBug = async () => {
      if (!bugId || !auth) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const [bugResponse, commentsResponse, usersResponse, timeEntriesResponse] = await Promise.all([
          axios.get(`${API_URL}/bugs/${bugId}`, { withCredentials: true }),
          axios.get(`${API_URL}/bugs/${bugId}/comments`, { withCredentials: true }),
          axios.get(`${API_URL}/users`, { withCredentials: true }),
          axios.get(`${API_URL}/bugs/${bugId}/time`, { withCredentials: true }).catch(() => ({ data: [] }))
        ]);
        
        const bugData = bugResponse.data;
        setBug(bugData);
        setTitle(bugData.title || '');
        setDescription(bugData.description || '');
        setStepsToReproduce(bugData.stepsToReproduce || '');
        setClassification(bugData.classification || 'unclassified');
        setStatus(bugData.closed ? 'closed' : 'open');
        setAssignedToUserId(bugData.assignedTo?.userId || '');
        setVersion(bugData.version || '');
        setFixDate(bugData.fixDate ? new Date(bugData.fixDate).toISOString().split('T')[0] : '');
        
        // Sort comments oldest to newest
        const sortedComments = (commentsResponse.data || []).sort((a: Comment, b: Comment) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB;
        });
        setComments(sortedComments);
        
        setUsers(usersResponse.data || []);
        setTimeEntries(timeEntriesResponse.data || []);
      } catch (err: any) {
        let errorMessage = 'Failed to load bug';
        
        if (err?.response?.data?.error) {
          if (typeof err.response.data.error === 'string') {
            errorMessage = err.response.data.error;
          } else if (err.response.data.error?.details) {
            // Extract error messages from Joi validation details array
            const details = err.response.data.error.details;
            if (Array.isArray(details)) {
              errorMessage = details.map((d: any) => d.message).join('; ');
            } else {
              errorMessage = String(details);
            }
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

    fetchBug();
  }, [bugId, auth, showError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setTitleError('');
    setDescriptionError('');
    setStepsToReproduceError('');
    setError('');

    const result = bugSchema.safeParse({
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

    if (!bugId) {
      setError('Bug ID is missing');
      return;
    }

    try {
      await axios.patch(`${API_URL}/bugs/${bugId}`, {
        title,
        description,
        stepsToReproduce
      }, {
        withCredentials: true
      });

      showSuccess('Bug updated successfully!');
      setError('');
      // Refresh bug data
      const response = await axios.get(`${API_URL}/bugs/${bugId}`, {
        withCredentials: true
      });
      setBug(response.data);
    } catch (err: any) {
      let errorMessage = 'Failed to update bug';
      
      if (err?.response?.data?.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error?.details) {
          // Extract error messages from Joi validation details array
          const details = err.response.data.error.details;
          if (Array.isArray(details)) {
            errorMessage = details.map((d: any) => d.message).join('; ');
          } else {
            errorMessage = String(details);
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !bugId) return;

    setPostingComment(true);
    try {
      await axios.post(`${API_URL}/bugs/${bugId}/comments`, {
        author: auth.email || 'Unknown',
        content: commentContent
      }, {
        withCredentials: true
      });

      setCommentContent('');
      showSuccess('Comment posted successfully!');
      
      // Refresh comments
      const response = await axios.get(`${API_URL}/bugs/${bugId}/comments`, {
        withCredentials: true
      });
      const sortedComments = (response.data || []).sort((a: Comment, b: Comment) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
      setComments(sortedComments);
    } catch (err: any) {
      let errorMessage = 'Failed to post comment';
      if (err?.response?.data?.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error?.details) {
          // Extract error messages from Joi validation details array
          const details = err.response.data.error.details;
          errorMessage = Array.isArray(details) 
            ? details.map((d: any) => d.message).join('; ')
            : String(details);
        }
      }
      showError(errorMessage);
    } finally {
      setPostingComment(false);
    }
  };

  const handleClassify = async () => {
    if (!bugId || !classification) return;

    setUpdatingClassification(true);
    try {
      await axios.patch(`${API_URL}/bugs/${bugId}/classify`, {
        classification
      }, {
        withCredentials: true
      });

      showSuccess('Bug classification updated!');
      const response = await axios.get(`${API_URL}/bugs/${bugId}`, {
        withCredentials: true
      });
      setBug(response.data);
    } catch (err: any) {
      let errorMessage = 'Failed to classify bug';
      if (err?.response?.data?.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error?.details) {
          // Extract error messages from Joi validation details array
          const details = err.response.data.error.details;
          errorMessage = Array.isArray(details) 
            ? details.map((d: any) => d.message).join('; ')
            : String(details);
        }
      }
      showError(errorMessage);
    } finally {
      setUpdatingClassification(false);
    }
  };

  const handleAssign = async () => {
    if (!bugId) return;

    setAssigning(true);
    try {
      const selectedUser = users.find(u => u._id === assignedToUserId);
      await axios.patch(`${API_URL}/bugs/${bugId}/assign`, {
        assignedToUserId: assignedToUserId || null,
        assignedToUserName: selectedUser ? (selectedUser.fullName || `${selectedUser.givenName} ${selectedUser.familyName}`.trim()) : null
      }, {
        withCredentials: true
      });

      showSuccess('Bug assignment updated!');
      const response = await axios.get(`${API_URL}/bugs/${bugId}`, {
        withCredentials: true
      });
      setBug(response.data);
      setAssignedToUserId(response.data.assignedTo?.userId || '');
    } catch (err: any) {
      let errorMessage = 'Failed to assign bug';
      if (err?.response?.data?.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error?.details) {
          // Extract error messages from Joi validation details array
          const details = err.response.data.error.details;
          errorMessage = Array.isArray(details) 
            ? details.map((d: any) => d.message).join('; ')
            : String(details);
        }
      }
      showError(errorMessage);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!bugId) return;

    setUpdatingStatus(true);
    try {
      await axios.patch(`${API_URL}/bugs/${bugId}/close`, {
        closed: status === 'closed'
      }, {
        withCredentials: true
      });

      showSuccess(`Bug ${status === 'closed' ? 'closed' : 'opened'}!`);
      const response = await axios.get(`${API_URL}/bugs/${bugId}`, {
        withCredentials: true
      });
      setBug(response.data);
      setStatus(response.data.closed ? 'closed' : 'open');
    } catch (err: any) {
      let errorMessage = 'Failed to update bug status';
      if (err?.response?.data?.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error?.details) {
          // Extract error messages from Joi validation details array
          const details = err.response.data.error.details;
          errorMessage = Array.isArray(details) 
            ? details.map((d: any) => d.message).join('; ')
            : String(details);
        }
      }
      showError(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubmitTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugId || !timeHours || parseFloat(timeHours) <= 0) return;

    setSubmittingTime(true);
    try {
      await axios.post(`${API_URL}/bugs/${bugId}/time`, {
        hours: parseFloat(timeHours),
        description: timeDescription
      }, {
        withCredentials: true
      });

      setTimeHours('');
      setTimeDescription('');
      showSuccess('Time entry added successfully!');
      
      // Refresh time entries
      const response = await axios.get(`${API_URL}/bugs/${bugId}/time`, {
        withCredentials: true
      });
      setTimeEntries(response.data || []);
    } catch (err: any) {
      let errorMessage = 'Failed to submit time entry';
      if (err?.response?.data?.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error?.details) {
          // Extract error messages from Joi validation details array
          const details = err.response.data.error.details;
          errorMessage = Array.isArray(details) 
            ? details.map((d: any) => d.message).join('; ')
            : String(details);
        }
      }
      showError(errorMessage);
    } finally {
      setSubmittingTime(false);
    }
  };

  const handleUpdateVersion = async () => {
    if (!bugId) return;

    setUpdatingVersion(true);
    try {
      await axios.patch(`${API_URL}/bugs/${bugId}/version`, {
        version: version || null,
        fixDate: fixDate || null
      }, {
        withCredentials: true
      });

      showSuccess('Version and fix date updated!');
      const response = await axios.get(`${API_URL}/bugs/${bugId}`, {
        withCredentials: true
      });
      setBug(response.data);
      setVersion(response.data.version || '');
      setFixDate(response.data.fixDate ? new Date(response.data.fixDate).toISOString().split('T')[0] : '');
    } catch (err: any) {
      let errorMessage = 'Failed to update version/fix date';
      if (err?.response?.data?.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error?.details) {
          // Extract error messages from Joi validation details array
          const details = err.response.data.error.details;
          errorMessage = Array.isArray(details) 
            ? details.map((d: any) => d.message).join('; ')
            : String(details);
        }
      }
      showError(errorMessage);
    } finally {
      setUpdatingVersion(false);
    }
  };

  const isDeveloper = auth?.role && (
    Array.isArray(auth.role) 
      ? auth.role.includes('Developer')
      : auth.role === 'Developer'
  );

  if (!auth) {
    return <NavigateComponent to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !bug) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg mb-2">{error}</p>
        <Button onClick={() => navigate('/bug/list')} variant="outline">
          Back to Bug List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Bug Edit Form */}
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 bg-card relative z-10">
        <CardHeader>
          <CardTitle>Edit Bug</CardTitle>
          <CardDescription>Update bug information</CardDescription>
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
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/bug/list')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Classify Bug */}
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 bg-card relative z-10">
        <CardHeader>
          <CardTitle>Classify Bug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Select value={classification} onValueChange={setClassification}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unclassified">Unclassified</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="unapproved">Unapproved</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleClassify} disabled={updatingClassification}>
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assign User */}
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 bg-card relative z-10">
        <CardHeader>
          <CardTitle>Assign User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Select value={assignedToUserId || 'unassigned'} onValueChange={(value) => setAssignedToUserId(value === 'unassigned' ? '' : value)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id || 'unassigned'}>
                    {user.fullName || `${user.givenName} ${user.familyName}`.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssign} disabled={assigning}>
              <User className="mr-2 h-4 w-4" /> Assign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Toggle */}
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 bg-card relative z-10">
        <CardHeader>
          <CardTitle>Bug Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleStatusUpdate} disabled={updatingStatus}>
              {status === 'closed' ? (
                <DoorClosed className="mr-2 h-4 w-4" />
              ) : (
                <DoorOpen className="mr-2 h-4 w-4" />
              )}
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Tracking Section - Only for Developers */}
      {isDeveloper && (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 bg-card relative z-10">
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
            <CardDescription>Track hours spent on this bug</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Submit Time Form */}
            <form onSubmit={handleSubmitTime} className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Label htmlFor="timeHours">Hours</Label>
                  <Input
                    id="timeHours"
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="0.0"
                    value={timeHours}
                    onChange={(e) => setTimeHours(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="timeDescription">Description (optional)</Label>
                  <Input
                    id="timeDescription"
                    type="text"
                    placeholder="What did you work on?"
                    value={timeDescription}
                    onChange={(e) => setTimeDescription(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={submittingTime || !timeHours || parseFloat(timeHours) <= 0}>
                    <Clock className="mr-2 h-4 w-4" /> Submit
                  </Button>
                </div>
              </div>
            </form>

            {/* Time Entries List */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Time Entries</h4>
              {timeEntries.length === 0 ? (
                <p className="text-muted-foreground text-sm">No time entries yet.</p>
              ) : (
                <div className="space-y-2">
                  {timeEntries.map((entry) => (
                    <div key={entry._id} className="border-b pb-2 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="font-semibold text-sm">{entry.hours} hours</span>
                          {entry.description && (
                            <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block">
                            {entry.createdBy?.email || 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {moment(entry.createdAt).format('MMM D, YYYY h:mm A')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <p className="text-sm font-semibold">
                      Total: {timeEntries.reduce((sum, entry) => sum + entry.hours, 0).toFixed(2)} hours
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version/Fix Date Section - Only for Developers */}
      {isDeveloper && (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 bg-card relative z-10">
          <CardHeader>
            <CardTitle>Version & Fix Date</CardTitle>
            <CardDescription>Track software version and fix date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Software Version</Label>
                <Input
                  id="version"
                  type="text"
                  placeholder="e.g., 1.2.3"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fixDate">Fix Date</Label>
                <Input
                  id="fixDate"
                  type="date"
                  value={fixDate}
                  onChange={(e) => setFixDate(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleUpdateVersion} disabled={updatingVersion}>
              <Code className="mr-2 h-4 w-4" /> Update
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 bg-card relative z-10">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Post Comment Form */}
          <form onSubmit={handlePostComment} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Add a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={postingComment || !commentContent.trim()}>
              Post
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {moment(comment.createdAt).fromNow()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BugEditor;
