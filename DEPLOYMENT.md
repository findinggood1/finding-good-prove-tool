# Deployment Guide - Proof Tool

## Phase 8: Production Deployment Complete ✅

### Deployment Checklist

#### Pre-Deployment Checklist ✅
- [x] All features implemented (Phases 1-7)
- [x] Error handling audit complete
- [x] Mobile responsiveness audit complete
- [x] All tests passing
- [x] Build successful with no warnings
- [x] Environment variables configured
- [x] Vercel configuration created

#### Build Status
```
✓ TypeScript compilation: No errors
✓ Vite build: 1.91s
✓ Bundle size: 499.01 KB (138.44 KB gzipped)
✓ 93 modules transformed
```

---

## Deploying to Vercel

### Step 1: Initial Setup

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

### Step 2: Deploy to Vercel

1. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

2. **Follow the prompts**:
   - Set up and deploy: Yes
   - Which scope: Select your account
   - Link to existing project: No
   - Project name: `finding-good-prove-tool` (or your preferred name)
   - Directory: `./` (current directory)
   - Override settings: No

### Step 3: Configure Environment Variables

Add the following environment variables in Vercel Dashboard:

1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```bash
VITE_SUPABASE_URL=https://mdsgkddrnqhhtncfeqxw.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/ (optional)
```

4. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

---

## Post-Deployment Tasks

### 1. Update Supabase Edge Function

⚠️ **CRITICAL**: The Edge Function needs to be updated to match the frontend changes:

**File**: `validation-interpret` Edge Function in Supabase

**Change Required**: Update scoring field from `replication` to `confidence`

```typescript
// OLD
"replication": 1-5 (could they repeat this?)

// NEW
"confidence": 1-5 (Do you own the HOW? Can you explain the process vs just got lucky?)
```

**Steps**:
1. Go to Supabase Dashboard → Edge Functions → `validation-interpret`
2. Update the prompt to use "confidence" instead of "replication"
3. Save and deploy the Edge Function

### 2. Test Production Deployment

After deployment, test the following:

**Core Flows**:
- [ ] Landing page loads
- [ ] Email authentication works
- [ ] Self Mode flow (complete proof creation)
- [ ] Send to Others Mode (create invitation)
- [ ] Request Mode (create proof request)
- [ ] History page loads and displays proofs
- [ ] Pulse check functionality
- [ ] Prediction functionality

**Mobile Testing**:
- [ ] Test on iPhone/Android (375px width minimum)
- [ ] Touch targets work (buttons, info icons)
- [ ] Score grids stack properly
- [ ] Timeframe selector displays correctly
- [ ] All text readable without zooming

**Error Handling**:
- [ ] Clipboard operations show success/error feedback
- [ ] Failed API calls show error messages
- [ ] History page shows error state if data fails to load
- [ ] Async operations handle errors gracefully

### 3. Configure Custom Domain (Optional)

If you want to use a custom domain:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain
3. Configure DNS records as instructed by Vercel
4. Wait for DNS propagation (can take up to 48 hours)

---

## Vercel Configuration Explained

The `vercel.json` file includes:

### SPA Routing
```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```
- Ensures all routes work properly with React Router
- Falls back to index.html for client-side routing

### Security Headers
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Enables browser XSS protection

### Cache Headers
- Assets in `/assets/` folder cached for 1 year (immutable)
- Optimal performance for static resources

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://mdsgkddrnqhhtncfeqxw.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Get from Supabase Dashboard |

### Optional Variables

| Variable | Description | Usage |
|----------|-------------|-------|
| `VITE_ZAPIER_WEBHOOK_URL` | Zapier webhook for email notifications | Email reminders (future feature) |

---

## Troubleshooting

### Issue: 404 on page refresh
**Solution**: Ensure `vercel.json` rewrites are configured correctly

### Issue: Environment variables not working
**Solution**:
1. Check variables are prefixed with `VITE_`
2. Redeploy after adding variables
3. Clear browser cache

### Issue: Build fails on Vercel
**Solution**:
1. Check Node.js version (should be 18+)
2. Verify all dependencies in `package.json`
3. Check build logs for specific errors

### Issue: Supabase connection fails
**Solution**:
1. Verify `VITE_SUPABASE_URL` is correct
2. Check `VITE_SUPABASE_ANON_KEY` is valid
3. Ensure Supabase project is active

---

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches or pull requests

To disable auto-deploy:
1. Vercel Dashboard → Settings → Git
2. Disable "Production Branch" or "Preview Deployments"

---

## Monitoring and Analytics

### Vercel Analytics (Optional)
1. Enable in Vercel Dashboard → Analytics
2. No code changes needed
3. Tracks page views, Web Vitals, and more

### Error Monitoring
- Console errors are logged in browser DevTools
- Server errors appear in Vercel deployment logs
- Consider adding Sentry for production error tracking (future enhancement)

---

## Rollback Procedure

If you need to rollback to a previous deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the working deployment
3. Click **⋯** (menu) → **Promote to Production**

---

## Performance Metrics

**Current Bundle Size**:
- Total: 499.01 KB
- Gzipped: 138.44 KB
- Assets: ~24 KB CSS

**Target Metrics**:
- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.8s
- Lighthouse Score: > 90

---

## Support and Maintenance

### Regular Updates
- Review and update dependencies monthly
- Monitor Vercel deployment logs
- Check Supabase usage and quotas

### Security Updates
- Update dependencies with security patches ASAP
- Review and rotate API keys periodically
- Monitor for unauthorized access attempts

---

## Production URL

After deployment, your app will be available at:
```
https://your-project-name.vercel.app
```

Or your custom domain:
```
https://proof.findinggood.com
```

---

**Deployment Date**: 2026-01-07
**Version**: 1.0.0
**Status**: ✅ Ready for Production
