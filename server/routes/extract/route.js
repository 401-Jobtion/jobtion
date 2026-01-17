import express from 'express';
import Groq from 'groq-sdk';
import * as cheerio from 'cheerio';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Scrape the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $('script, style, nav, footer, header, aside, iframe, noscript').remove();

    const text = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 15000);

    const prompt = `Extract job posting details from the following text. Return a JSON object with these fields:
- title: job title
- company: company name
- location: job location (remote, city, etc.)
- description: a 2-3 sentence summary of the role
- requirements: array of key requirements/qualifications (max 8 items)
- salary: salary range if mentioned, otherwise null

Text from ${url}:
${text}

Respond with only valid JSON, no markdown formatting.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts structured job posting information. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const extracted = JSON.parse(cleaned);

    res.json(extracted);
  } catch (error) {
    console.error('Extract error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;