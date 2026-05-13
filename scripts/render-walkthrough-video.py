# Purpose: Renders the BytesAndBeyond Full HD walkthrough MP4, Indian-accent narration, captions, and interactive player.
from __future__ import annotations

import asyncio
import html
import json
import math
import re
import shutil
import subprocess
from datetime import timedelta
from pathlib import Path

import edge_tts
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path.cwd()
OUTPUT_DIR = ROOT / "demo-video"
SCREENSHOT_DIR = OUTPUT_DIR / "screenshots"
BUILD_DIR = OUTPUT_DIR / "build"
AUDIO_DIR = BUILD_DIR / "audio"
SLIDE_DIR = BUILD_DIR / "slides"
SEGMENT_DIR = BUILD_DIR / "segments"
VIDEO_PATH = OUTPUT_DIR / "bytesandbeyond-fullhd-walkthrough.mp4"
CAPTIONS_PATH = OUTPUT_DIR / "captions.vtt"
SRT_PATH = OUTPUT_DIR / "captions.srt"
PLAYER_PATH = OUTPUT_DIR / "interactive-player.html"
METADATA_PATH = OUTPUT_DIR / "walkthrough-metadata.json"
VOICE = "en-IN-PrabhatNeural"
FPS = 30
WIDTH = 1920
HEIGHT = 1080


SCENES = [
    {
        "id": "01-trainer-dashboard",
        "section": "Trainer Portal",
        "title": "Trainer Dashboard",
        "subtitle": "Personal performance, assigned sessions, improvement tips, and notifications in one place.",
        "narration": (
            "First, let us start with the trainer portal. The dashboard gives every trainer a quick view of their "
            "sessions delivered, average score, best score, verdict badge, latest notifications, and improvement tips. "
            "This helps the trainer understand where they stand before checking detailed feedback."
        ),
    },
    {
        "id": "02-trainer-sessions",
        "section": "Trainer Portal",
        "title": "My Sessions",
        "subtitle": "Trainers can track completed, upcoming, and assigned KT sessions without admin access.",
        "narration": (
            "In My Sessions, trainers can see the sessions assigned to them and the sessions already delivered. "
            "Each card shows the topic, date, status, rating, attendance, and feedback count, so the trainer has a clean record of their KT journey."
        ),
    },
    {
        "id": "03-trainer-feedback",
        "section": "Trainer Portal",
        "title": "Anonymous Feedback",
        "subtitle": "Published responses are visible one by one, but attendee identity stays hidden from trainers.",
        "narration": (
            "The feedback page shows published attendee responses anonymously. Trainers can read one response at a time, "
            "learn what worked well, and improve based on common suggestions. Admin approval controls what becomes visible here."
        ),
    },
    {
        "id": "04-admin-dashboard",
        "section": "Admin Portal",
        "title": "Admin Command Center",
        "subtitle": "Ayush can monitor KPIs, activity, pending actions, notifications, and monthly performance.",
        "narration": (
            "Now we move to the admin portal. The admin dashboard is the command center for Ayush. "
            "It shows total sessions, completed and upcoming sessions, average score, feedback volume, active trainers, pending actions, notifications, and performance trends."
        ),
    },
    {
        "id": "05-admin-sessions",
        "section": "Admin Portal",
        "title": "Nexus Session Board",
        "subtitle": "ClickUp-style schedule management with assignee, priority, due date, and module status.",
        "narration": (
            "The session board keeps the Nexus module schedule in one place. Admin can review task names, assignees, priority, due dates, module status, "
            "and open actions like edit, evaluation, poster generation, and announcement generation."
        ),
    },
    {
        "id": "06-admin-evaluate",
        "section": "Admin Portal",
        "title": "Admin Insights & Rating",
        "subtitle": "Trainer rating combines attendee feedback with mandatory organiser checks and admin insight.",
        "narration": (
            "After a session is complete, admin enters the evaluation. The score is not decided only by attendee feedback. "
            "Admin also confirms things like start on time, completion on time, icebreaker, Q and A, structure, clarity, practicality, interaction, and time efficiency. "
            "Only after these inputs are saved, the system calculates the overall rating and verdict."
        ),
    },
    {
        "id": "07-admin-feedback",
        "section": "Admin Portal",
        "title": "Feedback Collection",
        "subtitle": "Microsoft Forms responses can be parsed, reviewed, summarised, and controlled before publishing.",
        "narration": (
            "In feedback management, admin can paste Microsoft Forms export data, parse responses, connect them with the correct session, "
            "review individual responses, and generate a collective summary for Teams or internal updates."
        ),
    },
    {
        "id": "08-admin-poster",
        "section": "Admin Portal",
        "title": "Poster Generator",
        "subtitle": "A live poster form auto-fills presenter, topic, date, time, topics, and requirements.",
        "narration": (
            "The poster generator works like a live poster form. It automatically uses session data such as presenter, topic, date, time, meeting link, "
            "topics, requirements, and status, and gives admin a polished preview that can be downloaded."
        ),
    },
    {
        "id": "09-admin-announce",
        "section": "Admin Portal",
        "title": "Announcement Generator",
        "subtitle": "Generate pre-session, reminder, wrap-up, postponement, and reschedule messages.",
        "narration": (
            "The announcement generator creates ready-to-copy Teams messages. Admin can choose pre-session, reminder, wrap-up, postponement, "
            "or reschedule formats, edit the generated text, and copy the final message instantly."
        ),
    },
    {
        "id": "10-leaderboard",
        "section": "Admin & Public View",
        "title": "Leaderboard & Winners",
        "subtitle": "Monthly winners and trainer rankings are calculated from overall scores, not raw feedback alone.",
        "narration": (
            "Finally, the leaderboard ranks trainers by average overall score. Monthly winners are calculated using the combined score, "
            "where attendee feedback has major impact, but admin insights and organiser checks are mandatory. This keeps the KT programme fair, transparent, and action oriented."
        ),
    },
]


def ensure_dirs() -> None:
    for folder in [BUILD_DIR, AUDIO_DIR, SLIDE_DIR, SEGMENT_DIR]:
        folder.mkdir(parents=True, exist_ok=True)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/segoeuib.ttf") if bold else Path("C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf") if bold else Path("C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default(size=size)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, selected_font: ImageFont.FreeTypeFont, width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        proposed = f"{current} {word}".strip()
        if draw.textbbox((0, 0), proposed, font=selected_font)[2] <= width:
            current = proposed
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def fit_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    source_w, source_h = image.size
    scale = max(target_w / source_w, target_h / source_h)
    resized = image.resize((math.ceil(source_w * scale), math.ceil(source_h * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def make_gradient(size: tuple[int, int]) -> Image.Image:
    gradient = Image.new("RGBA", size, (0, 0, 0, 0))
    pixels = gradient.load()
    width, height = size
    for y in range(height):
      for x in range(width):
        bottom_alpha = int(160 * max(0, (y - height * 0.44) / (height * 0.56)))
        left_alpha = int(50 * max(0, 1 - x / (width * 0.75)))
        pixels[x, y] = (5, 10, 24, min(190, bottom_alpha + left_alpha))
    return gradient


def draw_glass_panel(base: Image.Image, box: tuple[int, int, int, int], radius: int = 34) -> None:
    x1, y1, x2, y2 = box
    region = base.crop(box).filter(ImageFilter.GaussianBlur(18))
    mask = Image.new("L", (x2 - x1, y2 - y1), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, x2 - x1, y2 - y1), radius=radius, fill=255)
    overlay = Image.new("RGBA", (x2 - x1, y2 - y1), (255, 255, 255, 42))
    region = Image.alpha_composite(region.convert("RGBA"), overlay)
    base.paste(region, (x1, y1), mask)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(box, radius=radius, outline=(255, 255, 255, 86), width=2)


def create_slide(scene: dict, index: int) -> Path:
    screenshot_path = SCREENSHOT_DIR / f"{scene['id']}.png"
    if not screenshot_path.exists():
        raise FileNotFoundError(f"Missing screenshot: {screenshot_path}")

    screenshot = fit_cover(Image.open(screenshot_path).convert("RGB"), (WIDTH, HEIGHT)).convert("RGBA")
    base = screenshot.filter(ImageFilter.GaussianBlur(0.4))
    base.alpha_composite(make_gradient((WIDTH, HEIGHT)))

    draw_glass_panel(base, (96, 724, 1824, 1010))
    draw = ImageDraw.Draw(base)

    section_font = font(30, bold=True)
    title_font = font(58, bold=True)
    subtitle_font = font(32, bold=False)
    small_font = font(26, bold=True)

    draw.rounded_rectangle((132, 758, 390, 812), radius=27, fill=(3, 37, 189, 220))
    draw.text((158, 768), scene["section"].upper(), font=small_font, fill=(255, 255, 255, 255))

    step_text = f"{index:02d} / {len(SCENES):02d}"
    step_box = draw.textbbox((0, 0), step_text, font=small_font)
    draw.rounded_rectangle((1624, 758, 1788, 812), radius=27, fill=(255, 255, 255, 42), outline=(255, 255, 255, 92))
    draw.text((1706 - (step_box[2] - step_box[0]) // 2, 768), step_text, font=small_font, fill=(255, 255, 255, 245))

    draw.text((132, 838), scene["title"], font=title_font, fill=(255, 255, 255, 255))
    subtitle_lines = wrap_text(draw, scene["subtitle"], subtitle_font, 1520)
    y = 920
    for line in subtitle_lines[:2]:
        draw.text((132, y), line, font=subtitle_font, fill=(223, 231, 246, 240))
        y += 42

    slide_path = SLIDE_DIR / f"{scene['id']}.png"
    base.convert("RGB").save(slide_path, quality=95)
    return slide_path


async def synthesize_audio(scene: dict) -> Path:
    audio_path = AUDIO_DIR / f"{scene['id']}.mp3"
    communicator = edge_tts.Communicate(scene["narration"], voice=VOICE, rate="+0%", pitch="+0Hz")
    await communicator.save(str(audio_path))
    return audio_path


def ffmpeg_path() -> str:
    return imageio_ffmpeg.get_ffmpeg_exe()


def duration_seconds(audio_path: Path) -> float:
    command = [ffmpeg_path(), "-i", str(audio_path), "-f", "null", "-"]
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    output = f"{result.stdout}\n{result.stderr}"
    match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", output)
    if not match:
        return 7.0
    hours, minutes, seconds = match.groups()
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def render_segment(scene: dict, slide_path: Path, audio_path: Path, duration: float) -> Path:
    segment_path = SEGMENT_DIR / f"{scene['id']}.mp4"
    command = [
        ffmpeg_path(),
        "-y",
        "-loop",
        "1",
        "-framerate",
        str(FPS),
        "-t",
        f"{duration:.2f}",
        "-i",
        str(slide_path),
        "-i",
        str(audio_path),
        "-vf",
        "scale=1920:1080:flags=lanczos,format=yuv420p",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-tune",
        "stillimage",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        str(segment_path),
    ]
    subprocess.run(command, check=True)
    return segment_path


def concat_segments(segment_paths: list[Path]) -> None:
    concat_file = BUILD_DIR / "concat.txt"
    concat_file.write_text(
        "\n".join(f"file '{path.as_posix()}'" for path in segment_paths),
        encoding="utf-8",
    )
    command = [
        ffmpeg_path(),
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(concat_file),
        "-c",
        "copy",
        str(VIDEO_PATH),
    ]
    subprocess.run(command, check=True)


def timestamp(seconds: float, comma: bool = False) -> str:
    total_ms = int(seconds * 1000)
    td = timedelta(milliseconds=total_ms)
    hours, remainder = divmod(td.seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    hours += td.days * 24
    ms = td.microseconds // 1000
    separator = "," if comma else "."
    return f"{hours:02d}:{minutes:02d}:{secs:02d}{separator}{ms:03d}"


def write_captions(timeline: list[dict]) -> None:
    vtt_lines = ["WEBVTT", ""]
    srt_lines = []
    for index, item in enumerate(timeline, start=1):
        caption = item["narration"]
        vtt_lines.extend([
            f"{timestamp(item['start'])} --> {timestamp(item['end'])}",
            caption,
            "",
        ])
        srt_lines.extend([
            str(index),
            f"{timestamp(item['start'], comma=True)} --> {timestamp(item['end'], comma=True)}",
            caption,
            "",
        ])
    CAPTIONS_PATH.write_text("\n".join(vtt_lines), encoding="utf-8")
    SRT_PATH.write_text("\n".join(srt_lines), encoding="utf-8")


def write_player(timeline: list[dict]) -> None:
    chapter_buttons = "\n".join(
        f"""<button type="button" class="chapter" data-time="{item['start']:.2f}">
          <span>{html.escape(item['section'])}</span>
          <strong>{html.escape(item['title'])}</strong>
          <small>{timestamp(item['start'])}</small>
        </button>"""
        for item in timeline
    )
    transcript = "\n".join(
        f"""<article class="transcript-card">
          <p>{timestamp(item['start'])} · {html.escape(item['section'])}</p>
          <h3>{html.escape(item['title'])}</h3>
          <div>{html.escape(item['narration'])}</div>
        </article>"""
        for item in timeline
    )

    PLAYER_PATH.write_text(
        f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BytesAndBeyond Interactive Walkthrough</title>
  <style>
    :root {{
      color-scheme: dark;
      --bg: #0d1428;
      --panel: rgba(255,255,255,0.11);
      --border: rgba(255,255,255,0.18);
      --text: #f8fafc;
      --muted: #9fb0cb;
      --accent: #c9a84c;
      font-family: Inter, "Segoe UI", system-ui, sans-serif;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      min-height: 100vh;
      margin: 0;
      color: var(--text);
      background:
        radial-gradient(circle at 14% 8%, rgba(3,37,189,.34), transparent 30%),
        radial-gradient(circle at 88% 18%, rgba(16,185,129,.19), transparent 28%),
        linear-gradient(180deg, #0d1428, #111827);
    }}
    .shell {{ width: min(1520px, calc(100% - 40px)); margin: 0 auto; padding: 32px 0 56px; }}
    header {{ display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 22px; }}
    h1 {{ margin: 0; font-size: clamp(30px, 4vw, 56px); line-height: 1; letter-spacing: 0; }}
    .tagline {{ margin: 12px 0 0; color: var(--muted); font-weight: 700; }}
    .voice {{ color: var(--accent); font-weight: 900; }}
    .grid {{ display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }}
    .glass {{
      border: 1px solid var(--border);
      border-radius: 24px;
      background: linear-gradient(145deg, rgba(255,255,255,.13), transparent 40%), var(--panel);
      box-shadow: 0 24px 80px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.12);
      backdrop-filter: blur(24px) saturate(170%);
      -webkit-backdrop-filter: blur(24px) saturate(170%);
    }}
    video {{ display: block; width: 100%; aspect-ratio: 16 / 9; border-radius: 24px; background: #020617; }}
    .chapters {{ padding: 16px; max-height: 72vh; overflow: auto; }}
    .chapters h2, .transcript h2 {{ margin: 0 0 14px; font-size: 18px; }}
    .chapter {{
      width: 100%;
      margin: 0 0 10px;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 16px;
      color: var(--text);
      background: rgba(255,255,255,.07);
      text-align: left;
      cursor: pointer;
    }}
    .chapter:hover {{ border-color: rgba(201,168,76,.7); background: rgba(201,168,76,.12); }}
    .chapter span, .chapter small {{ display: block; color: var(--muted); font-size: 12px; font-weight: 800; }}
    .chapter strong {{ display: block; margin: 4px 0; font-size: 15px; }}
    .transcript {{ margin-top: 20px; padding: 18px; }}
    .transcript-grid {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }}
    .transcript-card {{ border: 1px solid var(--border); border-radius: 18px; padding: 14px; background: rgba(255,255,255,.06); }}
    .transcript-card p {{ margin: 0 0 8px; color: var(--muted); font-size: 12px; font-weight: 900; }}
    .transcript-card h3 {{ margin: 0 0 8px; font-size: 16px; }}
    .transcript-card div {{ color: #dbe6f8; line-height: 1.55; font-size: 14px; }}
    @media (max-width: 980px) {{ .grid, .transcript-grid {{ grid-template-columns: 1fr; }} .chapters {{ max-height: none; }} }}
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div>
        <h1>BytesAndBeyond Walkthrough</h1>
        <p class="tagline">Trainer portal first, then admin portal. Narration voice: <span class="voice">{VOICE}</span>.</p>
      </div>
    </header>
    <section class="grid">
      <div class="glass">
        <video id="walkthrough" controls preload="metadata" poster="./build/slides/01-trainer-dashboard.png">
          <source src="./bytesandbeyond-fullhd-walkthrough.mp4" type="video/mp4" />
          <track kind="subtitles" src="./captions.vtt" srclang="en-IN" label="English captions" default />
        </video>
      </div>
      <aside class="glass chapters">
        <h2>Interactive Chapters</h2>
        {chapter_buttons}
      </aside>
    </section>
    <section class="glass transcript">
      <h2>Transcript</h2>
      <div class="transcript-grid">
        {transcript}
      </div>
    </section>
  </main>
  <script>
    const video = document.querySelector("#walkthrough");
    document.querySelectorAll(".chapter").forEach((button) => {{
      button.addEventListener("click", () => {{
        video.currentTime = Number(button.dataset.time || 0);
        video.play();
      }});
    }});
  </script>
</body>
</html>
""",
        encoding="utf-8",
    )


async def main() -> None:
    if not SCREENSHOT_DIR.exists():
        raise FileNotFoundError("Run scripts/capture-walkthrough-screenshots.mjs before rendering the video.")

    ensure_dirs()
    timeline: list[dict] = []
    segment_paths: list[Path] = []
    current_time = 0.0

    for index, scene in enumerate(SCENES, start=1):
        print(f"Rendering scene {index}: {scene['title']}")
        slide_path = create_slide(scene, index)
        audio_path = await synthesize_audio(scene)
        scene_duration = max(5.5, duration_seconds(audio_path) + 0.35)
        segment_path = render_segment(scene, slide_path, audio_path, scene_duration)
        segment_paths.append(segment_path)
        timeline.append({
            **scene,
            "start": current_time,
            "end": current_time + scene_duration,
            "duration": scene_duration,
            "slide": str(slide_path.relative_to(OUTPUT_DIR)).replace("\\", "/"),
            "audio": str(audio_path.relative_to(OUTPUT_DIR)).replace("\\", "/"),
        })
        current_time += scene_duration

    concat_segments(segment_paths)
    write_captions(timeline)
    write_player(timeline)
    METADATA_PATH.write_text(
        json.dumps({
            "title": "BytesAndBeyond Full HD Walkthrough",
            "voice": VOICE,
            "resolution": f"{WIDTH}x{HEIGHT}",
            "fps": FPS,
            "durationSeconds": round(current_time, 2),
            "video": VIDEO_PATH.name,
            "captions": CAPTIONS_PATH.name,
            "chapters": timeline,
        }, indent=2),
        encoding="utf-8",
    )

    print(f"Video: {VIDEO_PATH}")
    print(f"Interactive player: {PLAYER_PATH}")


if __name__ == "__main__":
    asyncio.run(main())
