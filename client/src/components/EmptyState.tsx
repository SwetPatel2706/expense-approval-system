import { ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: string;
    action?: ReactNode;
}

export const EmptyState = ({
    title,
    description,
    icon = 'inbox',
    action
}: EmptyStateProps) => {
    return (
        <div className="empty-state">
            <div className="empty-icon">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <h3 className="empty-title">{title}</h3>
            <p className="empty-description">{description}</p>
            {action && <div className="empty-action">{action}</div>}
        </div>
    );
};
