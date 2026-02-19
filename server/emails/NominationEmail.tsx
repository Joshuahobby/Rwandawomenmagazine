import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { BaseLayout } from './components/BaseLayout';

interface NominationEmailProps {
    nomineeName: string;
    nomineeOrganization?: string;
    categoryName: string;
    nominatorName: string;
}

/**
 * Email template for new award nominations.
 */
export const NominationEmail = ({
    nomineeName,
    nomineeOrganization,
    categoryName,
    nominatorName,
}: NominationEmailProps) => (
    <BaseLayout
        previewText={`New Award Nomination: ${nomineeName}`}
        title="New Nomination Received"
    >
        <Text style={text}>
            A new nomination has been submitted for the <strong>{categoryName}</strong> category.
        </Text>

        <Section style={detailsSection}>
            <Text style={detailsLabel}>NOMINEE DETAILS</Text>
            <Text style={detailsText}>
                <strong>Name:</strong> {nomineeName}
            </Text>
            <Text style={detailsText}>
                <strong>Organization:</strong> {nomineeOrganization || 'N/A'}
            </Text>
            <Text style={detailsText}>
                <strong>Nominated By:</strong> {nominatorName}
            </Text>
        </Section>

        <Text style={subtleText}>
            You can view more details and review this nomination in the admin dashboard.
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

export default NominationEmail;
