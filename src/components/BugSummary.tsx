import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export type Bug = {
  _id?: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  status?: string;
  classification?: string;
  closed?: boolean;
  createdOn?: Date | string;
  createdBy?: {
    userId: string;
    userName?: string;
  };
  assignedTo?: {
    userId: string;
    userName?: string;
  };
};

interface BugSummaryProps {
  bug: Bug;
  onClick?: () => void;
}

const BugSummary = ({ bug, onClick }: BugSummaryProps) => {
  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-primary group animate-in fade-in slide-in-from-left-4"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
          {bug.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {bug.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all hover:scale-110 ${
              bug.closed 
                ? 'bg-destructive text-destructive-foreground' 
                : 'bg-primary text-primary-foreground'
            }`}>
              {bug.closed ? 'Closed' : 'Open'}
            </span>
            {bug.classification && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground shadow-sm transition-all hover:scale-110">
                {bug.classification}
              </span>
            )}
            {bug.status && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground shadow-sm transition-all hover:scale-110">
                {bug.status}
              </span>
            )}
          </div>
          {bug.createdOn && (
            <p className="text-xs text-muted-foreground pt-1">
              Created: {formatDate(bug.createdOn)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BugSummary;

