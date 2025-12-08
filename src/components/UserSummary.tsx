import moment from 'moment';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';

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
}

const UserSummary = ({ user }: UserSummaryProps) => {
  const displayName = user.fullName || `${user.givenName} ${user.familyName}`.trim();
  
  // Ensure role is always an array
  const roles = Array.isArray(user.role) 
    ? user.role 
    : (user.role ? [user.role] : []);

  return (
    <Link to={`/user/${user._id}`}>
      <Card 
        className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-accent group animate-in fade-in slide-in-from-left-4 mb-3 bg-card relative z-10"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold group-hover:text-accent transition-colors">
            {displayName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {roles.map((role, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-sm transition-all hover:scale-110"
                  >
                    {role}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold shadow-sm transition-all hover:scale-110">
                  No role
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground pt-2 border-t">
          {user.createdOn ? (
            <span>Registered {moment(user.createdOn).fromNow()}</span>
          ) : (
            <span>Registration date unknown</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default UserSummary;
