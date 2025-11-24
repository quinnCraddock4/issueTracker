import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export type User = {
  _id?: string;
  email: string;
  givenName: string;
  familyName: string;
  fullName?: string;
  role?: string[];
  createdOn?: Date | string;
};

interface UserSummaryProps {
  user: User;
  onClick?: () => void;
}

const UserSummary = ({ user, onClick }: UserSummaryProps) => {
  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  const displayName = user.fullName || `${user.givenName} ${user.familyName}`.trim();

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-accent group animate-in fade-in slide-in-from-left-4"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold group-hover:text-accent transition-colors">
          {displayName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.role && user.role.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.role.map((role, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold shadow-sm transition-all hover:scale-110"
                >
                  {role}
                </span>
              ))}
            </div>
          )}
          {user.createdOn && (
            <p className="text-xs text-muted-foreground pt-1">
              Created: {formatDate(user.createdOn)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSummary;

