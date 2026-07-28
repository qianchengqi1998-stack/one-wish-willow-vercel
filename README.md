# ONE WISH WILLOW

An interactive, one-wish web experience inspired by the film prop ritual.

## Local development

Requirements:

- Node.js 22 or newer

Install dependencies and run:

```bash
npm install
npm run dev
```

## Deployment

- GitHub: `qianchengqi1998-stack/one-wish-willow-vercel`
- Public URL: `https://one-wish-willow-tan.vercel.app`
- Vercel team: `Miracle_qiqi` (`mia-ce-l`)
- Vercel project: `one-wish-willow`
- Root Directory: `./`
- Framework: Next.js
- Wish archive: shared Sites database
- Environment variables: none required

Release workflow:

```text
local edit → git add → git commit → git push → Vercel automatic deployment
```

The visitor counter and sealed wishes are forwarded to the shared Sites
database. Records use a random browser identifier and a `vercel` source label;
they do not contain contact details. Only the owner-authenticated Sites admin
page can read the wish archive.
