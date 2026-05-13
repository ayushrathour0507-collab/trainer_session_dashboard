/**
 * Purpose: Signature animated 3D podium with particle field, floating avatars, crown, score count-up, and confetti burst.
 */
import PropTypes from "prop-types";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import ScoreCountUp from "../evaluation/ScoreCountUp.jsx";
import VerdictBadge from "../session/VerdictBadge.jsx";

const podiumMeta = [
  { rank: 2, label: "2nd Place", height: 90, tone: "silver", gradient: "var(--podium-silver)" },
  { rank: 1, label: "1st Place", height: 120, tone: "gold", gradient: "var(--podium-gold)" },
  { rank: 3, label: "3rd Place", height: 70, tone: "bronze", gradient: "var(--podium-bronze)" },
];

const initialsFor = (trainer = {}) => trainer.initials || trainer.trainer?.split(" ").map((part) => part[0]).join("").slice(0, 2) || "BB";

const PodiumStage = ({ trainers = [] }) => {
  const topThree = [trainers[1], trainers[0], trainers[2]];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const styles = window.getComputedStyle(document.documentElement);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.25 },
        colors: [
          styles.getPropertyValue("--accent").trim(),
          styles.getPropertyValue("--podium-gold-end").trim(),
          styles.getPropertyValue("--info").trim(),
        ],
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="nexus-card relative overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 20 }).map((_, index) => (
          <span
            key={index}
            className="absolute h-1.5 w-1.5 rounded-full bg-accent"
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 53) % 100}%`,
              opacity: 0.18 + ((index % 5) * 0.08),
              animation: `particlePulse ${2 + (index % 4)}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="label-tag text-accent">Signature Leaderboard</p>
            <h2 className="text-xl font-semibold">Trainer Champions Podium</h2>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent ml-6" />
        </div>
        <div className="grid min-h-[280px] grid-cols-3 items-end gap-3 [perspective:900px]">
          {podiumMeta.map((meta, index) => {
            const trainer = topThree[index] || {};
            const score = Number(trainer.avgScore || trainer.focusScore || trainer.score || 0);
            return (
              <article
                key={meta.rank}
                className="group flex flex-col items-center text-center transition hover:scale-[1.02]"
                style={{ animation: `podiumRise 700ms ${index * 200}ms both cubic-bezier(.2,.8,.2,1)` }}
              >
                <div className="relative mb-3" style={{ animation: "avatarFloat 3s ease-in-out infinite" }}>
                  {meta.rank === 1 ? <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl" style={{ animation: "crownBounce 1.6s ease-in-out infinite" }}>👑</div> : null}
                  <div className="grid h-12 w-12 place-items-center rounded-full border border-border bg-gradient-to-br from-accent to-info font-black text-white shadow-glow">
                    {initialsFor(trainer)}
                  </div>
                </div>
                <h3 className="max-w-[150px] truncate text-sm font-bold">{trainer.trainer || trainer.winner || "TBD"}</h3>
                <p className="text-xs text-textSecondary">{trainer.sessions || trainer.sessionsDelivered || 0} sessions</p>
                <ScoreCountUp value={score} className="mt-1.5 block font-mono text-2xl font-black" decimals={2} />
                <div className="mt-2"><VerdictBadge score={score} verdict={trainer.verdict?.label || trainer.verdict} /></div>
                <div
                  className="mt-3 flex w-full max-w-[220px] items-end justify-center rounded-t-lg px-4 pb-3 text-sm font-black text-white shadow-high transition group-hover:shadow-glow"
                  style={{ height: meta.height, background: meta.gradient, transform: "rotateX(10deg)" }}
                >
                  {meta.label}
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-5 h-px bg-accent/70" />
      </div>
    </section>
  );
};

PodiumStage.propTypes = {
  trainers: PropTypes.array.isRequired,
};

export default PodiumStage;
