
HW Limb Imbalance Gauge — Looker Studio Community Visualization
================================================================

A semi-circular speedometer-style gauge for representing left/right limb imbalance.
Assumes your metric is a signed percentage where negative = Left bias and positive = Right bias.

How to use
----------
1) Host these files on a public HTTPS site (GitHub Pages, Netlify, Vercel, Firebase Hosting, or Google Cloud Storage).
2) Copy the public URL of `manifest.json` (e.g., https://your-host.example.com/manifest.json).
3) In your Looker Studio report: Insert → Community visualizations and components → Build your own → paste Manifest path URL.
4) Bind your metric (e.g., Imbalance Percent). It should output values between your chosen min/max.
5) Use the Style panel to customize:
   - Left/Right label text
   - Font family
   - Colors (needle, gauge, ticks, balance band)
   - Range (min/max) and tick step
   - Zero balance band width (±%)

Tip: If updates don't show immediately, add a cache-busting query to the manifest URL (e.g., ?v=2) or hard refresh.
