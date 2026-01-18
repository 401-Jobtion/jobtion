import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse-fork';
import Groq from 'groq-sdk';
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  console.log('Parse resume route hit!');
  console.log('Parse resume structured route hit!');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!req.file.originalname.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    // Parse PDF to text
    const data = await pdfParse(req.file.buffer);
    const text = data.text.trim();

    if (!text) {
      return res.status(400).json({ error: 'Could not extract text from PDF' });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const prompt = `Extract resume information from the following text and return a structured JSON object.

RESUME TEXT:
${text.substring(0, 12000)}

Return a JSON object with this exact structure:
{
  "profile": {
    "name": "Full Name",
    "phone": "Phone number or empty string",
    "email": "Email address or empty string",
    "linkedin": "LinkedIn URL or username or empty string",
    "website": "Personal website or portfolio URL or empty string"
  },
  "experiences": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "start": "Start date (e.g., Jan 2022)",
      "end": "End date or Present",
      "bullets": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech": "Technologies used (comma-separated)",
      "bullets": ["Description 1", "Description 2"]
    }
  ],
  "education": [
    {
      "school": "University/School Name",
      "degree": "Degree and Major",
      "period": "Time period (e.g., 2018 - 2022)",
      "gpa": "GPA if mentioned, otherwise empty string"
    }
  ],
  "skills": {
    "categories": [
      {
        "name": "Category Name (e.g., Languages, Frameworks, Tools)",
        "items": ["Skill 1", "Skill 2", "Skill 3"]
      }
    ]
  }
}

Rules:
- Extract ALL experiences, projects, and education entries found
- For experiences, extract 3-5 bullet points per role if available
- Group skills into logical categories (Languages, Frameworks, Tools, etc.)
- If a section is not found, return an empty array for that section
- Keep all information factual - do not fabricate or embellish
- Dates should be formatted consistently (e.g., "Jan 2022" or "2022")

Respond with only valid JSON, no markdown formatting.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume parser. Extract structured information accurately. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', content);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Add IDs to each item for React state management
    const result = {
      profile: parsed.profile || {
        name: '',
        phone: '',
        email: '',
        linkedin: '',
        website: ''
      },
      experiences: (parsed.experiences || []).map((exp, idx) => ({
        id: `exp-${Date.now()}-${idx}`,
        company: exp.company || '',
        role: exp.role || '',
        start: exp.start || '',
        end: exp.end || '',
        bullets: exp.bullets || []
      })),
      projects: (parsed.projects || []).map((proj, idx) => ({
        id: `proj-${Date.now()}-${idx}`,
        name: proj.name || '',
        tech: proj.tech || '',
        bullets: proj.bullets || []
      })),
      education: (parsed.education || []).map((edu, idx) => ({
        id: `edu-${Date.now()}-${idx}`,
        school: edu.school || '',
        degree: edu.degree || '',
        period: edu.period || '',
        gpa: edu.gpa || ''
      })),
      skills: {
        id: `skills-${Date.now()}`,
        categories: (parsed.skills?.categories || []).map((cat, idx) => ({
          name: cat.name || '',
          items: cat.items || []
        }))
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Parse resume structured error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;