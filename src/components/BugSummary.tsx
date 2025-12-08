import moment from 'moment';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';

export type Bug = {
  _id?: string;
  title: string;
  description?: string;
  stepsToReproduce?: string;
  status?: string;
  classification?: string;
  closed?: boolean;
  createdOn?: Date | string;
  createdBy?: {
    userId: string;
    userName?: string;
  };
  createdByUserName?: string;
  assignedTo?: {
    userId: string;
    userName?: string;
  };
  assignedToUserName?: string;
};

interface BugSummaryProps {
  bug: Bug;
}

const BugSummary = ({ bug }: BugSummaryProps) => {
  const getClassificationBadgeClass = (classification?: string) => {
    switch (classification) {
      case 'approved':
        return 'bg-primary text-primary-foreground';
      case 'unapproved':
        return 'bg-destructive text-destructive-foreground';
      case 'duplicate':
        return 'bg-destructive text-destructive-foreground';
      case 'unclassified':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusBadgeClass = (closed?: boolean) => {
    return closed 
      ? 'bg-destructive text-destructive-foreground'
      : 'bg-primary text-primary-foreground';
  };

  const assignedToName = bug.assignedTo?.userName || bug.assignedToUserName || 'Unassigned';
  const createdByName = bug.createdBy?.userName || bug.createdByUserName || 'Unknown';

  return (
    <Link to={`/bug/${bug._id}`}>
      <Card 
        className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-primary group animate-in fade-in slide-in-from-left-4 mb-3 bg-card relative z-10"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
            {bug.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bug.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {bug.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Assigned to:</span> {assignedToName}
            </p>
            <div className="flex flex-wrap gap-2">
              {bug.classification && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all hover:scale-110 ${getClassificationBadgeClass(bug.classification)}`}>
                  {bug.classification}
                </span>
              )}
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all hover:scale-110 ${getStatusBadgeClass(bug.closed)}`}>
                {bug.closed ? 'Closed' : 'Open'}
              </span>
              {bug.status && (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground shadow-sm transition-all hover:scale-110">
                  {bug.status}
                </span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground pt-2 border-t">
          {bug.createdOn ? (
            <span>
              Created {moment(bug.createdOn).fromNow()} by {createdByName}
            </span>
          ) : (
            <span>Created by {createdByName}</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default BugSummary;
