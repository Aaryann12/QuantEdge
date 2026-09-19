import React from 'react';
import { History, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import './HistoryTable.css';

export default function HistoryTable() {
  const { navigateToPredict } = useStock();

  const historyData = [
    { date: '08 Aug 2026', symbol: 'RELIANCE', predictedReturn: '+0.34%', actualReturn: '+0.38%', predictedDir: 'UP', actualDir: 'UP', accuracy: 'HIT', confidence: '56%' },
    { date: '08 Aug 2026', symbol: 'HDFCBANK', predictedReturn: '+0.31%', actualReturn: '+0.29%', predictedDir: 'UP', actualDir: 'UP', accuracy: 'HIT', confidence: '55%' },
    { date: '07 Aug 2026', symbol: 'INFY', predictedReturn: '+0.26%', actualReturn: '+0.32%', predictedDir: 'UP', actualDir: 'UP', accuracy: 'HIT', confidence: '53%' },
    { date: '07 Aug 2026', symbol: 'TCS', predictedReturn: '+0.24%', actualReturn: '-0.10%', predictedDir: 'UP', actualDir: 'DOWN', accuracy: 'MISS', confidence: '52%' },
    { date: '06 Aug 2026', symbol: 'ICICIBANK', predictedReturn: '+0.28%', actualReturn: '+0.30%', predictedDir: 'UP', actualDir: 'UP', accuracy: 'HIT', confidence: '54%' },
  ];

  return (
    <div className="glass-card history-card">
      <div className="card-header-flex mb-4">
        <div>
          <h2 className="page-title flex-center gap-2">
            <History size={24} className="text-green" />
            <span>Prediction History</span>
          </h2>
          <p className="page-subtitle">Track historical AI model predictions vs actual market outcomes</p>
        </div>
        <span className="badge badge-green">Overall Accuracy: 80%</span>
      </div>

      <div className="stock-table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Stock</th>
              <th>Predicted Return</th>
              <th>Actual Return</th>
              <th>Predicted Dir</th>
              <th>Outcome Status</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((row, i) => {
              const isHit = row.accuracy === 'HIT';
              return (
                <tr key={i} className="stock-row" onClick={() => navigateToPredict(row.symbol)}>
                  <td className="text-muted font-mono">{row.date}</td>
                  <td className="font-bold">{row.symbol}</td>
                  <td className="text-green font-bold">{row.predictedReturn}</td>
                  <td className={row.actualReturn.startsWith('+') ? 'text-green font-bold' : 'text-red font-bold'}>
                    {row.actualReturn}
                  </td>
                  <td>
                    <span className="direction-up flex-center gap-1">
                      <ArrowUpRight size={14} /> {row.predictedDir}
                    </span>
                  </td>
                  <td>
                    {isHit ? (
                      <span className="badge badge-green flex-center gap-1">
                        <CheckCircle2 size={14} /> HIT
                      </span>
                    ) : (
                      <span className="badge badge-red flex-center gap-1">
                        <XCircle size={14} /> MISS
                      </span>
                    )}
                  </td>
                  <td className="font-bold">{row.confidence}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
