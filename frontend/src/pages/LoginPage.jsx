import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Form } from 'react-bootstrap';
import { setStoredToken, setStoredUser } from '../api/axios';
import { login } from '../api/authApi';
import { useToast } from '../components/ToastProvider';
import { SubmitButton } from '../components/SubmitButton';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      if (data?.token) {
        setStoredToken(data.token);
        if (data.user) setStoredUser(data.user);
        toast.success('Logged in');
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Check backend is running and database is configured.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <Card
        className="ds-card border-0 shadow"
        style={{
          maxWidth: 420,
          width: '100%',
          borderRadius: 'var(--ds-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h1
              className="h4 fw-bold mb-2"
              style={{ fontFamily: 'var(--ds-font-heading)', color: 'var(--ds-text)' }}
            >
              Discharge Summary
            </h1>
            <p className="text-muted small mb-0">Sign in to continue</p>
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                autoComplete="email"
                className="ds-focus-ring"
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="ds-focus-ring"
                required
              />
            </Form.Group>
            <SubmitButton type="submit" variant="primary" className="w-100 py-2" loading={loading}>
              Sign in
            </SubmitButton>
          </Form>
          <div
            className="mt-4 p-3 rounded-3 small text-muted"
            style={{ background: 'var(--ds-border-subtle)', fontSize: '0.8rem' }}
          >
            <strong className="text-body">Demo:</strong> doctor@hospital.com / doctor123 · chief@hospital.com / chief123
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
