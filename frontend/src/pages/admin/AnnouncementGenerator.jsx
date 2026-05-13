// Purpose: Generates and saves Teams announcements for a selected KT session.
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AnnouncementControls from "../../components/announcement/AnnouncementGenerator.jsx";
import AnnouncementPreview from "../../components/announcement/AnnouncementPreview.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { sessionService } from "../../services/session.service.js";
import { useSessionStore } from "../../store/sessionStore.js";
import { fillAnnouncementTemplate } from "../../utils/announcementTemplates.js";

const AnnouncementGenerator = () => {
  const { sessionId } = useParams();
  const { selectedSession, loading, fetchSession } = useSessionStore();
  const [type, setType] = useState("pre-session");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchSession(sessionId);
  }, [fetchSession, sessionId]);

  useEffect(() => {
    if (selectedSession?._id === sessionId) {
      setContent(fillAnnouncementTemplate(selectedSession, type));
    }
  }, [selectedSession, sessionId, type]);

  const save = async () => {
    try {
      const data = await sessionService.generateAnnouncement({ sessionId, type, overrides: {}, save: true });
      setContent(data.content);
      toast.success("Announcement generated and saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Announcement generation failed");
    }
  };

  if (loading || !selectedSession) return <LoadingSpinner label="Loading announcement generator" />;

  return (
    <div className="space-y-4">
      <AnnouncementControls session={selectedSession} type={type} onTypeChange={setType} content={content} onContentChange={setContent} />
      <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="nexus-card p-4">
          <h1 className="text-2xl font-black text-light-text dark:text-dark-text">Announcement Generator</h1>
          <p className="mt-1 text-sm font-bold text-light-subtext dark:text-dark-subtext">{selectedSession.topic} · {selectedSession.presenterName}</p>
          <button type="button" className="primary-button mt-4 w-full px-4" onClick={save}><Save className="h-4 w-4" /> Generate Article</button>
        </div>
        <AnnouncementPreview content={content} onChange={setContent} />
      </div>
    </div>
  );
};

export default AnnouncementGenerator;
