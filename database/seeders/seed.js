/**
 * Purpose: Seeds BytesAndBeyond with the enhanced March-July 2026 KT programme dataset, users, evaluations, feedback, and announcements.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { addDays, format, isSaturday, parseISO } from "date-fns";
import connectDB from "../config/mongo.connection.js";
import Announcement from "../../backend/src/models/Announcement.model.js";
import Evaluation from "../../backend/src/models/Evaluation.model.js";
import Feedback from "../../backend/src/models/Feedback.model.js";
import Session from "../../backend/src/models/Session.model.js";
import User from "../../backend/src/models/User.model.js";
import { DEFAULT_MEETING_LINK } from "../../backend/src/config/constants.js";
import { calculateOrganiserScore, calculateTotalScore, generateOverallFeedbackPost, normaliseScores } from "../../backend/src/services/scoring.service.js";

dotenv.config();

const sessions = [
  {
    id: 1, sessionNumber: 1, date: "2026-03-14", day: "Saturday", presenter: "Shaik Abdul Cader", presenterInitials: "SAC",
    topic: "Vibe Coding", series: "The Construct", status: "Completed", month: "March",
    startTime: "14:00", endTime: "15:00", attendees: 10, feedbackCount: 5,
    scores: { startOnTime: 3, structure: 3, interaction: 2, clarity: 3, practical: 3, clickup: 3, timeEfficiency: 2 },
    overallScore: 2.71, totalScore: 2.71, verdict: "Average",
    note: "Takes too much time in session; low interaction, lagged on errors.", posterTheme: "navy-gold", tags: ["Vibe Coding", "Live Coding", "Backend"],
  },
  {
    id: 2, sessionNumber: 2, date: "2026-03-22", day: "Sunday", presenter: "Shaik Abdul Cader", presenterInitials: "SAC",
    topic: "Backend Development & CI/CD Deployment", series: "The Construct", status: "Completed", month: "March",
    startTime: "15:00", endTime: "16:00", attendees: 12, feedbackCount: 9,
    scores: { startOnTime: 3, structure: 3, interaction: 2, clarity: 3, practical: 4, clickup: 3, timeEfficiency: 2 },
    overallScore: 2.86, totalScore: 2.86, verdict: "Average", note: "CI/CD session - decent content but limited engagement from participants.",
    posterTheme: "navy-gold", tags: ["Backend", "CI/CD", "Rescheduled"],
  },
  {
    id: 3, sessionNumber: 3, date: "2026-03-28", day: "Saturday", presenter: "Srinath S", presenterInitials: "SS",
    topic: "Automation using n8n", series: "The Construct", status: "Completed", month: "March",
    startTime: "14:00", endTime: "15:00", attendees: 15, feedbackCount: 12,
    scores: { startOnTime: 4, structure: 4, interaction: 4, clarity: 4, practical: 5, clickup: 4, timeEfficiency: 4 },
    overallScore: 4.14, totalScore: 4.14, verdict: "Good", note: "Excellent live demo of N8N automation; strong knowledge & energy.",
    posterTheme: "teal-multicolor", tags: ["Automation", "n8n", "No-Code", "AI"],
  },
  {
    id: 4, sessionNumber: 4, date: "2026-04-04", day: "Saturday", presenter: "Devisree K", presenterInitials: "DK",
    topic: "Beyond the Chatbots", series: "The Construct", status: "Completed", month: "April",
    startTime: "14:00", endTime: "15:00", attendees: 10, feedbackCount: 4,
    scores: { startOnTime: 4, structure: 4, interaction: 5, clarity: 4, practical: 4, clickup: 4, timeEfficiency: 4 },
    overallScore: 4.14, totalScore: 4.14, verdict: "Good", note: "Best interactivity in April; HTML puzzle icebreaker was creative.",
    posterTheme: "purple-indigo", tags: ["AI", "Chatbots", "API", "Streamlit"],
  },
  {
    id: 5, sessionNumber: 5, date: "2026-04-11", day: "Saturday", presenter: "Bindhiya J", presenterInitials: "BJ",
    topic: "End-to-End Data Analysis & ML Workflow", series: "The Construct", status: "Completed", month: "April",
    startTime: "14:00", endTime: "15:00", attendees: 10, feedbackCount: 5,
    scores: { startOnTime: 4, structure: 4, interaction: 4, clarity: 4, practical: 4, clickup: 3, timeEfficiency: 4 },
    overallScore: 3.86, totalScore: 3.86, verdict: "Good", note: "Good ML project walkthrough; clear explanation on Google Colab.",
    posterTheme: "teal-blue", tags: ["Data", "ML", "Python", "EDA"],
  },
  {
    id: 6, sessionNumber: 6, date: "2026-04-18", day: "Saturday", presenter: "Mahajan Sharma", presenterInitials: "MS",
    topic: "GCP Cloud", series: "The Construct", status: "Completed", month: "April",
    startTime: "14:00", endTime: "15:00", attendees: 10, feedbackCount: 5,
    scores: { startOnTime: 4, structure: 4, interaction: 3, clarity: 4, practical: 4, clickup: 3, timeEfficiency: 4 },
    overallScore: 3.71, totalScore: 3.71, verdict: "Good", note: "Solid GCP/Cloud session; good content depth, moderate interaction.",
    posterTheme: "google-multicolor", tags: ["Cloud", "GCP", "DevOps", "Infrastructure"],
  },
  {
    id: 7, sessionNumber: 7, date: "2026-04-25", day: "Saturday", presenter: "Kamatchi U", presenterInitials: "KU",
    topic: "Power BI Dashboard Development", series: "The Construct", status: "Completed", month: "April",
    startTime: "14:00", endTime: "15:00", attendees: 12, feedbackCount: 6,
    scores: { startOnTime: 4, structure: 4, interaction: 4, clarity: 5, practical: 3, clickup: 4, timeEfficiency: 4 },
    overallScore: 4.0, totalScore: 4.0, verdict: "Good", note: "Power BI session; strong clarity, good engagement, enforced peer answers.",
    posterTheme: "gold-orange", tags: ["Power BI", "Data Viz", "Dashboard", "Microsoft"],
  },
  {
    id: 8, sessionNumber: 8, date: "2026-05-02", day: "Saturday", presenter: "Siva Prasanna S", presenterInitials: "SP",
    topic: "System Design", series: "The Construct", status: "Completed", month: "May",
    startTime: "14:00", endTime: "15:00", attendees: 15, feedbackCount: 5,
    scores: { startOnTime: 5, structure: 5, interaction: 5, clarity: 5, practical: 5, clickup: 4, timeEfficiency: 5 },
    overallScore: 4.86, totalScore: 4.86, verdict: "Excellent", note: "Best May session - system design with LucidChart; highly interactive & structured.",
    posterTheme: "indigo-multicolor", tags: ["System Design", "Architecture", "Scalability", "Backend"],
  },
];

const emailFor = (name) => `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "")}@iamneo.ai`;

const feedbackLines = [
  ["The examples were practical and easy to connect with our daily work.", "More time for hands-on practice would help.", "Agentic AI workflows"],
  ["The presenter explained concepts clearly and kept the session focused.", "Add one quick recap slide at the end.", "SAP automation"],
  ["The live demo made the session memorable.", "Slow down slightly during tool setup.", "Oracle integration patterns"],
  ["Good structure and useful Q&A moments.", "Share a pre-read before the session.", "Power BI storytelling"],
  ["The topic felt relevant for trainers across domains.", "Add a short quiz or checkpoint.", "Cloud cost optimisation"],
  ["Strong delivery with real-world references.", "Keep debugging steps shorter.", "System design trade-offs"],
  ["The activity helped everyone participate.", "Give more time for attendee questions.", "Testing with GenAI"],
  ["Clear takeaways and confident handling of questions.", "Show final resources in one place.", "RAG implementation"],
  ["Good balance of concepts and demo.", "Include before-after examples.", "Data engineering pipelines"],
  ["Helpful discussion and strong learning value.", "Add more trainer peer practice.", "Microsoft Copilot scenarios"],
];

const buildFeedback = (session, count) => Array.from({ length: count }, (_, index) => {
  const [takeaway, improvement, suggestion] = feedbackLines[index % feedbackLines.length];
  const base = Number(session.overallScore || 3.5);
  return {
    session: session._id,
    responderName: `Attendee ${index + 1}`,
    email: `attendee${index + 1}@iamneo.ai`,
    isAnonymous: true,
    presenterName: session.presenterName,
    sessionDate: session.date,
    sessionTitle: session.topic,
    attendeeRating: Math.max(1, Math.min(5, Math.round(base + (index % 3 === 0 ? -0.4 : 0.25)))),
    keyTakeaways: takeaway,
    improvements: improvement,
    futureSuggestions: suggestion,
    submittedAt: new Date(session.date),
  };
});

const upcomingSaturdays = () => {
  const output = [];
  let cursor = parseISO("2026-05-09");
  const end = parseISO("2026-07-11");
  while (cursor <= end) {
    if (isSaturday(cursor)) output.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return output;
};

const confirmedUpcomingSessions = new Map([
  ["2026-05-09", {
    presenter: "Rahini C",
    presenterInitials: "RC",
    topic: "Exploring Open-source AI with Hugging Face",
    meetingLink: DEFAULT_MEETING_LINK,
    tags: ["Open-source AI", "Hugging Face", "AI/ML"],
    posterTopics: ["Open-source AI ecosystem", "Hugging Face walkthrough", "Model discovery and usage"],
  }],
  ["2026-05-16", {
    presenter: "Nikhil",
    presenterInitials: "N",
    topic: "GenAI in Testing",
    tags: ["GenAI", "Testing", "QA"],
    posterTopics: ["GenAI testing workflows", "Prompt-assisted QA", "Automation opportunities"],
  }],
  ["2026-05-23", {
    presenter: "Naveen Prabhu S",
    presenterInitials: "NPS",
    topic: "RAG",
    tags: ["RAG", "GenAI", "Knowledge Retrieval"],
    posterTopics: ["Retrieval augmented generation", "Document grounding", "RAG implementation patterns"],
  }],
]);

const checksFor = (scores = {}) => ({
  startedOnTime: Number(scores.startOnTime || 0) >= 4,
  icebreakerDone: Number(scores.interaction || 0) >= 4,
  qaDone: Number(scores.clarity || 0) >= 4,
});

const insightsFor = (item) => ({
  strengths: [
    Number(item.scores?.clarity || 0) >= 4 ? "Clear explanation and confident topic handling" : "Relevant topic selection for the trainer audience",
    Number(item.scores?.practical || 0) >= 4 ? "Practical walkthrough gave attendees reusable takeaways" : "Core concepts were covered with room for more live practice",
  ],
  improvements: [item.note || "Keep improving session pacing and audience participation"],
  audienceEngagement: Number(item.scores?.interaction || 0) >= 4
    ? "Audience engagement was healthy with Q&A and participation moments."
    : "Audience engagement needs stronger prompts, checkpoints, and try-it moments.",
  deliveryNotes: item.note || "",
  recommendedActions: [
    Number(item.scores?.timeEfficiency || 0) >= 4 ? "Maintain the time-boxed 60-minute delivery rhythm" : "Rehearse the demo flow to reduce live debugging time",
    Number(item.scores?.interaction || 0) >= 4 ? "Continue using participation activities" : "Add an icebreaker and pause for attendee input at the 20-minute mark",
  ],
});

const seed = async () => {
  try {
    await connectDB();
    await Promise.all([
      Announcement.deleteMany(),
      Evaluation.deleteMany(),
      Feedback.deleteMany(),
      Session.deleteMany(),
      User.deleteMany(),
    ]);

    const admin = await User.create({
      name: "Ayush Rathour",
      email: "ayush@iamneo.ai",
      password: "Admin@123",
      role: "admin",
    });

    const trainerNames = [...new Set([
      ...sessions.map((session) => session.presenter).filter((name) => name !== "TBD"),
      ...Array.from(confirmedUpcomingSessions.values()).map((session) => session.presenter),
    ])];
    const trainerDocs = [];
    for (const name of trainerNames) {
      trainerDocs.push(await User.create({
        name,
        email: emailFor(name),
        password: "Trainer@123",
        role: "trainer",
      }));
    }
    const trainerByName = new Map(trainerDocs.map((trainer) => [trainer.name, trainer]));

    for (const item of sessions) {
      const presenter = trainerByName.get(item.presenter);
      const session = await Session.create({
        sessionNumber: item.sessionNumber,
        date: parseISO(item.date),
        day: item.day,
        presenter: presenter?._id || null,
        presenterName: item.presenter,
        presenterInitials: item.presenterInitials,
        topic: item.topic,
        series: item.series,
        status: item.status,
        approvalStatus: "Approved",
        month: item.month,
        startTime: item.startTime,
        endTime: item.endTime,
        attendees: item.attendees,
        feedbackCount: item.feedbackCount,
        rating: item.overallScore || 0,
        overallScore: item.overallScore || 0,
        totalScore: item.totalScore || 0,
        verdict: item.verdict || "",
        note: item.note,
        posterTheme: item.posterTheme,
        tags: item.tags,
        meetingLink: DEFAULT_MEETING_LINK,
        summary: item.status === "Completed" ? `${item.topic} covered practical trainer knowledge transfer with examples, discussion, and improvement actions.` : item.note,
        keyTakeaways: ["Core concepts explained", "Trainer Q&A captured", "Reusable notes for future sessions"],
        posterTopics: item.tags.slice(0, 3),
        requirements: ["Laptop", "Stable internet", "Ready to learn"],
      });

      if (item.status === "Completed" && item.scores) {
        const scores = normaliseScores(item.scores);
        const organiserChecks = checksFor(scores);
        const adminInsightScore = calculateOrganiserScore(organiserChecks);
        const adminInsights = insightsFor(item);
        const evaluation = {
          session: session._id,
          evaluatedBy: admin._id,
          scores,
          organiserChecks,
          totalScore: item.totalScore || calculateTotalScore(scores),
          attendeeAverageRating: item.overallScore,
          adminInsightScore,
          overallScore: item.overallScore,
          verdict: item.verdict,
          remarks: item.note,
          adminInsights,
          trainerFeedbackPublished: true,
          trainerFeedbackPublishedAt: new Date(),
          trainerFeedbackPublishedBy: admin._id,
          attendanceCount: item.attendees,
          feedbackCount: item.feedbackCount,
        };
        evaluation.overallFeedbackPost = generateOverallFeedbackPost(session, evaluation, { count: item.feedbackCount });
        await Evaluation.create(evaluation);
        await Feedback.insertMany(buildFeedback(session, item.feedbackCount));
      }
    }

    let nextNumber = 9;
    for (const date of upcomingSaturdays()) {
      const dateKey = format(date, "yyyy-MM-dd");
      const confirmed = confirmedUpcomingSessions.get(dateKey);
      const presenter = confirmed ? trainerByName.get(confirmed.presenter) : null;
      await Session.create({
        sessionNumber: nextNumber,
        date,
        day: format(date, "EEEE"),
        presenter: presenter?._id || null,
        presenterName: confirmed?.presenter || "TBD",
        presenterInitials: confirmed?.presenterInitials || "TBD",
        topic: confirmed?.topic || "TBD",
        series: "The Construct",
        status: confirmed ? "Confirmed" : "Pending",
        approvalStatus: "Approved",
        month: format(date, "MMMM"),
        startTime: "14:00",
        endTime: "15:00",
        meetingLink: DEFAULT_MEETING_LINK,
        posterTheme: "navy-gold",
        tags: confirmed?.tags || ["TBD"],
        posterTopics: confirmed?.posterTopics || ["Topic confirmation pending", "Trainer confirmation pending", "Q&A"],
        requirements: ["Laptop", "Stable internet", "Ready to learn"],
        clickupTaskName: confirmed ? confirmed.topic : `Session ${nextNumber}`,
        assigneeCode: confirmed?.presenterInitials || "",
        dueDateLabel: format(date, "M/d/yy"),
        boardStatus: confirmed ? "active" : "open",
      });
      nextNumber += 1;
    }

    console.log("Seed completed successfully.");
    console.log("Admin login: ayush@iamneo.ai / Admin@123");
    console.log("Trainer password for all trainer accounts: Trainer@123");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
