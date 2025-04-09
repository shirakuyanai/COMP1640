import { Navigate } from 'react-router-dom';
import { useGlobalState } from '@/misc/GlobalStateContext';
import { ReactNode, useEffect, useState } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { currentUser, isLoading, authToken } = useGlobalState();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Only stop checking once we have loaded the user or know there's no token
    if (!isLoading || !authToken) {
      setChecking(false);
    }
  }, [isLoading, authToken]);

  if (checking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no user or token, redirect to login
  if (!currentUser || !authToken) {
    return <Navigate to="/login" replace />;
  }

  // If user is not admin, redirect based on role
  if (currentUser.role !== 'system admin' && currentUser.role !== 'admin') {
    if (currentUser.role === 'staff') {
      return <Navigate to="/staff" replace />;
    } else {
      // Students or other roles
      return <Navigate to="/" replace />;
    }
  }

  // If user is admin, render the children
  return <>{children}</>;
};

export default AdminRoute; 