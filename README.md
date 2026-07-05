# Marathon Tools

An app that helps you analize your log entries for submission to the [CQ DX Marathon](https://dxmarathon.org/) annual competition.

The latest version is available at https://marathon.ham2k.org/

# Dev Environmnent Setup

```
npm install
```

## Run Locally

```
npm start
```

Vite serves the app on port 4202 with local proxies for QRZ and country-file requests.

## Cloudflare Pages

Build and deploy:

```
npm run pages:deploy
```

For Git-connected Pages projects, set the build command to `npm run build:pages` and the output directory to `dist`.

Cloudflare injects `CF_PAGES_COMMIT_SHA`, `CF_PAGES_BRANCH`, and `CF_PAGES_URL` at build time. For preview deployments that should compare versions against production, set `VITE_APP_PRIME_URL` to `https://marathon.ham2k.org` in the Pages dashboard.

To preview the production build locally:

```
npm run pages:dev
```
