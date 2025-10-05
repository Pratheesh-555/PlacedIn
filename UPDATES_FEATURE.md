# Recent Updates Feature Documentation

## Overview
The "Recent Updates" feature allows admins to post announcements, important information, and updates that appear on the homepage for all users to see. This is perfect for sharing placement/internship news, important dates, company visit information, etc.

## Features

### For Users
- **Homepage Widget**: Updates appear in a fixed widget on the bottom-right of the homepage (desktop only)
- **Recent Updates**: Shows the 5 most recent updates
- **Click to Read**: Click any update card to read the full content
- **Modal View**: Full content displays in a clean modal with white background and black text
- **Company Tags**: Each update shows which company it's related to
- **Timestamps**: Shows when the update was posted

### For Admins
- **Easy Posting**: Admins can create updates through the Admin Dashboard
- **Three Fields**:
  1. **Company Name**: The company or organization the update is about
  2. **Title**: A brief, attention-grabbing title
  3. **Content**: Full update text (supports pasting from Word, text files, etc.)
- **Manage Updates**: View all updates, see view counts, and delete updates
- **Soft Delete**: Deleted updates are hidden from users but remain in the database

## How to Use

### Creating an Update (Admin)

1. **Navigate to Admin Dashboard**
   - Sign in as an admin
   - Go to Admin Dashboard

2. **Open Updates Tab**
   - Click on the "Updates" tab (megaphone icon)

3. **Click "New Update"**
   - Click the blue "New Update" button

4. **Fill in the Form**:
   - **Company Name**: e.g., "Google", "Microsoft", "Amazon"
   - **Title**: e.g., "Google Campus Drive - Oct 15th"
   - **Content**: Paste your full update text
     - Can paste from Word documents
     - Can paste from text files
     - Line breaks and formatting will be preserved

5. **Submit**
   - Click "Create Update"
   - The update will immediately appear on the homepage

### Example Update

**Company Name**: Google

**Title**: On-Campus Recruitment Drive - October 15, 2025

**Content**:
```
Dear Students,

Google will be conducting an on-campus recruitment drive on October 15, 2025.

Eligibility:
- B.Tech/M.Tech students graduating in 2026
- CGPA: 7.5 and above
- No active backlogs

Process:
1. Online Assessment (Coding Round)
2. Technical Interview (2 rounds)
3. HR Interview

Registration Deadline: October 10, 2025, 5:00 PM

Register here: [link]

For queries, contact the placement cell.

Best regards,
Placement Team
```

### Managing Updates (Admin)

#### View All Updates
- The "Updates" tab shows all updates (active and inactive)
- Each card shows:
  - Company name
  - Title
  - Content preview
  - Posted date
  - View count
  - Posted by (admin name)

#### Delete an Update
- Click the trash icon on any update card
- Confirm deletion
- Update will be hidden from users (soft delete)

## Technical Details

### Database Schema
```javascript
{
  title: String (required, max 200 chars),
  content: String (required, max 10,000 chars),
  companyName: String (required, max 100 chars),
  postedBy: {
    googleId: String,
    name: String,
    email: String
  },
  isActive: Boolean (default: true),
  priority: Number (0-10, for future sorting),
  viewCount: Number (auto-increments),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### API Endpoints

**Public Routes:**
- `GET /api/updates` - Get active updates (limit: 10)
- `GET /api/updates/:id` - Get single update (increments view count)

**Admin Routes:**
- `GET /api/updates/admin/all` - Get all updates including inactive
- `POST /api/updates` - Create new update
- `PUT /api/updates/:id` - Update existing update
- `DELETE /api/updates/:id` - Soft delete (set isActive=false)
- `DELETE /api/updates/:id/permanent` - Permanently delete

### Frontend Components

1. **RecentUpdates.tsx**
   - Displays update cards on homepage
   - Fixed position: bottom-right
   - Shows 5 most recent updates
   - Auto-refreshes on mount

2. **UpdateModal.tsx**
   - Modal for displaying full update content
   - Clean design: white background, black text
   - Shows company name, title, date, and full content
   - Close button and click-outside-to-close

3. **UpdateManagement.tsx** (Admin)
   - Form to create new updates
   - List of all updates
   - Delete functionality
   - View statistics

## UI/UX Design

### Homepage Widget (Desktop)
- **Position**: Fixed bottom-right
- **Width**: 384px (96rem)
- **Responsive**: Hidden on mobile (<lg breakpoint)
- **Design**:
  - Blue gradient header
  - Update cards with hover effects
  - Company tags in blue
  - Timestamp with clock icon
  - Chevron icon for "read more"

### Update Modal
- **Background**: White (light mode) / Dark gray (dark mode)
- **Max Width**: 1024px (4xl)
- **Max Height**: 90vh (scrollable)
- **Content**: Preserves line breaks and formatting
- **Close**: X button + outside click

### Admin Interface
- **Form**: Clean three-field layout
- **Textarea**: Monospace font for better readability
- **Cards**: Show update preview with actions
- **Status Tags**: Green (active) / Gray (inactive)

## Best Practices

### For Admins Creating Updates

1. **Be Concise in Titles**
   - Keep titles under 60 characters
   - Make them descriptive and actionable

2. **Structure Your Content**
   - Use clear sections
   - Include all necessary details
   - Add contact information if needed

3. **Company Names**
   - Use official company names
   - Be consistent (e.g., always "Google", not "google" or "GOOGLE")

4. **Timing**
   - Post updates as soon as information is available
   - Delete outdated updates to keep the list relevant

5. **Content Formatting**
   - Use line breaks for readability
   - Paste directly from documents (formatting preserved)
   - Keep paragraphs short

### For Users

1. **Check Regularly**
   - Visit the homepage to see new updates
   - Updates appear immediately after posting

2. **Read Full Content**
   - Click cards to read full details
   - Important information may be at the bottom

## Troubleshooting

### Update Not Appearing on Homepage
- Check if it's marked as "Active" in admin panel
- Refresh the page (cache may be outdated)
- Check browser console for errors

### Can't Create Update
- Verify you're signed in as admin
- Check all required fields are filled
- Ensure content is under 10,000 characters

### Widget Not Visible
- Check screen size (widget is hidden on mobile/tablet)
- Scroll to top of homepage
- Check if there are any active updates

## Future Enhancements
- [ ] Priority sorting for important updates
- [ ] Categories/tags for updates
- [ ] Email notifications for new updates
- [ ] Update scheduling (post at specific time)
- [ ] Rich text editor for formatting
- [ ] Image attachments
- [ ] Mobile-friendly bottom sheet view
- [ ] Search and filter updates
- [ ] Update expiration dates

## Security Considerations
- ✅ Admin authentication required for posting
- ✅ Content length limits prevent abuse
- ✅ XSS protection (content is text-only)
- ✅ Rate limiting on API endpoints
- ✅ Soft delete preserves audit trail
- ✅ View count tracking for analytics

## Performance
- Fetches only 5 most recent updates
- Database indexes on `isActive` and `createdAt`
- Lazy loading of update content (only when modal opens)
- Efficient rendering with React state management

---

**Need Help?** Contact the development team or refer to the main project README.
