// Purpose: Creates and edits KT session schedule records with normalized presenter selection and poster preview.
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PosterPreview from "../../components/poster/PosterPreview.jsx";
import { useSessions } from "../../hooks/useSessions.js";
import { leaderboardService } from "../../services/leaderboard.service.js";
import { formatLongDate } from "../../utils/dateUtils.js";

const statusOptions = ["Pending", "Confirmed", "Completed", "Postponed", "Cancelled"];
const defaultMeetingLink = "https://teams.microsoft.com/meet/43439073580887?p=T7TF7S4gDgaaQgKOkA";

const initialForm = {
  date: "",
  day: "Saturday",
  presenter: "",
  presenterName: "",
  topic: "",
  status: "Pending",
  meetingLink: defaultMeetingLink,
  startTime: "14:00",
  endTime: "15:00",
  summary: "",
  note: "",
  clickupCard: "",
  clickupTaskName: "",
  assigneeCode: "",
  priority: "Normal",
  dueDateLabel: "",
  boardStatus: "open",
  keyTakeaways: [],
  posterTopics: ["Core concepts", "Live walkthrough", "Q&A"],
  requirements: ["Laptop", "Stable internet", "Ready to learn"],
};

const asArray = (value) => Array.isArray(value) ? value : String(value || "").split("\n").filter(Boolean);

const dateLabel = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
};

const initials = (name) => String(name || "")
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join("")
  .toUpperCase();

const SessionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { selectedSession, loading, fetchSession, createSession, updateSession } = useSessions();
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [presenterMode, setPresenterMode] = useState("existing");

  useEffect(() => {
    leaderboardService.getTrainers().then(setTrainers).catch(() => setTrainers([]));
    if (isEdit) fetchSession(id);
  }, [fetchSession, id, isEdit]);

  useEffect(() => {
    if (isEdit && selectedSession?._id === id) {
      setForm({
        ...initialForm,
        ...selectedSession,
        date: selectedSession.date ? format(new Date(selectedSession.date), "yyyy-MM-dd") : "",
        presenter: selectedSession.presenter?._id || selectedSession.presenter || "",
        presenterName: selectedSession.presenter?.name || selectedSession.presenterName || "",
      });
      setPresenterMode(selectedSession.presenter?._id || selectedSession.presenter ? "existing" : "new");
    }
  }, [id, isEdit, selectedSession]);

  const update = (key, value) => {
    const next = { ...form, [key]: value };
    if (key === "date" && value) {
      next.day = format(new Date(value), "EEEE");
      if (!next.dueDateLabel) next.dueDateLabel = dateLabel(value);
    }
    if (key === "presenter") {
      const selectedTrainer = trainers.find((trainer) => trainer._id === value);
      next.presenterName = selectedTrainer?.name || "";
      next.assigneeCode = next.assigneeCode || initials(selectedTrainer?.name);
    }
    if (key === "presenterName") {
      next.presenter = "";
      next.assigneeCode = next.assigneeCode || initials(value);
    }
    if (key === "topic" && !next.clickupTaskName) next.clickupTaskName = value;
    setForm(next);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        presenter: presenterMode === "existing" ? form.presenter : "",
        presenterName: form.presenterName.trim(),
        clickupTaskName: form.clickupTaskName || form.topic,
        assigneeCode: form.assigneeCode || initials(form.presenterName),
        dueDateLabel: form.dueDateLabel || dateLabel(form.date),
        status: form.status,
        keyTakeaways: asArray(form.keyTakeaways),
        posterTopics: asArray(form.posterTopics),
        requirements: asArray(form.requirements),
      };
      if (!payload.presenterName) {
        toast.error("Presenter name is required");
        return;
      }
      if (isEdit) await updateSession(id, payload);
      else await createSession(payload);
      toast.success(isEdit ? "Session updated" : "Session created");
      navigate("/admin/sessions");
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    }
  };

  if (isEdit && loading && !selectedSession) return <LoadingSpinner label="Loading session form" />;

  const previewSession = {
    ...form,
    _id: id || "preview-session",
    sessionNumber: selectedSession?.sessionNumber || "New",
    date: form.date || new Date(),
    presenterName: form.presenterName || "TBD",
    posterTopics: asArray(form.posterTopics),
    requirements: asArray(form.requirements),
  };

  const previewFields = {
    topic: form.topic || "Session Topic",
    presenter: form.presenterName || "TBD",
    date: form.date ? formatLongDate(form.date) : "TBD",
    startTime: form.startTime,
    endTime: form.endTime,
    meetingLink: form.meetingLink,
    topics: asArray(form.posterTopics),
    requirements: asArray(form.requirements),
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="nexus-card p-4">
        <h1 className="text-2xl font-black text-light-text dark:text-dark-text">{isEdit ? "Edit Session" : "Create Session"}</h1>
        <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">
          Select an existing presenter or create one inline. Keep the status simple: Pending, Confirmed, Completed, Postponed, or Cancelled.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="nexus-card grid gap-3 p-4 md:grid-cols-2">
          <label><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Date</span><input className="field" type="date" value={form.date} onChange={(event) => update("date", event.target.value)} required /></label>
          <label><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Day</span><input className="field" value={form.day} onChange={(event) => update("day", event.target.value)} required /></label>

          <div className="md:col-span-2">
            <span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Presenter Name</span>
            <div className="grid gap-2 md:grid-cols-[0.8fr_1.2fr]">
              <select className="field" value={presenterMode === "new" ? "__new__" : form.presenter || ""} onChange={(event) => {
                if (event.target.value === "__new__") {
                  setPresenterMode("new");
                  update("presenterName", "");
                } else {
                  setPresenterMode("existing");
                  update("presenter", event.target.value);
                }
              }}>
                <option value="">Select presenter</option>
                {trainers.map((trainer) => <option key={trainer._id} value={trainer._id}>{trainer.name}</option>)}
                <option value="__new__">+ Create new presenter</option>
              </select>
              <input
                className="field"
                value={form.presenterName || ""}
                onChange={(event) => {
                  setPresenterMode("new");
                  update("presenterName", event.target.value);
                }}
                placeholder="Type presenter name"
                readOnly={presenterMode === "existing" && Boolean(form.presenter)}
                required
              />
            </div>
          </div>

          <label className="md:col-span-2"><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Topic</span><input className="field" value={form.topic} onChange={(event) => update("topic", event.target.value)} required /></label>
          <label><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Status</span><select className="field" value={form.status} onChange={(event) => update("status", event.target.value)}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Meeting Link</span><input className="field" value={form.meetingLink || defaultMeetingLink} readOnly /></label>
          <label><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Board Task Name</span><input className="field" value={form.clickupTaskName || ""} onChange={(event) => update("clickupTaskName", event.target.value)} /></label>
          <label><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Assignee Initials</span><input className="field" value={form.assigneeCode || ""} onChange={(event) => update("assigneeCode", event.target.value)} /></label>
          <label><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Priority</span><select className="field" value={form.priority || "Normal"} onChange={(event) => update("priority", event.target.value)}>{["Low", "Normal", "High", "Urgent"].map((priority) => <option key={priority}>{priority}</option>)}</select></label>
          <label><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Board State</span><select className="field" value={form.boardStatus || "open"} onChange={(event) => update("boardStatus", event.target.value)}>{["done", "active", "open", "blocked"].map((state) => <option key={state}>{state}</option>)}</select></label>
          <label><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Due Date Label</span><input className="field" value={form.dueDateLabel || ""} onChange={(event) => update("dueDateLabel", event.target.value)} placeholder="5/16/26" /></label>
          <label><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Start Time</span><input className="field" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} /></label>
          <label><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">End Time</span><input className="field" value={form.endTime} onChange={(event) => update("endTime", event.target.value)} /></label>
          <label className="md:col-span-2"><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Poster Topics</span><textarea className="field min-h-[90px]" value={asArray(form.posterTopics).join("\n")} onChange={(event) => update("posterTopics", event.target.value)} /></label>
          <label className="md:col-span-2"><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Requirements</span><textarea className="field min-h-[80px]" value={asArray(form.requirements).join("\n")} onChange={(event) => update("requirements", event.target.value)} /></label>
          <label className="md:col-span-2"><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Summary</span><textarea className="field min-h-[110px]" value={form.summary || ""} onChange={(event) => update("summary", event.target.value)} /></label>
          <label className="md:col-span-2"><span className="mb-1 block text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Key Takeaways</span><textarea className="field min-h-[90px]" value={asArray(form.keyTakeaways).join("\n")} onChange={(event) => update("keyTakeaways", event.target.value)} /></label>
        </div>
        <aside className="nexus-card flex justify-center p-4 xl:sticky xl:top-20 xl:self-start">
          <PosterPreview session={previewSession} fields={previewFields} />
        </aside>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="secondary-button px-4" onClick={() => navigate("/admin/sessions")}>Cancel</button>
        <button type="submit" className="primary-button px-4">Save Session</button>
      </div>
    </form>
  );
};

export default SessionForm;
