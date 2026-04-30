# ClickUp Integration Guide

## Overview
This application now has **bidirectional real-time sync with ClickUp**. When you update tasks in ClickUp, the changes automatically appear in this website instantly!

## How It Works

1. **ClickUp Webhook** - When a task is updated in ClickUp, it sends a webhook to our system
2. **Auto Update** - The session data is automatically updated in the database
3. **Real-Time Sync** - All connected users see the changes instantly via Supabase Realtime
4. **Visual Notification** - A green notification shows "ClickUp changes synced!"

## Setup Instructions

### Step 1: Get Your Webhook URL
Your webhook endpoint is:
```
https://senxosysegjbznwuqcpp.supabase.co/functions/v1/clickup_webhook
```

### Step 2: Configure ClickUp Webhook

1. Go to your **ClickUp Workspace**
2. Click **Settings** (gear icon)
3. Navigate to **Integrations** → **Webhooks**
4. Click **Add Webhook**
5. Set Event Type to:
   - ✓ Task Updated
   - ✓ Task Created  
   - ✓ Task Deleted
6. Paste the webhook URL above
7. Click **Create Webhook**

### Step 3: Create Custom Field in ClickUp

1. In ClickUp, go to **Space Settings**
2. Click **Custom Fields**
3. Click **Add Custom Field**
4. Name it: `session_id`
5. Type: **Text**
6. Save the field

### Step 4: Link ClickUp Tasks to Sessions

1. In this app, create a session and copy its ID
2. In ClickUp, open the corresponding task
3. Scroll to custom fields section
4. Paste the session ID in the `session_id` field
5. Save the task

### Step 5: Test the Integration

1. Open a ClickUp task linked to a session
2. Change the task name (e.g., "My Session - Updated")
3. Watch this website's Dashboard in real-time
4. The session title updates instantly with a sync notification!

## What Syncs

✅ **Session Topic** - Updates when task name changes in ClickUp
✅ **Real-Time Updates** - Changes appear within 1-2 seconds
✅ **All Viewers** - Everyone viewing the Dashboard sees updates instantly
✅ **Audit Trail** - All webhook events logged in `webhook_logs` table

## Example Workflow

```
1. Create Session "Advanced React"
   ↓ (Copy Session ID)
2. Create ClickUp Task "Advanced React - Session"
   ↓ (Add session_id custom field)
3. Update task name in ClickUp → "Advanced React - Final Edition"
   ↓ (Webhook triggers immediately)
4. Dashboard updates in real-time ✓
```

## Multiple Users

All users viewing the Dashboard will see updates simultaneously when someone updates a ClickUp task. Perfect for teams!

## Troubleshooting

**Webhook not triggering?**
- Verify webhook URL in ClickUp settings
- Check that ClickUp task has `session_id` custom field set
- Check `webhook_logs` table for errors

**Changes not appearing?**
- Refresh the page (Ctrl+R or Cmd+R)
- Check that Real-time Subscriptions are enabled
- Look for sync notification in top-right corner

**Missing session_id field?**
- Go to ClickUp Space Settings → Custom Fields
- Ensure field is named exactly `session_id`
- Make sure it's a Text field type

## Advanced Options

The webhook can be customized to sync additional fields. Contact your admin to request more sync features.
