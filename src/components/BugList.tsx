import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import BugSummary from './BugSummary';
import type { Bug } from './BugSummary';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface BugListProps {
  auth: any;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const BugList = ({ auth, showError }: BugListProps) => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search state
  const [keywords, setKeywords] = useState('');
  const [classification, setClassification] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [minAge, setMinAge] = useState<string>('');
  const [closed, setClosed] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const fetchBugs = async () => {
    if (!auth) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (keywords) params.append('keywords', keywords);
      if (classification && classification !== 'all') params.append('classification', classification);
      if (maxAge) params.append('maxAge', maxAge);
      if (minAge) params.append('minAge', minAge);
      // If checkbox is unchecked, only show open bugs (closed=false)
      // If checkbox is checked, don't send closed parameter to show all bugs
      if (!closed) {
        params.append('closed', 'false');
      }
      if (sortBy) params.append('sortBy', sortBy);
      // Request a large page size to get all bugs (or implement proper pagination later)
      params.append('pageSize', '1000');
      params.append('pageNumber', '1');
      
      const response = await axios.get(`${API_URL}/bugs?${params.toString()}`, {
        withCredentials: true
      });
      
      // API returns array directly
      const bugsData = Array.isArray(response.data) ? response.data : [];
      
      setBugs(bugsData);
    } catch (err: any) {
      let errorMessage = 'Failed to load bugs';
      
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

  useEffect(() => {
    fetchBugs();
  }, [auth, showError]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBugs();
  };

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-4">
      <Card className="w-full shadow-lg border-2 bg-card relative z-10">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Bug List</CardTitle>
            <Link to="/bug/report">
              <Button>Report Bug</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Keywords Search */}
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="text"
                placeholder="Search keywords..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>

            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Classification */}
              <div className="space-y-2">
                <Label>Classification</Label>
                <Select value={classification || 'all'} onValueChange={(value) => setClassification(value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classifications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classifications</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="unapproved">Unapproved</SelectItem>
                    <SelectItem value="duplicate">Duplicate</SelectItem>
                    <SelectItem value="unclassified">Unclassified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Age */}
              <div className="space-y-2">
                <Label>Max Age (days)</Label>
                <Input
                  type="number"
                  placeholder="Max age"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                />
              </div>

              {/* Min Age */}
              <div className="space-y-2">
                <Label>Min Age (days)</Label>
                <Input
                  type="number"
                  placeholder="Min age"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                />
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="assignedTo">Assigned To</SelectItem>
                    <SelectItem value="createdBy">Reported By</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Closed Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="closed"
                checked={closed}
                onCheckedChange={(checked) => setClosed(checked === true)}
              />
              <Label htmlFor="closed" className="cursor-pointer">
                Include closed bugs
              </Label>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bug Results */}
      <Card className="w-full shadow-lg border-2 bg-card relative z-10">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg mb-2">{error}</p>
              <p className="text-muted-foreground text-sm">Please try refreshing the page.</p>
            </div>
          ) : bugs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-2">
                No bugs found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bugs.map((bug, index) => (
                <div
                  key={bug._id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-in fade-in slide-in-from-left-4"
                >
                  <BugSummary bug={bug} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BugList;
