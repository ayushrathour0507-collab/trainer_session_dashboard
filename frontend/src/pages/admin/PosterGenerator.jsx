// Purpose: Provides live poster editing and exports the selected session poster as an image.
import html2canvas from "html2canvas";
import { Download, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PosterEditor from "../../components/poster/PosterEditor.jsx";
import PosterPreview from "../../components/poster/PosterPreview.jsx";
import { useSessionStore } from "../../store/sessionStore.js";
import { formatLongDate } from "../../utils/dateUtils.js";

const PosterGenerator = () => {
  const { sessionId } = useParams();
  const { selectedSession, loading, fetchSession } = useSessionStore();
  const [fields, setFields] = useState({});

  useEffect(() => {
    fetchSession(sessionId);
  }, [fetchSession, sessionId]);

  useEffect(() => {
    if (selectedSession?._id === sessionId) {
      setFields({
        topic: selectedSession.topic,
        presenter: selectedSession.presenterName,
        date: formatLongDate(selectedSession.date),
        startTime: selectedSession.startTime,
        endTime: selectedSession.endTime,
        meetingLink: selectedSession.meetingLink,
        topics: selectedSession.posterTopics || ["Core concepts", "Live walkthrough", "Q&A"],
        requirements: selectedSession.requirements || ["Laptop", "Stable internet", "Ready to learn"],
      });
    }
  }, [selectedSession, sessionId]);

  const download = async (type = "png") => {
    const target = document.getElementById("poster-preview");
    const canvas = await html2canvas(target, { scale: 2, backgroundColor: null });
    const link = document.createElement("a");
    link.download = `bytesandbeyond-session-${selectedSession.sessionNumber}.${type}`;
    link.href = type === "jpeg" ? canvas.toDataURL("image/jpeg", 0.92) : canvas.toDataURL("image/png");
    link.click();
    toast.success(`Poster ${type.toUpperCase()} downloaded`);
  };

  if (loading || !selectedSession) return <LoadingSpinner label="Loading poster generator" />;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <PosterEditor fields={fields} onChange={setFields} />
      <div className="space-y-3">
        <div className="nexus-card flex flex-col gap-2.5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-light-text dark:text-dark-text">Poster Generator</h1>
            <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">Session #{selectedSession.sessionNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="primary-button px-3" onClick={() => download("png")}><Download className="h-4 w-4" /> PNG</button>
            <button type="button" className="secondary-button px-3" onClick={() => download("jpeg")}><Download className="h-4 w-4" /> JPEG</button>
            <Link to={`/admin/announce/${sessionId}`} className="secondary-button px-3"><Megaphone className="h-4 w-4" /> Announcement</Link>
          </div>
        </div>
        <div className="flex justify-center">
          <PosterPreview session={selectedSession} fields={fields} />
        </div>
      </div>
    </div>
  );
};

export default PosterGenerator;
