import express from 'express';
import Groq from 'groq-sdk';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { resumeText, job } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    if (!job || !job.title) {
      return res.status(400).json({ error: 'Job details are required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Tailor with Groq
    const prompt = `You are a professional resume writer. Tailor this resume for the job posting below.

ORIGINAL RESUME:
${resumeText}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Requirements: ${job.requirements?.join(', ') || 'Not specified'}

Return a JSON object with:
- summary: A 2-3 sentence professional summary tailored to this role (highlight relevant experience)
- skills: Array of 8-12 relevant skills (prioritize skills mentioned in requirements)
- experience: Array of work experiences, each with:
  - title: job title
  - company: company name
  - duration: time period
  - bullets: Array of 3-4 achievement bullets, reworded to emphasize relevance to the target role
- education: Education section as a single string

Keep all factual information accurate - only reword and emphasize, don't fabricate.
Respond with only valid JSON, no markdown.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer. Output only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const tailored = JSON.parse(cleaned);

    // Build DOCX
    const children = [];

    // Header placeholder
    children.push(
      new Paragraph({
        children: [new TextRun({ text: '[YOUR NAME]', bold: true, size: 32 })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new TextRun({ text: '[Email] | [Phone] | [LinkedIn] | [Location]', size: 20 })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' })
    );

    // Summary
    children.push(
      new Paragraph({
        text: 'PROFESSIONAL SUMMARY',
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
      }),
      new Paragraph({ text: tailored.summary }),
      new Paragraph({ text: '' })
    );

    // Skills
    children.push(
      new Paragraph({
        text: 'SKILLS',
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
      }),
      new Paragraph({ text: tailored.skills?.join(' • ') || '' }),
      new Paragraph({ text: '' })
    );

    // Experience
    children.push(
      new Paragraph({
        text: 'EXPERIENCE',
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
      })
    );

    if (tailored.experience) {
      for (const exp of tailored.experience) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.title, bold: true }),
              new TextRun({ text: ` | ${exp.company}` }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: exp.duration, italics: true })],
          })
        );

        if (exp.bullets) {
          for (const bullet of exp.bullets) {
            children.push(
              new Paragraph({
                text: `• ${bullet}`,
                indent: { left: 360 },
              })
            );
          }
        }

        children.push(new Paragraph({ text: '' }));
      }
    }

    // Education
    children.push(
      new Paragraph({
        text: 'EDUCATION',
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
      }),
      new Paragraph({ text: tailored.education || '' })
    );

    const doc = new Document({
      sections: [{ children }],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="Resume_${job.company.replace(/\s+/g, '_')}_${job.title.replace(/\s+/g, '_')}.docx"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Tailor error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;