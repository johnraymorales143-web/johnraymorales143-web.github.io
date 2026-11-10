# John Ray Morales, AI video ad portfolio

Static site for GitHub Pages. Videos stream from Google Drive (view-only, downloads off).

- `index.html`, `styles.css`, `app.js`: the page
- `assets/videos.js`: every video, its poster and its Drive file ID (`driveId`)
- `assets/posters/`: poster frames pulled from each video

To add a video: upload it to the portfolio Drive folder, turn off downloads for viewers, set link sharing to "Anyone with the link: Viewer", then add its Drive file ID to `assets/videos.js`.
