import { PrismaClient, CategoryGroup } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
    // INDIVIDUAL
    {
        name: 'Women Breaking Barriers in Male Dominated Sectors',
        slug: 'women-breaking-barriers',
        description: 'Women excelling in construction, manufacturing, transport, logistics, ICT hardware, or agri-mechanization.',
        criteria: 'Leadership, innovation, measurable impact, sector disruption, inspiring others, overcoming barriers.',
        icon: 'construction',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 1
    },
    {
        name: 'Gender Transformative Enterprise Award',
        slug: 'gender-transformative',
        description: 'Women-led businesses engaging men to promote equality and transform workplace culture.',
        criteria: 'Policies promoting equality, male allyship initiatives, staff inclusivity, measurable gender outcomes.',
        icon: 'diversity_3',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 2
    },
    {
        name: 'Inclusive Innovation for Community Transformation',
        slug: 'inclusive-innovation',
        description: 'Women-led businesses developing innovative solutions with social impact in underserved communities.',
        criteria: 'Innovation, scalability, social impact, sustainability, community engagement.',
        icon: 'lightbulb',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 3
    },
    {
        name: 'Sustainability Trailblazer Award',
        slug: 'sustainability-trailblazer',
        description: 'Women advancing environmental sustainability, green business, or circular economy.',
        criteria: 'Environmental impact, innovation, business growth, sustainability integration.',
        icon: 'eco',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 4
    },
    {
        name: 'Emerging Woman Founder Under 30',
        slug: 'emerging-founder',
        description: 'Young women entrepreneurs demonstrating leadership, innovation, and growth potential.',
        criteria: 'Creativity, scalability, resilience, leadership, measurable progress.',
        icon: 'trending_up',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 5
    },
    {
        name: 'Transformational Agripreneur of the Year',
        slug: 'transformational-agripreneur',
        description: 'Women transforming agriculture value chains through technology and innovation.',
        criteria: 'Market impact, adoption of modern practices, economic empowerment of women, sustainability.',
        icon: 'agriculture',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 6
    },
    {
        name: 'Digital Acceleration & Tech Inclusion',
        slug: 'digital-acceleration',
        description: 'Women leveraging technology to scale businesses and promote digital inclusion.',
        criteria: 'Tech adoption, business transformation, innovation, measurable digital impact.',
        icon: 'devices',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 7
    },
    {
        name: 'Export Readiness & Market Linkage Champion',
        slug: 'export-readiness',
        description: 'Women achieving cross-border trade, regional exports, or strong market linkages.',
        criteria: 'Market expansion, quality standards, export growth, economic contribution.',
        icon: 'public',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 8
    },
    {
        name: 'Resilience & Business Continuity Leadership',
        slug: 'resilience-leadership',
        description: 'Women who navigated crises, adapted operations, or diversified to survive shocks.',
        criteria: 'Resilience, adaptability, business continuity plans, innovation under pressure.',
        icon: 'shield',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 9
    },
    {
        name: 'Women Led Impact Enterprise (High Social ROI)',
        slug: 'women-led-impact',
        description: 'Enterprises prioritizing social impact alongside profitability.',
        criteria: 'Social ROI, measurable outcomes, sustainability, replicability.',
        icon: 'volunteer_activism',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 10
    },
    {
        name: 'Creative Economy Powerhouse Award',
        slug: 'creative-economy',
        description: 'Women excelling in fashion, arts, design, media, and entertainment.',
        criteria: 'Creativity, innovation, brand impact, business growth, sector leadership.',
        icon: 'palette',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 11
    },
    {
        name: 'Health & Wellness Industry Leadership',
        slug: 'health-wellness',
        description: 'Women transforming health, wellness, or lifestyle sectors.',
        criteria: 'Service quality, innovation, community impact, scalability.',
        icon: 'health_and_safety',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 12
    },
    {
        name: 'Manufacturing & Production Excellence',
        slug: 'manufacturing-excellence',
        description: 'Women achieving excellence in production efficiency, quality, and innovation.',
        criteria: 'Production standards, innovation, business growth, sector leadership.',
        icon: 'precision_manufacturing',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 13
    },
    {
        name: 'Women in Green & Climate Smart Business',
        slug: 'green-climate',
        description: 'Women contributing to climate resilience through green solutions.',
        criteria: 'Environmental impact, innovation, scalability, community or sector influence.',
        icon: 'forest',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 14
    },
    {
        name: 'Niche Tourism & Experience Curator',
        slug: 'niche-tourism',
        description: 'Women creating unique tourism or hospitality experiences showcasing Rwandan heritage.',
        criteria: 'Creativity, uniqueness, cultural impact, business sustainability.',
        icon: 'tour',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 15
    },
    {
        name: 'Employee Wellbeing & Human Capital Advocate',
        slug: 'employee-wellbeing',
        description: 'Women leaders with exceptional employee mental health and development policies.',
        criteria: 'Employee policies, wellbeing outcomes, staff development, measurable impact.',
        icon: 'favorite',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 16
    },
    {
        name: 'Most Gender-Intentionally Designed Product/Service',
        slug: 'gender-intentional',
        description: 'Products or services explicitly designed to address gender-specific needs.',
        criteria: 'Intentional design, gender impact, innovation, scalability.',
        icon: 'design_services',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 17
    },
    {
        name: 'Male Champion for Gender Equity',
        slug: 'male-champion',
        description: 'Male leaders who have actively championed gender equality and women\'s advancement.',
        criteria: 'Active advocacy, mentorship, measurable impact, public commitment.',
        icon: 'handshake',
        group: CategoryGroup.INDIVIDUAL,
        sortOrder: 18
    },

    // CORPORATE
    {
        name: 'Corporate Allyship & Inclusive Leadership Champion',
        slug: 'corporate-allyship',
        description: 'Measurable commitment to gender-inclusive leadership and institutional accountability.',
        criteria: 'Leadership diversity, accountability structures, measurable outcomes.',
        icon: 'corporate_fare',
        group: CategoryGroup.CORPORATE,
        sortOrder: 19
    },
    {
        name: 'Corporate Excellence in Workplace Culture',
        slug: 'corporate-workplace',
        description: 'Leadership in building a safe, inclusive, and high-performing workplace.',
        criteria: 'Workplace policies, inclusivity, employee satisfaction, safety.',
        icon: 'apartment',
        group: CategoryGroup.CORPORATE,
        sortOrder: 20
    },
    {
        name: 'Corporate Champion for Women in Leadership',
        slug: 'corporate-women-leadership',
        description: 'Advancing women into senior leadership through structured talent pipelines.',
        criteria: 'Women in leadership %, talent pipeline structures, measurable progress.',
        icon: 'supervisor_account',
        group: CategoryGroup.CORPORATE,
        sortOrder: 21
    },
    {
        name: 'Corporate Leader in Gender-Intentional Governance',
        slug: 'corporate-governance',
        description: 'Embedding inclusive principles within corporate governance frameworks.',
        criteria: 'Governance frameworks, HR policies, remuneration equity, compliance.',
        icon: 'gavel',
        group: CategoryGroup.CORPORATE,
        sortOrder: 22
    },
    {
        name: 'Corporate Inclusive Value Chain Innovator',
        slug: 'corporate-value-chain',
        description: 'Expanding economic participation for women within supply chains and procurement.',
        criteria: 'Supply chain inclusivity, procurement practices, women\'s participation.',
        icon: 'hub',
        group: CategoryGroup.CORPORATE,
        sortOrder: 23
    },

    // SME
    {
        name: 'SME Inclusive Business Leader',
        slug: 'sme-inclusive',
        description: 'Outstanding SME demonstrating inclusive leadership and equitable workplace structures.',
        criteria: 'Inclusive practices, equitable structures, leadership quality.',
        icon: 'storefront',
        group: CategoryGroup.SME,
        sortOrder: 24
    },
    {
        name: 'SME Excellence in Workplace Culture',
        slug: 'sme-workplace',
        description: 'Commitment to fairness, dignity, and supportive workplace systems.',
        criteria: 'Workplace fairness, dignity, support systems, employee outcomes.',
        icon: 'groups',
        group: CategoryGroup.SME,
        sortOrder: 25
    },
    {
        name: 'SME Champion for Women\'s Enterprise Growth',
        slug: 'sme-women-growth',
        description: 'Active investment in mentorship and leadership opportunities for women.',
        criteria: 'Mentorship programs, growth opportunities, measurable development.',
        icon: 'trending_up',
        group: CategoryGroup.SME,
        sortOrder: 26
    },
    {
        name: 'SME Leader in Fair & Equitable Business Practice',
        slug: 'sme-fair-practice',
        description: 'Transparent recruitment, equal opportunity, and fair evaluation practices.',
        criteria: 'Recruitment fairness, equal opportunity, evaluation transparency.',
        icon: 'balance',
        group: CategoryGroup.SME,
        sortOrder: 27
    },
    {
        name: 'SME Community Impact & Inclusion Champion',
        slug: 'sme-community',
        description: 'Strategic engagement strengthening inclusive economic participation.',
        criteria: 'Community engagement, inclusive participation, strategic impact.',
        icon: 'diversity_1',
        group: CategoryGroup.SME,
        sortOrder: 28
    }
];

async function main() {
    console.log('Start seeding award categories...');
    for (const cat of categories) {
        const result = await prisma.awardCategory.upsert({
            where: { slug: cat.slug },
            update: cat,
            create: cat,
        });
        console.log(`Created/Updated category: ${result.name}`);
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
