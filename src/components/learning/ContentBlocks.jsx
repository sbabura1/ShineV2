import { useEffect, useState } from 'react';
import { api, segment } from '../../api/client';

function SourceImage({ block, runId }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setFailed(false);
    api(`/v1/runs/${segment(runId)}/assets/${segment(block.assetId)}`).then(result => { if (active) setUrl(result.url); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [runId, block.assetId, retry]);
  if (failed) return <div role="alert">This graph could not be loaded. <button type="button" className="btn secondary" onClick={() => setRetry(value => value + 1)}>Retry graph</button></div>;
  return url ? <img className="source-graph" src={url} alt={block.alt || 'Assessment graph'} onError={() => setFailed(true)} /> : <p role="status">Loading graph…</p>;
}

function SourceTable({ block }) {
  const width = Math.max(...block.rows.map(row => row.length));
  return <div className="source-table-scroll"><table className="source-table">
    {block.title && <caption>{block.title}</caption>}
    <tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, col) => {
      const Cell = index < (block.headerRowCount || 0) ? 'th' : 'td';
      return <Cell key={col} colSpan={row.length === 1 ? width : undefined}>{cell}</Cell>;
    })}</tr>)}</tbody>
  </table></div>;
}

function DotPlot({ block }) {
  const min = block.xAxis.minimum;
  const max = block.xAxis.maximum;
  const x = value => 55 + (value - min) / (max - min) * 590;
  return <figure className="source-chart"><figcaption>{block.title}</figcaption>
    <svg viewBox="0 0 700 210" role="img" aria-label={block.title}>
      <line x1="55" y1="155" x2="645" y2="155" stroke="currentColor" />
      {Array.from({ length: 6 }, (_, index) => min + (max - min) * index / 5).map(value => <g key={value}><line x1={x(value)} x2={x(value)} y1="155" y2="160" stroke="currentColor" /><text x={x(value)} y="180" textAnchor="middle">{value}</text></g>)}
      {block.series.map((series, group) => {
        const counts = {};
        return <g key={series.id}><text x="42" y={block.series.length > 1 ? 65 + group * 55 : 125} textAnchor="end">{block.series.length > 1 ? series.label : ''}</text>
          {series.values.map((value, index) => {
            const stack = counts[value] || 0; counts[value] = stack + 1;
            const y = block.series.length > 1 ? 60 + group * 55 : 130 - stack * 22;
            return <g key={index}><circle cx={x(value)} cy={y} r="5" fill="currentColor" /><text x={x(value)} y={y - 10} textAnchor="middle">{value}</text></g>;
          })}</g>;
      })}
      <text x="350" y="205" textAnchor="middle">{block.xAxis.label}</text>
    </svg>
    <details><summary>View graph values</summary>{block.series.map(series => <p key={series.id}>{series.label}: {series.values.join(', ')}</p>)}</details>
  </figure>;
}

export default function ContentBlocks({ blocks = [], runId }) {
  return blocks.map((block, index) => {
    if (block.type === 'paragraph') return <p key={index} className="source-paragraph">{block.text}</p>;
    if (block.type === 'list') return <ul key={index}>{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
    if (block.type === 'table') return <SourceTable key={index} block={block} />;
    if (block.type === 'image') return <SourceImage key={index} block={block} runId={runId} />;
    if (block.type === 'chart') return <DotPlot key={index} block={block} />;
    return <p role="alert" key={index}>This content format is not supported.</p>;
  });
}
