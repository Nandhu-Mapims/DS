import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { clearAuth } from '../api/axios';

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <Button
      variant="outline-danger"
      size="sm"
      onClick={handleLogout}
      className="ds-focus-ring"
      aria-label="Log out"
    >
      Logout
    </Button>
  );
}
