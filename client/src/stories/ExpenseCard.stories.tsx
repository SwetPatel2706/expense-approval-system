import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge } from '../components/StatusBadge';
import '../index.css';

/**
 * ExpenseCard story — displays a summary card of an expense.
 * Uses static mock data; no real API calls.
 */

interface ExpenseCardProps {
    amountFormatted: string;
    category: string;
    submitterLabel: string;
    createdAtLabel: string;
    approvalState: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
}

function ExpenseCard({
    amountFormatted,
    category,
    submitterLabel,
    createdAtLabel,
    approvalState,
}: ExpenseCardProps) {
    return (
        <div
            style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                width: '360px',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {amountFormatted}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                        {category}
                    </p>
                </div>
                <StatusBadge status={approvalState} />
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Submitted by</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>{submitterLabel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Date</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>{createdAtLabel}</span>
            </div>
        </div>
    );
}

const meta = {
    title: 'Components/ExpenseCard',
    component: ExpenseCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        approvalState: {
            control: 'select',
            options: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'],
            description: 'Current approval state of the expense',
        },
        amountFormatted: { control: 'text' },
        category: { control: 'text' },
        submitterLabel: { control: 'text' },
        createdAtLabel: { control: 'text' },
    },
} satisfies Meta<typeof ExpenseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
    args: {
        amountFormatted: '$1,250.00',
        category: 'Travel',
        submitterLabel: 'employee@example.com',
        createdAtLabel: '2/24/2026',
        approvalState: 'DRAFT',
    },
};

export const InReview: Story = {
    args: {
        amountFormatted: '$3,480.00',
        category: 'Software',
        submitterLabel: 'employee@example.com',
        createdAtLabel: '2/23/2026',
        approvalState: 'IN_REVIEW',
    },
};

export const Approved: Story = {
    args: {
        amountFormatted: '$540.00',
        category: 'Office Supplies',
        submitterLabel: 'employee@example.com',
        createdAtLabel: '2/20/2026',
        approvalState: 'APPROVED',
    },
};

export const Rejected: Story = {
    args: {
        amountFormatted: '$8,900.00',
        category: 'Entertainment',
        submitterLabel: 'employee@example.com',
        createdAtLabel: '2/15/2026',
        approvalState: 'REJECTED',
    },
};
