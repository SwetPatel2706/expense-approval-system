import clsx from 'clsx';
import './StatusBadge.css';

interface StatusBadgeProps {
    status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const normalizedStatus = status.toUpperCase();

    let variantClass = 'badge-draft';
    let label = status.replace(/_/g, ' ');

    switch (normalizedStatus) {
        case 'APPROVED':
            variantClass = 'badge-approved';
            break;
        case 'REJECTED':
            variantClass = 'badge-rejected';
            break;
        case 'IN_REVIEW':
        case 'PENDING':
            variantClass = 'badge-in_review'; // Blue style
            break;
        case 'DRAFT':
        case 'NOT_SUBMITTED':
        case 'PENDING_SUBMISSION':
            variantClass = 'badge-draft';
            label = normalizedStatus === 'PENDING_SUBMISSION' || normalizedStatus === 'NOT_SUBMITTED' ? 'Not Submitted' : 'Draft';
            break;
        default:
            variantClass = 'badge-draft';
            break;
    }

    return (
        <span className={clsx('status-badge', variantClass)}>
            {label}
        </span>
    );
};
