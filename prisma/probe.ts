
import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });
const articlesUrl = 'https://rwandawomenmagazine.rw/a-generation-of-change-youth-passion-and-five-years-of-gender-transformation-in-rwanda/';

async function probe() {
    try {
        console.log('Fetching article...');
        const res = await axios.get(articlesUrl, {
            httpsAgent: agent,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(res.data);
        const article = $('article').first();

        console.log('Article classes:', article.attr('class'));
        console.log('Content snippet:', article.text().substring(0, 100));
        console.log('Images in article:', article.find('img').length);
        article.find('img').each((i, el) => console.log(`Img ${i}:`, $(el).attr('src')));

        // Check for specific content classes
        console.log('Has .entry-content?', article.find('.entry-content').length);
        console.log('Has .td-post-content?', article.find('.td-post-content').length); // Common theme class
        console.log('Has .post-content?', article.find('.post-content').length);
        console.log('Has .content?', article.find('.content').length);

        // Check meta again
        console.log('OG Image:', $('meta[property="og:image"]').attr('content'));
        console.log('Twitter Image:', $('meta[name="twitter:image"]').attr('content'));

        // Check Date
        console.log('Date .entry-date:', $('.entry-date').first().text());
        console.log('Date .published:', $('.published').first().text());
    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

probe();
