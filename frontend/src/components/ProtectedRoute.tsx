import { Navigate } from 'react-router';
import { useAuth } from '../context/authContext';
import LoadingSpinner from './Loader';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isLoading, user } = useAuth();
    const [timeoutOccurred, setTimeoutOccurred] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoading) {
                setTimeoutOccurred(true);
            }
        }, 10000); 

        return () => clearTimeout(timer);
    }, [isLoading]);

    if (isLoading && !timeoutOccurred) {
        return <LoadingSpinner message="Loading protected page.." />;
    }

    if (timeoutOccurred || !user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;