# PanelForge — CodePen starter

## CodePen setup
1. Open https://codepen.io/pen/
2. Paste `index.html` into the HTML panel.
3. Paste `style.css` into the CSS panel.
4. Paste `script.js` into the JS panel.
5. Save the Pen. The interface is responsive and styled to match the reference screenshot.

## Worker
`worker.js` is a safe Cloudflare Worker starter. It exposes `GET /` for health status and placeholder routes for session/login/command/logout. It does not execute game commands. Deploy it to your own Cloudflare Worker if you want to use the starter.

The supplied Worker URL is prefilled in the UI. The page checks `GET /` and demonstrates a login request to `/login`, but whether that request works depends on the existing Worker’s API and CORS configuration. The existing Worker may have a different API contract.

## Important
- Do not place passwords, tokens, or private keys in CodePen.
- The login UI is only a frontend demo. The starter Worker intentionally does not authenticate users or execute commands.
- The archive you supplied listed `Loader_source.txt`, `Userscript.txt`, and `Worker.txt`, but its contents could not be extracted in this environment. This starter is built from the screenshot and the publicly responding Worker status endpoint.
