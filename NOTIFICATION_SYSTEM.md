# Atlas Notification System Documentation

## Overview
Atlas uses a dual notification system: **in-app notifications** (bell icon dropdown) and **email notifications** (via Resend). This document outlines the current implementation and future use cases.

---

## Current Implementation

### 1. Project Invitations ✅ (IMPLEMENTED)

**When it triggers:** A project owner/admin invites a user to collaborate on a project

**In-app notification:**
- Displayed in the bell icon dropdown
- Shows sender name, project name, and timestamp
- Accept/Decline buttons for responding
- Status badge (Accepted/Declined) after response

**Email notification:**
- Professional HTML email with Atlas branding
- Includes project name, inviter's name
- "View Invitation" button linking to login page
- Recipients check their in-app notifications to accept/decline

**Technical implementation:**
- File: [`/server/src/controllers/projectController.js`](server/src/controllers/projectController.js:263-329) - `inviteUserToProject` function
- Email template: [`/server/src/utils/emailService.js`](server/src/utils/emailService.js:587-604) - `sendProjectInvitationEmail`
- Frontend component: [`/client/src/components/NotificationComponent.jsx`](client/src/components/NotificationComponent.jsx)
- Database model: [`/server/src/models/notificationModel.js`](server/src/models/notificationModel.js)

---

## Future Notification Use Cases

### 2. Task Assignments (RECOMMENDED - HIGH PRIORITY)

**When it triggers:** Someone assigns a task to you

**In-app notification:**
- "John Doe assigned you a task: 'Update homepage design'"
- Click to navigate directly to the task
- Show task priority and due date

**Email notification:**
- Subject: "You've been assigned a task in [Project Name]"
- Task details: title, description, due date, priority
- "View Task" button linking directly to the task page

**Benefits:**
- Team members instantly know when they have new work
- Reduces miscommunication about task ownership
- Helps prioritize work based on urgency

---

### 3. Task Mentions (RECOMMENDED - MEDIUM PRIORITY)

**When it triggers:** Someone @mentions you in a task comment or description

**In-app notification:**
- "@John mentioned you in a comment on 'Homepage Redesign'"
- Preview of the comment text
- Click to jump to the specific comment

**Email notification:**
- Subject: "[Name] mentioned you in [Project Name]"
- Quote the relevant comment/section
- Context about the task
- "View Comment" button

**Benefits:**
- Keep team members in the loop on relevant discussions
- Encourages collaboration and feedback
- Prevents important messages from being missed

---

### 4. Task Comments & Updates (RECOMMENDED - MEDIUM PRIORITY)

**When it triggers:** Someone comments on or updates a task you're assigned to or watching

**In-app notification:**
- "Sarah added a comment to 'Database Migration'"
- "Mike changed the due date on 'API Integration'"
- Show what changed (comment preview, field updates)

**Email notification (Daily digest option):**
- Batch multiple updates into one daily email
- Subject: "Daily Update: 5 tasks have new activity"
- Organized by project
- Links to each updated task

**Benefits:**
- Stay informed without constant interruptions
- Track task progress without manual checking
- Optional digest mode reduces email overload

---

### 5. Task Due Date Reminders (RECOMMENDED - HIGH PRIORITY)

**When it triggers:**
- 24 hours before task due date
- On task due date (if not completed)
- When task is overdue

**In-app notification:**
- "Task 'Update Documentation' is due tomorrow"
- "Task 'Fix Login Bug' is overdue by 2 days"
- Color-coded by urgency (yellow warning, red overdue)

**Email notification:**
- Subject: "Reminder: Task due [tomorrow/today/overdue]"
- List of all tasks due in that timeframe
- Priority indicators
- Quick action buttons: Mark Complete, View Task

**Benefits:**
- Prevents missed deadlines
- Helps with time management
- Reduces need for manual deadline tracking

---

### 6. Project Milestone Achievements (OPTIONAL - LOW PRIORITY)

**When it triggers:** Project reaches a milestone (50% complete, all tasks done, etc.)

**In-app notification:**
- "Congrats! Project 'Website Redesign' is 50% complete"
- Visual progress indicator

**Email notification:**
- Celebratory email to all project members
- Progress summary
- Next milestones

**Benefits:**
- Boosts team morale
- Provides visibility into project progress
- Celebrates team achievements

---

### 7. Project Role Changes (RECOMMENDED - MEDIUM PRIORITY)

**When it triggers:** User's role in a project changes (promoted to admin, made owner, etc.)

**In-app notification:**
- "You've been made an admin of 'Marketing Campaign'"
- List new permissions

**Email notification:**
- Subject: "Your role in [Project] has been updated"
- Explanation of new responsibilities
- Link to project

**Benefits:**
- Clear communication of permission changes
- Prevents confusion about access levels
- Documents role history

---

### 8. Subtask Completion (OPTIONAL - LOW PRIORITY)

**When it triggers:** All subtasks of a task you own are completed

**In-app notification:**
- "All subtasks completed for 'Launch Product'"
- Prompt to review and mark parent task as complete

**Email notification:**
- Not recommended (too granular for email)

**Benefits:**
- Helps track complex task dependencies
- Prompts task closure
- Useful for task owners managing delegated work

---

### 9. Project Deadline Approaching (RECOMMENDED - HIGH PRIORITY)

**When it triggers:**
- 7 days before project due date
- 3 days before project due date
- 1 day before project due date
- On project due date

**In-app notification:**
- "Project 'Q4 Launch' is due in 3 days"
- Show completion percentage
- List remaining incomplete tasks

**Email notification:**
- Subject: "Project Deadline Alert: [Project] due in X days"
- Progress summary
- List of incomplete tasks
- "View Project" button

**Benefits:**
- Keeps project on track
- Allows for last-minute priority adjustments
- Helps project owners manage timelines

---

### 10. User Removed from Project (RECOMMENDED - MEDIUM PRIORITY)

**When it triggers:** User is removed from a project's team

**In-app notification:**
- "You've been removed from 'Marketing Campaign'"
- Access revoked message

**Email notification:**
- Subject: "You've been removed from [Project Name]"
- Polite message about access changes
- Contact information if they have questions

**Benefits:**
- Transparent communication
- Prevents confusion about missing projects
- Professional courtesy

---

## Implementation Priority Recommendations

### Phase 1 (Immediate - Next Sprint)
1. ✅ Project Invitations (DONE)
2. Task Assignments
3. Task Due Date Reminders
4. Project Deadline Approaching

### Phase 2 (Short-term - 1-2 months)
5. Task Mentions
6. Task Comments & Updates (with daily digest option)
7. Project Role Changes
8. User Removed from Project

### Phase 3 (Long-term - Future Enhancement)
9. Project Milestone Achievements
10. Subtask Completion

---

## Technical Architecture

### Notification Model Schema
```javascript
{
  senderId: ObjectId,        // Who triggered the notification
  recipientId: ObjectId,     // Who receives it
  projectId: ObjectId,       // Related project
  taskId: ObjectId,          // Related task (for task notifications)
  type: String,              // 'invitation', 'task_assigned', 'mention', etc.
  message: String,           // Custom notification message
  actionUrl: String,         // Where to navigate when clicked
  isUnread: Boolean,         // Read status
  responded: Boolean,        // For invitations/actions
  accepted: Boolean,         // For invitations
  metadata: Object,          // Flexible field for additional data
  createdAt: Date,
  updatedAt: Date
}
```

### Email Service Structure
All email templates follow consistent Atlas branding:
- Gradient blue header (#0b80c3 to #0d9ae6)
- Circular logo with "A"
- Professional copy with clear CTAs
- Footer with company branding
- Responsive design for mobile

### Current Email Templates
1. ✅ Verification Email - For new user sign-ups
2. ✅ Password Reset Email - For forgotten passwords
3. ✅ Project Invitation Email - For project collaborators

### Future Email Templates Needed
4. Task Assignment Email
5. Task Mention Email
6. Daily Activity Digest Email
7. Due Date Reminder Email
8. Project Deadline Alert Email
9. Role Change Email
10. Project Removal Email

---

## Configuration

### Environment Variables Required
```
RESEND_API_KEY=re_xxxxx          # Resend API key
EMAIL_FROM=Atlas <noreply@yourdomain.com>  # Sender address
CLIENT_URL=https://yourapp.com    # Frontend URL for links
```

### User Preferences (Future Enhancement)
Consider adding user settings for notification preferences:
- Email notifications on/off per category
- In-app notifications on/off per category
- Daily digest vs. real-time emails
- Notification sound preferences
- Quiet hours (don't send emails during certain times)

---

## Testing Checklist

When implementing new notification types:

### In-App Notifications
- [ ] Notification appears in bell icon dropdown
- [ ] Unread count badge updates correctly
- [ ] Clicking notification marks as read
- [ ] Clicking notification navigates to correct page
- [ ] "Mark all as read" works
- [ ] Notifications sorted by date (newest first)
- [ ] Proper sender/project/task names displayed

### Email Notifications
- [ ] Email sends successfully via Resend
- [ ] Subject line is clear and specific
- [ ] HTML renders correctly in Gmail, Outlook, Apple Mail
- [ ] All links work and go to correct pages
- [ ] Branding matches Atlas design system
- [ ] Mobile responsive (test on phone)
- [ ] No broken images
- [ ] Unsubscribe link (if required by email provider)

### Error Handling
- [ ] Failed email doesn't break notification creation
- [ ] Errors logged properly
- [ ] Graceful degradation if Resend API is down
- [ ] User still sees in-app notification if email fails

---

## Best Practices

1. **Don't spam users**: Be thoughtful about what deserves a notification
2. **Batch when possible**: Daily digests for low-priority updates
3. **Clear CTAs**: Every notification should have a clear action
4. **Mobile-friendly**: Test on mobile devices
5. **Async email sending**: Never block API responses waiting for emails
6. **Retry logic**: Implement retries for failed email sends
7. **Logging**: Log all notification events for debugging
8. **Performance**: Index notification queries by recipientId and isUnread

---

## Related Files

### Backend
- [`/server/src/models/notificationModel.js`](server/src/models/notificationModel.js) - Notification database schema
- [`/server/src/controllers/projectController.js`](server/src/controllers/projectController.js) - Notification logic
- [`/server/src/utils/emailService.js`](server/src/utils/emailService.js) - Email templates and Resend integration
- [`/server/src/routes/projectRoutes.js`](server/src/routes/projectRoutes.js) - Notification API endpoints

### Frontend
- [`/client/src/components/NotificationComponent.jsx`](client/src/components/NotificationComponent.jsx) - Bell icon and dropdown
- [`/client/src/redux/slices/projectSlice.js`](client/src/redux/slices/projectSlice.js) - RTK Query API calls
- [`/client/src/contexts/ProjectsContext.jsx`](client/src/contexts/ProjectsContext.jsx) - Notification context provider

---

**Last Updated:** 2025-11-13
**Status:** Project Invitations implemented, other use cases planned
**Maintained by:** TDA Consulting
