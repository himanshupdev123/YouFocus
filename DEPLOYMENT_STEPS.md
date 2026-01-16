# YouFocus Deployment Steps

## ✅ Pre-Deployment Checklist

- [x] Build successful (209.37 KB bundle)
- [x] All tests passing (117/117)
- [x] Branding updated to "YouFocus"
- [x] Vercel CLI installed (v50.1.3)
- [x] Logged into Vercel account

## 🚀 Deployment Options

### Option 1: Deploy via Vercel CLI (Recommended)

#### Step 1: Deploy to Preview (Staging)

Open your terminal and run:

```bash
vercel
```

**You'll be prompted with:**

1. **Set up and deploy?** → Press `Y` (Yes)
2. **Which scope?** → Select your account
3. **Link to existing project?** → Press `N` (No, create new)
4. **What's your project's name?** → Type: `youfocus` (or your preferred name)
5. **In which directory is your code located?** → Press Enter (current directory)
6. **Want to modify settings?** → Press `N` (No, use defaults)

**Vercel will:**
- Build your project
- Deploy to a preview URL
- Give you a URL like: `https://youfocus-xxx.vercel.app`

#### Step 2: Add YouTube API Key

After the preview deployment, you need to add your YouTube API key:

```bash
vercel env add VITE_YOUTUBE_API_KEY
```

**You'll be prompted:**
1. **What's the value?** → Paste your YouTube API key
2. **Add to which environments?** → Select:
   - [x] Production
   - [x] Preview
   - [ ] Development (optional)

#### Step 3: Deploy to Production

Once you've tested the preview and added the API key:

```bash
vercel --prod
```

This will deploy to your production domain!

---

### Option 2: Deploy via Vercel Dashboard (Alternative)

#### Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Deploy YouFocus - YouTube + Focus viewer"
git push origin main
```

#### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

#### Step 3: Add Environment Variable

In the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - **Key:** `VITE_YOUTUBE_API_KEY`
   - **Value:** Your YouTube API key
   - **Environments:** Production, Preview

#### Step 4: Deploy

Click "Deploy" and Vercel will build and deploy your app!

---

## 📋 YouTube API Key Setup

If you don't have a YouTube API key yet:

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Name it something like "YouFocus"

### Step 2: Enable YouTube Data API v3

1. Go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click "Enable"

### Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### Step 4: Restrict API Key (Recommended)

1. Click on the API key you just created
2. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add your Vercel domain: `*.vercel.app/*`
   - Add your custom domain if you have one
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose "YouTube Data API v3"
4. Click "Save"

---

## 🔍 Post-Deployment Verification

After deployment, test these features:

### Functional Tests
- [ ] Landing page loads with "YouFocus" branding
- [ ] "Made in Bharat" badge displays correctly
- [ ] "a Himanshu P Dev Product" credit shows
- [ ] Channel search works
- [ ] Can add channels
- [ ] Video feed displays
- [ ] Videos play correctly
- [ ] Data persists after refresh

### Visual Tests
- [ ] Branding looks good on desktop
- [ ] Branding looks good on mobile
- [ ] Tricolor gradient displays correctly
- [ ] Indian flag emoji shows properly
- [ ] All text is readable

### Performance Tests
- [ ] Initial load < 3 seconds
- [ ] No console errors
- [ ] API responses are cached
- [ ] Smooth scrolling

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain

1. In Vercel dashboard, go to your project
2. Navigate to "Settings" > "Domains"
3. Click "Add Domain"
4. Enter your domain (e.g., `youfocus.com`)
5. Follow DNS configuration instructions

### Update API Key Restrictions

After adding custom domain:
1. Go to Google Cloud Console
2. Update API key HTTP referrer restrictions
3. Add your custom domain

---

## 📊 Monitoring

### Vercel Analytics (Optional)

Enable analytics to monitor performance:
1. Go to your project in Vercel
2. Navigate to "Analytics"
3. Enable "Web Analytics"

### API Quota Monitoring

Monitor your YouTube API usage:
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" > "Dashboard"
3. View quota usage for YouTube Data API v3
4. Set up alerts if needed

---

## 🔄 Future Deployments

### Automatic Deployments

If you connected via GitHub:
- Every push to `main` branch → Production deployment
- Every push to other branches → Preview deployment

### Manual Deployments

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 🆘 Troubleshooting

### Issue: "API key not configured"

**Solution:**
```bash
vercel env add VITE_YOUTUBE_API_KEY
```
Then redeploy:
```bash
vercel --prod
```

### Issue: Build fails

**Solution:**
1. Check build logs in Vercel dashboard
2. Test build locally: `npm run build`
3. Ensure all dependencies are in package.json

### Issue: Videos not loading

**Solution:**
1. Verify API key is correct
2. Check API key restrictions in Google Cloud Console
3. Ensure YouTube Data API v3 is enabled
4. Check browser console for errors

---

## 📝 Deployment Checklist

Before going live:

- [ ] YouTube API key configured
- [ ] API key restrictions set up
- [ ] Preview deployment tested
- [ ] All features working
- [ ] Mobile responsive verified
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Branding displays correctly
- [ ] Production deployment complete
- [ ] Custom domain configured (optional)

---

## 🎉 Success!

Once deployed, your YouFocus app will be live at:
- **Preview:** `https://youfocus-xxx.vercel.app`
- **Production:** `https://youfocus.vercel.app` (or your custom domain)

Share it with the world! 🌍

---

**Deployment Guide Created:** January 17, 2026  
**Application:** YouFocus  
**Version:** 1.0.0  
**Status:** Ready to Deploy ✅
