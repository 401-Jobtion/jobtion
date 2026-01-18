import express from 'express';
import Groq from 'groq-sdk';
import * as cheerio from 'cheerio';

const router = express.Router();

router.post('/', async (req, res) => {
  console.log('Optimize resume route hit!');
  
  try {
    const { resume, jobUrl, jobDetails } = req.body;

    if (!resume) {
      return res.status(400).json({ error: 'Resume data is required' });
    }

    if (!jobUrl && !jobDetails) {
      return res.status(400).json({ error: 'Job URL or job details are required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // If jobUrl provided, extract job details first
    let job = jobDetails;
    
    if (jobUrl && !jobDetails) {
      try {
        const response = await fetch(jobUrl, {
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

        // Extract job details
        const extractPrompt = `Extract job posting details from the following text. Return a JSON object with these fields:
- title: job title
- company: company name
- location: job location (remote, city, etc.)
- description: a 2-3 sentence summary of the role
- requirements: array of key requirements/qualifications (max 10 items)
- keywords: array of important technical skills, tools, and buzzwords mentioned (max 15 items)

Text from ${jobUrl}:
${text}

Respond with only valid JSON, no markdown formatting.`;

        const extractCompletion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that extracts structured job posting information. Always respond with valid JSON only.',
            },
            { role: 'user', content: extractPrompt },
          ],
          temperature: 0.1,
        });

        const extractContent = extractCompletion.choices[0]?.message?.content || '{}';
        const extractCleaned = extractContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        job = JSON.parse(extractCleaned);
      } catch (fetchError) {
        console.error('Job fetch error:', fetchError);
        return res.status(400).json({ 
          error: `Could not fetch job posting: ${fetchError.message}. Try pasting the job description directly.` 
        });
      }
    }

    // Now optimize the resume for this job
    const optimizePrompt = `You are an expert resume writer. Optimize this resume for the target job posting.

CURRENT RESUME DATA:
${JSON.stringify(resume, null, 2)}

TARGET JOB:
Title: ${job.title || 'Not specified'}
Company: ${job.company || 'Not specified'}
Description: ${job.description || 'Not specified'}
Requirements: ${job.requirements?.join(', ') || 'Not specified'}
Keywords: ${job.keywords?.join(', ') || 'Not specified'}

INSTRUCTIONS:
1. Rewrite experience bullet points to:
   - Incorporate relevant keywords from the job posting naturally
   - Emphasize achievements that align with job requirements
   - Use action verbs and quantify results where possible
   - Keep the same factual information, just reword for relevance

2. Rewrite project bullet points similarly

3. Reorder skills categories to prioritize skills mentioned in the job posting
   - Add any missing skills from the job requirements that the candidate likely has based on their experience
   - Remove or deprioritize skills not relevant to this role

4. Keep all dates, company names, school names, and other factual details EXACTLY the same

Return a JSON object with this EXACT structure (maintaining all IDs):
{
  "experiences": [
    {
      "id": "keep-original-id",
      "company": "keep-original",
      "role": "keep-original", 
      "start": "keep-original",
      "end": "keep-original",
      "bullets": ["optimized bullet 1", "optimized bullet 2", "optimized bullet 3"]
    }
  ],
  "projects": [
    {
      "id": "keep-original-id",
      "name": "keep-original",
      "tech": "keep-original-or-slightly-reorder",
      "bullets": ["optimized bullet 1", "optimized bullet 2"]
    }
  ],
  "skills": {
    "id": "keep-original-id",
    "categories": [
      {
        "name": "Category Name",
        "items": ["skill1", "skill2", "skill3"]
      }
    ]
  },
  "summary": "A 2-3 sentence professional summary tailored to this specific role (optional, for display purposes)"
}

IMPORTANT: 
- Keep ALL original IDs exactly as provided
- Keep ALL factual information (dates, names, etc.) exactly the same
- Only modify bullet point text and skills ordering/content
- Do not add fabricated experiences or projects

Respond with only valid JSON, no markdown formatting.`;

    const optimizeCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume optimizer. Tailor resumes to job postings while maintaining factual accuracy. Always respond with valid JSON only.',
        },
        { role: 'user', content: optimizePrompt },
      ],
      temperature: 0.3,
    });

    const optimizeContent = optimizeCompletion.choices[0]?.message?.content || '{}';
    const optimizeCleaned = optimizeContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let optimized;
    try {
      optimized = JSON.parse(optimizeCleaned);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', optimizeContent);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Return the optimized data along with the extracted job details
    res.json({
      optimized,
      job: {
        title: job.title,
        company: job.company,
        description: job.description,
        requirements: job.requirements,
        keywords: job.keywords
      }
    });
  } catch (error) {
    console.error('Optimize resume error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;