import UserSummary from './UserSummary';
import type { User } from './UserSummary';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface UserListProps {
  users: User[];
  onOpenEditor: (user?: User) => void;
}

const UserList = ({ users, onOpenEditor }: UserListProps) => {

  const handleUserClick = (user: User) => {
    onOpenEditor(user);
  };

  const handleNewUser = () => {
    onOpenEditor();
  };

  return (
    <Card className="w-full shadow-lg border-2">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">User List</CardTitle>
          <Button 
            onClick={handleNewUser}
            className="shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold"
          >
            New User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-2">
                No users found.
              </p>
              <p className="text-sm text-muted-foreground">
                Click "New User" to create one.
              </p>
            </div>
          ) : (
            users.map((user, index) => (
              <div
                key={user._id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-in fade-in slide-in-from-left-4"
              >
                <UserSummary
                  user={user}
                  onClick={() => handleUserClick(user)}
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;

