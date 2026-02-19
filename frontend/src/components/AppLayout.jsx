import { Link, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';

export function AppLayout({ children, brandName = 'Discharge Summary', navItems = [], rightSlot }) {
  const location = useLocation();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar expand="lg" className="ds-navbar px-3">
        <Container fluid className="px-0">
          <Navbar.Toggle aria-controls="top-nav" className="me-2" />
          <Navbar.Brand as={Link} to="/" className="text-decoration-none">
            {brandName}
          </Navbar.Brand>
          <Navbar.Collapse id="top-nav">
            <Nav className="me-auto" as="ul">
              {navItems.map((item) => {
                const to = item.to ?? item.href ?? '/';
                const isActive = location.pathname === to;
                return (
                  <Nav.Link
                    key={to}
                    as={Link}
                    to={to}
                    className={isActive ? 'active' : ''}
                  >
                    {item.label}
                  </Nav.Link>
                );
              })}
            </Nav>
            <div className="d-flex align-items-center gap-2">
              {rightSlot}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main
        className="flex-grow-1 overflow-auto ds-main ds-main-content"
        style={{
          minHeight: `calc(100vh - var(--ds-navbar-height, 60px))`,
        }}
      >
        {children}
      </main>
    </div>
  );
}
