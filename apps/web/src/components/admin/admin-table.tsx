'use client';

import { ReactNode } from 'react';

type AdminTableProps = {
  columns: string[];
  rows: Array<Array<ReactNode>>;
  emptyText: string;
};

export function AdminTable({ columns, rows, emptyText }: AdminTableProps) {
  if (!rows.length) {
    return (
      <div className="panel-card">
        <p className="muted-text">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${String(row[0])}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
