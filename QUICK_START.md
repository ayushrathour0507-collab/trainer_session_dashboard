# Quick Start Guide

## What You Get

✅ Beautiful evaluation dashboard with light/dark mode
✅ Real-time ClickUp integration (auto-sync)
✅ Attendee feedback collection
✅ AI-powered feedback summarization
✅ Monthly rankings and winner recognition
✅ Mobile-responsive design

## 1-Minute Setup

### Step 1: ClickUp Webhook (2 minutes)
1. Go to ClickUp Workspace Settings → Integrations → Webhooks
2. Create a webhook with URL:
   ```
   https://senxosysegjbznwuqcpp.supabase.co/functions/v1/clickup_webhook
   ```
3. Select: `taskUpdated`, `taskCreated`, `taskDeleted`
4. Save

### Step 2: ClickUp Custom Field (1 minute)
1. Go to Space Settings → Custom Fields
2. Click "Add Custom Field"
3. Name: `session_id` (exact spelling!)
4. Type: Text
5. Save

### That's It! 🎉

## Using the App

### Create a Session
1. Click "Add Session" tab
2. Fill in topic, date, trainer name
3. Click "Add Session"

### Link to ClickUp
1. Copy the session ID (visible in Dashboard)
2. Go to your ClickUp task
3. In custom fields, paste the session ID
4. Watch the Dashboard update in real-time!

### Collect Feedback
1. Share "Feedback" tab link with attendees
2. They submit ratings, comments, recommendations
3. You see feedback appear instantly

### Get Insights
1. Go to Dashboard
2. Click "Summarize with AI" on any session
3. Get AI-generated feedback summary

### See Rankings
1. Click "Summary" tab
2. View monthly winner with full details
3. See ranked list of all sessions

## Key Features

| Feature | Where |
|---------|-------|
| Create sessions | Add Session tab |
| Collect feedback | Feedback tab |
| View evaluations | Dashboard tab |
| See rankings | Summary tab |
| Toggle dark mode | Header (moon/sun icon) |
| Sync with ClickUp | Automatic! |

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Submit form | Ctrl+Enter / Cmd+Enter |
| Dark mode | No shortcut (click button) |
| Refresh | Ctrl+R / Cmd+R |

## Real-Time Sync Example

```
You (in ClickUp):
  Change task name: "React Basics" → "Advanced React"
  
Website (automatically):
  1. Receives webhook (instant)
  2. Updates database (< 1 second)
  3. Syncs to all viewers (< 2 seconds)
  4. Shows green "ClickUp changes synced!" notification
```

## Tips & Tricks

### 💡 Copy Session IDs
- Click the session to see its full ID
- Right-click to copy
- Paste into ClickUp task

### 🎨 Dark Mode
- Click the moon icon in header to enable dark mode
- Your preference is saved automatically

### ⭐ Feedback Tips
- Attendee feedback is completely optional
- Names are optional (anonymous feedback works too)
- AI summarization requires Gemini API key (ask admin)

### 🏆 Monthly Winner
- Automatically calculated from evaluations
- Shows overall score, feedback score, org checks
- Updated when new evaluations are added

## Common Questions

**Q: Do I need to refresh to see ClickUp changes?**
A: No! The app automatically syncs in real-time. You'll see a green notification.

**Q: Can multiple people view at once?**
A: Yes! Everyone sees updates simultaneously using real-time sync.

**Q: What if ClickUp changes aren't showing?**
A: Make sure the `session_id` custom field is populated in your ClickUp task.

**Q: Can attendees see other feedback?**
A: Yes, feedback is public on the Dashboard. Adjust privacy as needed.

**Q: What's the green notification?**
A: That shows when ClickUp changes were synced to the website.

## Support

Check these docs for detailed info:
- `CLICKUP_INTEGRATION.md` - ClickUp setup details
- `FEATURES.md` - Complete feature list
- `IMPLEMENTATION_SUMMARY.md` - Technical details

## Ready to Go! 🚀

Your Bytes & Beyond evaluation system is ready to use. Start with:

1. ✅ Add a session
2. ✅ Create a ClickUp task
3. ✅ Link them with session_id
4. ✅ Watch real-time sync work!

Questions? Check the troubleshooting section in `CLICKUP_INTEGRATION.md`.
