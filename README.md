# ONE WISH WILLOW

An interactive, one-wish web experience inspired by the film prop ritual.

## Local development

Requirements:

- Node.js 22 or newer
- A Neon Postgres database

Create `.env.local` from `.env.example`, add `DATABASE_URL` locally, then run:

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
- Database: Neon Postgres Free
- Environment variables: sensitive `DATABASE_URL` for all environments

Release workflow:

```text
local edit → git add → git commit → git push → Vercel automatic deployment
```

The visitor counter stores only a randomly generated browser identifier and its
first-seen timestamp. It does not store wish text or contact details.
