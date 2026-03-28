import mongoose, { Schema } from "mongoose";


const meetingSchema = new Schema(
    {
        user_id: { type: String },
        meetingCode: { type: String, required: true },
        date: { type: Date, default: Date.now, required: true },
        transcript: { type: String },
        recap_markdown: { type: String },
        recap_generated_at: { type: Date }
    }
)

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };
