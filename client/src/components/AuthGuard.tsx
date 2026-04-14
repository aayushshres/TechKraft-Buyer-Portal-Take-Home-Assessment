import { useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useUser } from '../context/UserContext';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    authApi
      .me()
      .then((u) => {
        setUser(u);
        setVerified(true);
        setChecking(false);
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, [navigate, setUser]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!verified) return null;

  return <>{children}</>;
}
