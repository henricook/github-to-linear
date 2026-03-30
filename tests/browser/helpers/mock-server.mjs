import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  issueSearchWithResults,
  viewerResponse,
  workspaceResponse,
} from '../fixtures/linear-responses.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = path.join(__dirname, '..', 'fixtures', 'pages');

let issueSearchResponse = issueSearchWithResults;
let server = null;

/** Map of URL path patterns to HTML fixture files. */
const pageRoutes = [
  { pattern: /\/[^/]+\/[^/]+\/issues\/\d+$/, file: 'issue.html' },
  { pattern: /\/[^/]+\/[^/]+\/pull\/\d+$/, file: 'pull-request.html' },
  { pattern: /\/[^/]+\/[^/]+\/pull\/\d+\/files$/, file: 'pull-request.html' },
  { pattern: /\/[^/]+\/[^/]+\/issues(\?|$)/, file: 'issue-list.html' },
];

/**
 * Set the response the mock server returns for issue search queries.
 * Call this before navigating to a page to control what the extension sees.
 * @param {object} response
 */
export function setIssueSearchResponse(response) {
  issueSearchResponse = response;
}

/**
 * Start the mock server. Serves both the Linear GraphQL API mock and
 * GitHub page HTML fixtures.
 * @param {number} [port]
 * @returns {Promise<http.Server>}
 */
export function startMockServer(port = Number(process.env.TEST_PORT) || 3390) {
  return new Promise((resolve, reject) => {
    server = http.createServer(async (req, res) => {
      // GraphQL API mock
      if (req.method === 'POST' && req.url === '/graphql') {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          let response;
          try {
            const { query } = JSON.parse(body);
            if (query.includes('viewer')) {
              response = viewerResponse;
            } else if (query.includes('teams')) {
              response = workspaceResponse;
            } else {
              response = issueSearchResponse;
            }
          } catch {
            response = { errors: [{ message: 'Invalid request body' }] };
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        });
        return;
      }

      // GitHub HTML fixture serving (GET requests)
      if (req.method === 'GET') {
        const urlPath = req.url.split('?')[0];
        for (const route of pageRoutes) {
          if (route.pattern.test(req.url)) {
            try {
              const html = await fs.readFile(path.join(PAGES_DIR, route.file), 'utf-8');
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end(html);
            } catch (err) {
              res.writeHead(500);
              res.end(`Failed to read fixture: ${err.message}`);
            }
            return;
          }
        }
      }

      res.writeHead(404);
      res.end('Not found');
    });

    server.listen(port, () => {
      console.log(`Mock server running on port ${port}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

/**
 * Stop the mock server.
 * @returns {Promise<void>}
 */
export function stopMockServer() {
  return new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }
    server.close(() => resolve());
    server = null;
  });
}
