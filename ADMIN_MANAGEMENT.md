# Admin Management System

## Overview
The PlacedIn platform now supports dynamic admin management. The super admin can add or remove other administrators through the admin dashboard.

## Super Admin
- **Email**: `pratheeshkrishnan595@gmail.com`
- **Privileges**: 
  - All admin permissions (approve, reject, delete experiences)
  - Add new administrators
  - Remove existing administrators
  - Cannot be removed from the system

## How to Use

### For Super Admin

#### Accessing Admin Management
1. Sign in with the super admin email
2. Navigate to Admin Dashboard
3. Click on the "Manage Admins" tab

#### Adding a New Admin
1. Go to the "Manage Admins" tab
2. Enter the admin's SASTRA email address (must end with @sastra.ac.in)
3. Click "Add Admin"
4. The new admin will immediately have access to the admin dashboard

#### Removing an Admin
1. Go to the "Manage Admins" tab
2. Find the admin you want to remove in the list
3. Click the "Remove" button next to their email
4. Confirm the action
5. The admin will immediately lose admin access

### For Regular Admins
- Regular admins can access the admin dashboard to:
  - Approve or reject student experiences
  - Delete experiences
  - View analytics and statistics
- Regular admins **cannot** add or remove other admins
- Regular admins **cannot** access the "Manage Admins" tab

## Technical Details

### Database Model
Admins are stored in a MongoDB collection with the following structure:
```javascript
{
  email: String (unique, required),
  isSuperAdmin: Boolean,
  addedBy: {
    email: String,
    name: String
  },
  isActive: Boolean,
  permissions: {
    canApprove: Boolean,
    canDelete: Boolean,
    canManageAdmins: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints
- `GET /api/admin/manage-admins` - Get all active admins (super admin only)
- `POST /api/admin/manage-admins` - Add new admin (super admin only)
- `DELETE /api/admin/manage-admins/:email` - Remove admin (super admin only)
- `POST /api/admin/check-admin` - Check if an email is an admin

### Frontend Configuration
The frontend maintains a cache of admin emails that is:
- Fetched on app initialization
- Cached for 5 minutes
- Refreshed when admins are added/removed

### Initialization Script
To manually initialize or verify the super admin in the database:
```bash
cd server
node scripts/init-super-admin.js
```

## Security Features
1. **Super Admin Protection**: The super admin cannot be removed from the system
2. **SASTRA Email Validation**: Only emails ending with @sastra.ac.in can be added as admins
3. **Soft Delete**: Removed admins are deactivated, not deleted from the database
4. **Permission Checks**: All admin operations verify user permissions on both frontend and backend

## Migration from Hardcoded Admins
The system has been migrated from hardcoded admin emails to a database-driven approach:
- **Before**: Admins were hardcoded in `adminConfig.js/ts`
- **After**: Admins are stored in MongoDB and managed dynamically
- **Super Admin**: `pratheeshkrishnan595@gmail.com` remains the only hardcoded super admin for system security

## Troubleshooting

### Admin Can't Access Dashboard
1. Verify the email is in the admin list (super admin can check in "Manage Admins")
2. Try logging out and logging back in
3. Check if the admin cache needs to refresh (wait 5 minutes or restart the app)

### Can't Add Admin
1. Verify you're signed in as the super admin
2. Ensure the email ends with @sastra.ac.in
3. Check if the email is already in the admin list

### Super Admin Not Working
1. Run the initialization script: `node scripts/init-super-admin.js`
2. Verify the email matches exactly: `pratheeshkrishnan595@gmail.com`
3. Check MongoDB connection and admin collection

## Future Enhancements
- [ ] Role-based permissions (e.g., "approver only", "analyst only")
- [ ] Admin activity logs
- [ ] Email notifications when admin status changes
- [ ] Temporary admin access (with expiration dates)
- [ ] Admin groups/departments
