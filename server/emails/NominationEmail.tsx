import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { BaseLayout } from './components/BaseLayout';

interface NominationEmailProps {
    nomineeName: string;
    nomineeTitle?: string;
    nomineeOrganization?: string;
    sector?: string;
    achievements?: string;
    measurableResults?: string;
    supportingDocUrl?: string;
    categoryName: string;
    nominatorName: string;
    nominatorEmail: string;
    nominatorPhone?: string;
}

/**
 * Email template for new award nominations.
 */
export const NominationEmail = ({
    nomineeName,
    nomineeTitle,
    nomineeOrganization,
    sector,
    achievements,
    measurableResults,
    supportingDocUrl,
    categoryName,
    nominatorName,
    nominatorEmail,
    nominatorPhone,
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
            {nomineeTitle && (
                <Text style={detailsText}>
                    <strong>Title:</strong> {nomineeTitle}
                </Text>
            )}
            <Text style={detailsText}>
                <strong>Organization:</strong> {nomineeOrganization || 'N/A'}
            </Text>
            {sector && (
                <Text style={detailsText}>
                    <strong>Sector:</strong> {sector}
                </Text>
            )}
            {achievements && (
                <Section style={largeTextSection}>
                    <Text style={detailsLabel}>ACHIEVEMENTS</Text>
                    <Text style={detailsText}>{achievements}</Text>
                </Section>
            )}
            {measurableResults && (
                <Section style={largeTextSection}>
                    <Text style={detailsLabel}>MEASURABLE RESULTS</Text>
                    <Text style={detailsText}>{measurableResults}</Text>
                </Section>
            )}
            {supportingDocUrl && (
                <Text style={detailsText}>
                    <strong>Supporting Document:</strong> <a href={supportingDocUrl}>View Document</a>
                </Text>
            )}
        </Section>

        <Section style={{ ...detailsSection, marginTop: '24px' }}>
            <Text style={detailsLabel}>NOMINATOR DETAILS</Text>
            <Text style={detailsText}>
                <strong>Name:</strong> {nominatorName}
            </Text>
            <Text style={detailsText}>
                <strong>Email:</strong> {nominatorEmail}
            </Text>
            {nominatorPhone && (
                <Text style={detailsText}>
                    <strong>Phone:</strong> {nominatorPhone}
                </Text>
            )}
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

const largeTextSection = {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #edf2f7',
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
