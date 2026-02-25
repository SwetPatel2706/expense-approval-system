import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Modal } from '../components/Modal';
import clsx from 'clsx';
import '../index.css';

/**
 * ApprovalModal story — shows the approve/reject confirmation dialog.
 * Uses static mock data; no real API calls.
 */

interface ApprovalModalStoryProps {
    actionType: 'APPROVE' | 'REJECT';
    isOpen: boolean;
    onClose: () => void;
}

function ApprovalModalWrapper({ actionType, isOpen, onClose }: ApprovalModalStoryProps) {
    const [comment, setComment] = useState('');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={actionType === 'APPROVE' ? 'Approve Expense' : 'Reject Expense'}
        >
            <div>
                <p className="text-slate-600 mb-4" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    {actionType === 'APPROVE'
                        ? 'Are you sure you want to approve this expense? It will move to the next stage.'
                        : 'Please provide a reason for rejecting this expense.'}
                </p>

                <textarea
                    className="w-full p-2 border border-slate-300 rounded mb-4"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginBottom: '1rem', display: 'block', fontFamily: 'system-ui, sans-serif' }}
                    rows={3}
                    placeholder={actionType === 'REJECT' ? 'Rejection reason (required)...' : 'Optional comment...'}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                        style={{ padding: '0.5rem 1rem', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: '#fff', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={clsx(
                            'px-4 py-2 text-white rounded font-bold',
                        )}
                        style={{
                            padding: '0.5rem 1rem',
                            color: '#fff',
                            borderRadius: '0.375rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontFamily: 'system-ui, sans-serif',
                            backgroundColor: actionType === 'APPROVE' ? '#10b981' : '#ef4444',
                        }}
                        disabled={actionType === 'REJECT' && !comment.trim()}
                    >
                        {`Confirm ${actionType === 'APPROVE' ? 'Approval' : 'Rejection'}`}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

const meta = {
    title: 'Components/ApprovalModal',
    component: ApprovalModalWrapper,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        actionType: {
            control: 'radio',
            options: ['APPROVE', 'REJECT'],
            description: 'Controls button colors and prompt text',
        },
        isOpen: { control: 'boolean' },
    },
    args: {
        onClose: fn(),
    },
} satisfies Meta<typeof ApprovalModalWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ApproveModal: Story = {
    name: 'Approve',
    args: {
        actionType: 'APPROVE',
        isOpen: true,
    },
};

export const RejectModal: Story = {
    name: 'Reject',
    args: {
        actionType: 'REJECT',
        isOpen: true,
    },
};
