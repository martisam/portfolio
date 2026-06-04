# Samuel Martinez - Portfolio

A space-themed personal portfolio for Samuel Martinez, Technology Architect. Built as a static site with an interactive Three.js starfield background.

## Tech stack

- HTML5 / CSS3 (no framework)
- Vanilla JavaScript (ES modules)
- [Three.js](https://threejs.org/) for the WebGL hero scene

## Project structure

```
portfolio/
  index.html              # page markup
  assets/
    css/style.css         # styles
    js/main.js            # Three.js scene + interactions
    images/               # profile image, favicon
  README.md
```

## Run locally

The site uses ES modules, so it must be served over HTTP (not opened as a `file://`).

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

## Branching model

Work flows up the chain - never commit directly to `main`.

| Branch | Purpose |
|--------|---------|
| `dev`  | Active development. Each enhancement section is built here. |
| `qa`   | Staging / testing. Promote from `dev` to verify before release. |
| `main` | Production (live site). Updated only via reviewed PR from `qa`. |

## Links

- LinkedIn: [Samuel Martinez Hernandez](https://www.linkedin.com/in/samuel-martinez-hernandez-377ab11a6/)
- GitHub: [martisam](https://github.com/martisam)
