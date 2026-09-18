import { caseRows } from '../../data';

const headings = ['Incident', 'District', 'Type', 'Calls', 'Arrests', 'Rate / 1k'];

export default function DataTable() {
  return (
    <div className="data-lab">
      <span className="eyebrow">Data lab</span>
      <h2>Audit the incident log</h2>
      <p>Before you interpret the rate, inspect the quality of the rows.</p>
      <div className="table-wrap">
        <table>
          <thead><tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead>
          <tbody>
            {caseRows.map((row, index) => (
              <tr key={`${row[0]}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td className={index === 2 ? 'warning-cell' : index === 4 || (index === 5 && cellIndex === 2) ? 'issue-cell' : ''} key={`${cell}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-notes"><span><i className="issue-dot" /> Outlier detected</span><span><i className="warn-dot" /> Duplicate / missing value</span></div>
    </div>
  );
}
