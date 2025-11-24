import BugSummary from './BugSummary';
import type { Bug } from './BugSummary';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface BugListProps {
  bugs: Bug[];
  onOpenEditor: (bug?: Bug) => void;
}

const BugList = ({ bugs, onOpenEditor }: BugListProps) => {

  const handleBugClick = (bug: Bug) => {
    onOpenEditor(bug);
  };

  const handleNewBug = () => {
    onOpenEditor();
  };

  return (
    <Card className="w-full shadow-lg border-2">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Bug List</CardTitle>
          <Button 
            onClick={handleNewBug}
            className="shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold"
          >
            New Bug
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bugs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-2">
                No bugs found.
              </p>
              <p className="text-sm text-muted-foreground">
                Click "New Bug" to create one.
              </p>
            </div>
          ) : (
            bugs.map((bug, index) => (
              <div
                key={bug._id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-in fade-in slide-in-from-left-4"
              >
                <BugSummary
                  bug={bug}
                  onClick={() => handleBugClick(bug)}
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BugList;

