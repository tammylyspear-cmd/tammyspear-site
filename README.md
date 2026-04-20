# tammyspear-site

Source repository for [tammyspear.netlify.app](https://tammyspear.netlify.app).

## Workflow

This repository is the single source of truth for the live site. Every push to `main` triggers an automatic Netlify deploy in ~30 seconds. Any post-deploy edit made through the Netlify UI is overwritten on the next push.

### Daily edits

```bash
git pull
# edit files
git add .
git commit -m "Brief description of change"
git push
```

### Adding a blog post

1. Add `/blog/<post-slug>/index.html`.
2. Update `/sitemap.xml` — add a new `<url>` block with today's `<lastmod>` and remove any slugs that no longer correspond to a live post.
3. Commit and push.

## Structure

- `index.html` — homepage
- `/blog/` — blog index and individual posts
- `/photos/` — image assets
- `/netlify/edge-functions/` — Netlify Edge Functions
- `sitemap.xml`, `robots.txt`, `_redirects`, `netlify.toml` — site-level config

## Deploy

- Host: Netlify
- Branch deployed: `main`
- Publish directory: `.` (repo root)
- Build command: none (static site; `netlify.toml` declares the edge functions directory)
