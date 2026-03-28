import httpStatus from "http-status";
import { Meeting } from "../models/meeting.model.js";
// Using direct REST call to Generative Language API v1 to avoid client version issues.

const summarizeMeeting = async (req, res) => {
  try {
    const { meetingCode, transcript } = req.body;
    if (!meetingCode || !transcript) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "meetingCode and transcript are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "GEMINI_API_KEY is not configured" });
    }

    const prompt = `
You are an assistant generating a concise meeting recap from a transcript.
Return Markdown with these sections:
## Summary
## Key Decisions
## Action Items

Keep it brief, bullet points where helpful. Do not include any preamble.

Transcript:
${transcript}
`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };
    const urlV1 = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    let resp = await fetch(urlV1, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!resp.ok) {
      const errTextV1 = await resp.text();
      const urlV1beta = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      resp = await fetch(urlV1beta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const errTextV1beta = await resp.text();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          message: `Failed to summarize: v1 error: ${errTextV1}; v1beta error: ${errTextV1beta}`
        });
      }
    }
    const json = await resp.json();
    const text =
      json?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") ||
      json?.candidates?.[0]?.output || "";

    let meeting = await Meeting.findOne({ meetingCode });
    if (!meeting) {
      meeting = new Meeting({ meetingCode });
    }
    meeting.recap_markdown = text;
    meeting.transcript = transcript;
    meeting.recap_generated_at = new Date();
    await meeting.save();

    return res.status(httpStatus.OK).json({ recap: text });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Failed to summarize: ${e.message || e}` });
  }
};

export { summarizeMeeting };
