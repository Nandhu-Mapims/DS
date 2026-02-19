import { Link } from 'react-router-dom';

/**
 * Page header with optional breadcrumb, title, and description.
 * @param {Array<{ to?: string, label: string }>} breadcrumbs - Optional. Last item is current page (no link).
 * @param {string} title
 * @param {string} [description] - Optional muted description below title.
 * @param {React.ReactNode} [action] - Optional right-side action (e.g. button).
 */
export function PageHeader({ breadcrumbs = [], title, description, action }) {
  return (
    <header className="ds-page-header">
      <div className="ds-page-header__inner">
        <div className="ds-page-header__text">
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="ds-page-header__breadcrumb">
              {breadcrumbs.map((item, i) => (
                <span key={i}>
                  {i > 0 && <span className="ds-page-header__sep">/</span>}
                  {item.to ? (
                    <Link to={item.to} className="ds-page-header__link">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="ds-page-header__title">{title}</h1>
          {description && <p className="ds-page-header__desc">{description}</p>}
        </div>
        {action && <div className="ds-page-header__action">{action}</div>}
      </div>
    </header>
  );
}
