import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Link,
} from '@react-email/components';

interface BaseLayoutProps {
    previewText: string;
    children: React.ReactNode;
    title?: string;
}

/**
 * BaseLayout provides a consistent, premium aesthetic for all system emails.
 */
export const BaseLayout = ({
    previewText,
    children,
    title,
}: BaseLayoutProps) => {
    const year = new Date().getFullYear();

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header/Logo Section */}
                    <Section style={headerSection}>
                        <Text style={logoText}>RWANDA WOMEN MAGAZINE</Text>
                    </Section>

                    {/* Main Content */}
                    <Section style={contentSection}>
                        {title && <Text style={h1}>{title}</Text>}
                        {children}
                    </Section>

                    <Hr style={hr} />

                    {/* Footer */}
                    <Section style={footerSection}>
                        <Text style={footerText}>
                            &copy; {year} Rwanda Women Magazine. All rights reserved.
                        </Text>
                        <Text style={footerLinks}>
                            <Link href="https://rwandawomenmagazine.rw" style={link}>
                                Website
                            </Link>{' '}
                            •{' '}
                            <Link href="https://rwandawomenmagazine.rw/privacy" style={link}>
                                Privacy Policy
                            </Link>
                        </Text>
                        <Text style={subtleText}>
                            This is an automated notification from the Rwanda Women Magazine Excellence Awards platform.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// --- Styles ---

const main = {
    backgroundColor: '#f4f7f9',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    padding: '0',
    maxWidth: '600px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const headerSection = {
    backgroundColor: '#1a1a2e', // Deep Navy
    padding: '32px',
    textAlign: 'center' as const,
};

const logoText = {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    margin: '0',
    textTransform: 'uppercase' as const,
};

const contentSection = {
    padding: '40px 48px',
};

const h1 = {
    color: '#1a1a2e',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '32px',
    margin: '0 0 20px',
};

const hr = {
    borderColor: '#e2e8f0',
    margin: '0',
};

const footerSection = {
    padding: '32px 48px',
    backgroundColor: '#fafafa',
    textAlign: 'center' as const,
};

const footerText = {
    color: '#718096',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
};

const footerLinks = {
    margin: '12px 0 0',
    fontSize: '14px',
};

const link = {
    color: '#4a5568',
    textDecoration: 'underline',
};

const subtleText = {
    color: '#a0aec0',
    fontSize: '12px',
    lineHeight: '18px',
    margin: '16px 0 0',
};

export default BaseLayout;
