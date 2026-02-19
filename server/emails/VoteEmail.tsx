import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { BaseLayout } from './components/BaseLayout';

interface VoteEmailProps {
    nomineeName: string;
    voterIp: string;
    timestamp: string;
}

/**
 * Email template for new votes cast in the award ceremony.
 */
export const VoteEmail = ({
    nomineeName,
    voterIp,
    timestamp,
}: VoteEmailProps) => (
    <BaseLayout
        previewText={`New Vote Cast: ${nomineeName}`}
        title="New Vote Received"
    >
        <Text style={text}>
            A new vote has been cast for <strong>{nomineeName}</strong> in the award ceremony.
        </Text>

        <Section style={detailsSection}>
            <Text style={detailsLabel}>VOTE DETAILS</Text>
            <Text style={detailsText}>
                <strong>Nominee:</strong> {nomineeName}
            </Text>
            <Text style={detailsText}>
                <strong>Voter IP:</strong> {voterIp}
            </Text>
            <Text style={detailsText}>
                <strong>Timestamp:</strong> {timestamp}
            </Text>
        </Section>

        <Text style={subtleText}>
            Monitoring voting activity helps ensure a fair and transparent process.
        </Text>
    </BaseLayout>
);

// --- Styles ---

const text = {
    color: '#4a5568',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 24px',
};

const detailsSection = {
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
};

const detailsLabel = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#718096',
    letterSpacing: '1px',
    margin: '0 0 12px',
};

const detailsText = {
    fontSize: '14px',
    margin: '8px 0',
    color: '#2d3748',
};

const subtleText = {
    color: '#718096',
    fontSize: '14px',
    lineHeight: '20px',
    marginTop: '24px',
};

export default VoteEmail;
