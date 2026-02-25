import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircle2, XCircle, CircleDot, Circle } from 'lucide-react';
import clsx from 'clsx';
import '../index.css';
import '../pages/ExpenseDetailPage.css';

/**
 * TimelineItem story — isolated view of the approval step rows.
 * Demonstrates all 4 icon variants using lucide-react.
 * Uses static mock data; no real API calls.
 */

interface TimelineItemProps {
    role: string;
    date?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    comment?: string;
    isCurrent?: boolean;
    isCompleted?: boolean;
    isRejected?: boolean;
}

function TimelineItem({ role, date, status, comment, isCurrent, isCompleted, isRejected }: TimelineItemProps) {
    const Icon = isRejected
        ? XCircle
        : isCompleted
            ? CheckCircle2
            : isCurrent
                ? CircleDot
                : Circle;

    const iconClass = clsx(
        'transition-colors duration-200',
        isCompleted && 'text-emerald-500',
        isRejected && 'text-red-500',
        isCurrent && 'text-blue-500 scale-110',
        !isCompleted && !isRejected && !isCurrent && 'text-slate-400',
    );

    const statusLabel = isRejected ? 'Rejected' : isCompleted ? 'Approved' : isCurrent ? 'Pending Review' : status;

    return (
        <div className="timeline-item">
            <div className="timeline-line"></div>
            <div
                className={clsx(
                    'timeline-icon',
                    isCompleted && 'completed',
                    isCurrent && 'current',
                    isRejected && 'rejected',
                )}
            >
                <Icon size={20} className={iconClass} />
            </div>
            <div className="timeline-content">
                <div className="timeline-header">
                    <span className="timeline-role">{role}</span>
                    <span className="timeline-date">{date ?? '2/24/2026'}</span>
                </div>
                <div className="timeline-status">{statusLabel}</div>
                {comment && (
                    <div className="timeline-comment">"{comment}"</div>
                )}
            </div>
        </div>
    );
}

const meta = {
    title: 'Components/TimelineItem',
    component: TimelineItem,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        status: {
            control: 'select',
            options: ['PENDING', 'APPROVED', 'REJECTED'],
            description: 'Step status — drives icon and label',
        },
        role: { control: 'text', description: 'Approver role label' },
        date: { control: 'text', description: 'Date shown in the step' },
        comment: { control: 'text', description: 'Optional comment from the approver' },
        isCurrent: { control: 'boolean', description: 'Highlights this step as the active pending step' },
        isCompleted: { control: 'boolean', description: 'Step was approved' },
        isRejected: { control: 'boolean', description: 'Step was rejected' },
    },
} satisfies Meta<typeof TimelineItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PendingFuture: Story = {
    name: 'Pending (future)',
    args: {
        role: 'ADMIN',
        date: '2/24/2026',
        status: 'PENDING',
        isCurrent: false,
        isCompleted: false,
        isRejected: false,
    },
};

export const PendingCurrent: Story = {
    name: 'Pending (active)',
    args: {
        role: 'MANAGER',
        date: '2/24/2026',
        status: 'PENDING',
        isCurrent: true,
        isCompleted: false,
        isRejected: false,
    },
};

export const ApprovedStep: Story = {
    name: 'Approved',
    args: {
        role: 'MANAGER',
        date: '2/22/2026',
        status: 'APPROVED',
        isCurrent: false,
        isCompleted: true,
        isRejected: false,
        comment: 'Looks good, approved.',
    },
};

export const RejectedStep: Story = {
    name: 'Rejected',
    args: {
        role: 'MANAGER',
        date: '2/21/2026',
        status: 'REJECTED',
        isCurrent: false,
        isCompleted: false,
        isRejected: true,
        comment: 'Amount exceeds department budget.',
    },
};
