/**
 * Reusable skeleton for list/table rows. Use for loading states.
 */
export function SkeletonLoader({ lines = 5, className = '' }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="ds-skeleton mb-2"
          style={{
            height: 24,
            width: i === (lines - 1) && lines > 2 ? '70%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Table skeleton: header row + N body rows
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="ds-table-wrapper">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} scope="col">
                <span className="ds-skeleton d-inline-block" style={{ width: 60 + ((i % 3) * 20), height: 16 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx}>
                  <span
                    className="ds-skeleton d-inline-block"
                    style={{ width: colIdx === 0 ? 120 : 80, height: 18 }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
