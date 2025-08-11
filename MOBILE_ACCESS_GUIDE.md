# 📱 Mobile Access Guide for PlacedIn

## For University Presentation - Student Mobile Access

### How to Access on Mobile Devices

**🌐 Mobile URL:** `http://172.22.11.160:5174/`

### Prerequisites
- Your mobile device must be connected to the **same WiFi network** as the presentation computer
- Make sure both devices are on the same local network

### Step-by-Step Instructions for Students

1. **Connect to WiFi**
   - Connect your mobile device to the same WiFi network as the presentation computer
   
2. **Open Browser**
   - Open your mobile browser (Chrome, Safari, Firefox, etc.)
   
3. **Enter URL**
   - Type: `http://172.22.11.160:5174/`
   - Press Enter/Go
   
4. **Access PlacedIn**
   - The application should load within 10 seconds
   - You can now browse student experiences and post your own

### Troubleshooting

**If the page doesn't load:**
- Check that you're on the same WiFi network
- Try refreshing the page
- Make sure the presenter's computer is running the development server

**If experiences don't load:**
- Wait up to 10 seconds (mobile networks can be slower)
- The app now has mobile-optimized timeouts
- Check your internet connection

### Features Available on Mobile
- ✅ Browse all student experiences
- ✅ Read detailed experience posts
- ✅ Post new experiences
- ✅ Vote and interact with posts
- ✅ Admin dashboard (for authorized users)

### Technical Notes (For Presenter)
- Frontend server: `http://172.22.11.160:5174/`
- Backend API: `http://172.22.11.160:5000`
- Mobile detection automatically handles API endpoints
- CORS configured for local network access
- 10-15 second timeouts for mobile networks

---
**Note:** This is a development setup for presentation purposes. In production, the app is hosted at: https://krishh.me or https://www.krishh.me
