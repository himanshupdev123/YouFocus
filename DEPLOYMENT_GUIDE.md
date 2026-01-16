# Deployment Guide: Focused YouTube Viewer

## Prerequisites

Before deploying, ensure you have:
- ✅ Vercel CLI installed (v50.1.3 detected)
- ✅ All tests passing (117/117 tests passed)
- ✅ Production build configured
- ⚠️ YouTube Data API v3 key (required for deployment)

## Step 1: Obtain YouTube API Key

If you don't have a YouTube API key yet, follow these steps:

1. **Go to Google Cloud Console:** https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable YouTube Data API v3:**
   - Navigate to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. **Create API Key:**
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
5. **Restrict API Key (Recommended):**
   - Click on the API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your Vercel domain (e.g., `*.vercel.app`)
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Click "Save"

## Step 2: Build and Test Locally

Before deploying, verify the production build works:

```bash
# Build the production bundle
npm run build

# Preview the production build locally
npm run preview
```

Visit http://localhost:4173 and test the application with your API key.

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Login to Vercel:**
```bash
vercel login
```

2. **Deploy to Preview (Staging):**
```bash
vercel
```

This will:
- Create a new Vercel project (if first time)
- Build and deploy to a preview URL
- Prompt you to link to an existing project or create new one

3. **Set Environment Variable:**

After the preview deployment, set your YouTube API key:

```bash
vercel env add VITE_YOUTUBE_API_KEY
```

When prompted:
- Select "Production" and "Preview" environments
- Paste your YouTube API key
- Press Enter

4. **Deploy to Production:**
```bash
vercel --prod
```

This deploys to your production domain.

### Option B: Deploy via Vercel Dashboard

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variable:
     - Key: `VITE_YOUTUBE_API_KEY`
     - Value: Your YouTube API key
   - Click "Deploy"

## Step 4: Verify Deployment

After deployment, verify the following:

### Functional Testing
- [ ] Onboarding screen appears for first-time users
- [ ] Channel search works
- [ ] Can add and remove channels
- [ ] Video feed displays correctly
- [ ] Videos play in the player
- [ ] Data persists after page reload

### Performance Testing
- [ ] Initial load time < 3 seconds
- [ ] API responses are cached
- [ ] No console errors
- [ ] Responsive on mobile devices

### Error Handling
- [ ] Invalid API key shows appropriate error
- [ ] Network errors are handled gracefully
- [ ] Empty states display correctly

## Step 5: Configure Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update API Key Restrictions:**
   - Go to Google Cloud Console
   - Update HTTP referrer restrictions to include your custom domain

## Deployment Commands Reference

```bash
# Login to Vercel
vercel login

# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel rm [deployment-url]

# Add environment variable
vercel env add VITE_YOUTUBE_API_KEY

# List environment variables
vercel env ls

# Pull environment variables to local .env
vercel env pull
```

## Environment Variables

The application requires the following environment variable:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_YOUTUBE_API_KEY` | YouTube Data API v3 key | Yes |

## Troubleshooting

### Issue: "API key not configured" error

**Solution:** Ensure the environment variable is set correctly:
```bash
vercel env add VITE_YOUTUBE_API_KEY
```
Then redeploy:
```bash
vercel --prod
```

### Issue: API quota exceeded

**Solution:** 
- Check your quota usage in Google Cloud Console
- The app caches responses for 30 minutes to minimize API calls
- Consider implementing user-specific API keys for high-traffic scenarios

### Issue: Build fails

**Solution:**
1. Check build logs: `vercel logs`
2. Verify all dependencies are in package.json
3. Test build locally: `npm run build`
4. Ensure Node.js version compatibility

### Issue: Videos not loading

**Solution:**
1. Check browser console for errors
2. Verify API key is valid and has YouTube Data API v3 enabled
3. Check API key restrictions (HTTP referrers)
4. Verify network requests in browser DevTools

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] API key is configured and working
- [ ] All features function correctly
- [ ] Mobile responsive design works
- [ ] No console errors
- [ ] Analytics/monitoring set up (optional)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)

## Monitoring and Maintenance

### Vercel Analytics (Optional)

Enable Vercel Analytics for performance monitoring:
1. Go to your project in Vercel Dashboard
2. Navigate to "Analytics"
3. Enable Web Analytics

### API Quota Monitoring

Monitor your YouTube API quota usage:
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" > "Dashboard"
3. View quota usage for YouTube Data API v3
4. Set up quota alerts if needed

## Rollback Procedure

If you need to rollback to a previous deployment:

1. **Via CLI:**
```bash
vercel ls
vercel alias [previous-deployment-url] [production-domain]
```

2. **Via Dashboard:**
   - Go to your project in Vercel
   - Navigate to "Deployments"
   - Find the previous working deployment
   - Click "..." > "Promote to Production"

## Support and Resources

- **Vercel Documentation:** https://vercel.com/docs
- **YouTube Data API Documentation:** https://developers.google.com/youtube/v3
- **Project Repository:** [Your GitHub URL]
- **Issue Tracker:** [Your GitHub Issues URL]

## Security Best Practices

1. **API Key Security:**
   - Never commit API keys to version control
   - Use environment variables for all sensitive data
   - Restrict API keys to specific domains
   - Rotate API keys periodically

2. **HTTPS:**
   - Vercel provides automatic HTTPS (SSL/TLS)
   - Ensure all API calls use HTTPS

3. **Content Security:**
   - Review Vercel's security headers configuration
   - Consider adding additional security headers if needed

## Next Steps After Deployment

1. **Share with Users:**
   - Share your deployment URL
   - Provide usage instructions
   - Gather user feedback

2. **Monitor Performance:**
   - Check Vercel Analytics
   - Monitor API quota usage
   - Review error logs

3. **Iterate:**
   - Collect user feedback
   - Fix bugs and add features
   - Deploy updates regularly

---

**Deployment Status:** Ready to Deploy ✅  
**Last Updated:** January 17, 2026  
**Version:** 1.0.0
