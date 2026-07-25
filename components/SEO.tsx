import React from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    author?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description = "Empowering women in Rwanda through storytelling, leadership, and community.",
    image = "https://rwandawomenmagazine.rw/uploads/logo.png",
    url = "https://rwandawomenmagazine.rw",
    type = 'website',
    author
}) => {
    const siteTitle = "Rwanda Women Magazine";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    return (
        <>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {author && <meta name="author" content={author} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </>
    );
};

export default SEO;
