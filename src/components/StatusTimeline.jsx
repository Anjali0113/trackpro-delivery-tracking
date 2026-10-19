import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

const STATUSES = ['placed', 'picked', 'in-transit', 'delivered'];
const STATUS_LABELS = {
  placed: 'Order Placed',
  picked: 'Picked Up',
  'in-transit': 'In Transit',
  delivered: 'Delivered'
};

export default function StatusTimeline({ statusLogs = [], currentStatus }) {
  const currentIndex = STATUSES.indexOf(currentStatus);

  return (
    <div className="timeline">
      {STATUSES.map((status, idx) => {
        const log = statusLogs.find(l => l.status === status);
        const isDone = idx < currentIndex || currentStatus === status && idx === currentIndex && status === 'delivered';
        const isActive = status === currentStatus;
        const isPending = idx > currentIndex;

        return (
          <div
            key={status}
            className={`timeline-item ${isDone ? 'done' : isActive ? 'active' : ''}`}
          >
            {idx < STATUSES.length - 1 && <div className="timeline-line" />}
            <div className="timeline-dot">
              {isDone ? <CheckCircle2 size={14} /> : isActive ? <Clock size={14} /> : <Circle size={12} />}
            </div>
            <div className="timeline-content">
              <div className="timeline-title" style={{ color: isPending ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                {STATUS_LABELS[status]}
              </div>
              {log && (
                <>
                  <div className="timeline-time">
                    {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div className="timeline-note">{log.note}</div>
                </>
              )}
              {!log && <div className="timeline-time">Pending</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
