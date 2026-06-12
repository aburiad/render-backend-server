// Render entry point — delegates to server/index.js
// Root package.json is ESM, server/ is CJS (has own package.json)
import('./server/index.js')