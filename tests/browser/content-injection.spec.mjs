import { test, expect } from '@playwright/test';
import { startMockServer, stopMockServer, setIssueSearchResponse } from './helpers/mock-server.mjs';
import { launchBrowserWithExtension, getExtensionId, seedStorage, clearStorage } from './helpers/extension.mjs';
import { issueSearchWithResults, issueSearchEmpty } from './fixtures/linear-responses.mjs';

const PORT = Number(process.env.TEST_PORT) || 3390;
const BASE = `http://localhost:${PORT}`;

/** @type {import('playwright').BrowserContext} */
let context;
let extensionId;
let userDataDir;

test.beforeAll(async () => {
  await startMockServer(PORT);
  ({ context, userDataDir } = await launchBrowserWithExtension());
  extensionId = await getExtensionId(context);
  await seedStorage(context, extensionId);
});

test.afterAll(async () => {
  await context?.close();
  await stopMockServer();
});

test.describe('single issue page', () => {
  // Each test uses a different issue number to avoid the background script's
  // 30-second query cache causing cross-test interference.

  test('shows Linear issue link when a matching issue exists', async () => {
    setIssueSearchResponse(issueSearchWithResults);
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}/delucis/github-to-linear/issues/40`, {
        waitUntil: 'domcontentloaded',
      });

      const buttonGroup = page.locator('#github-to-linear-create-issue-link');
      await expect(buttonGroup).toBeVisible({ timeout: 15_000 });
      await expect(buttonGroup).toContainText('ENG-123');

      const sidebar = page.locator('#github-to-linear-issue-infobox');
      await expect(sidebar).toBeVisible({ timeout: 5_000 });
      await expect(sidebar).toContainText('In Progress');
      await expect(sidebar).toContainText('High');
      await expect(sidebar).toContainText('Test User');
    } finally {
      await page.close();
    }
  });

  test('shows "Add to Linear" button when no matching issue exists', async () => {
    setIssueSearchResponse(issueSearchEmpty);
    const page = await context.newPage();
    try {
      // Use a different issue number to avoid cache from previous test
      await page.goto(`${BASE}/delucis/github-to-linear/issues/99`, {
        waitUntil: 'domcontentloaded',
      });

      const buttonGroup = page.locator('#github-to-linear-create-issue-link');
      await expect(buttonGroup).toBeVisible({ timeout: 15_000 });
      await expect(buttonGroup).toContainText('Add to Linear');

      const link = buttonGroup.locator('a').first();
      const href = await link.getAttribute('href');
      expect(href).toContain('linear.app');
      expect(href).toContain('/team/ENG/new');

      const sidebar = page.locator('#github-to-linear-issue-infobox');
      await expect(sidebar).not.toBeVisible();
    } finally {
      await page.close();
    }
  });
});

test.describe('PR page', () => {
  test('injects Linear UI on a pull request page', async () => {
    setIssueSearchResponse(issueSearchWithResults);
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}/delucis/github-to-linear/pull/1`, {
        waitUntil: 'domcontentloaded',
      });

      const buttonGroup = page.locator('#github-to-linear-create-issue-link');
      await expect(buttonGroup).toBeVisible({ timeout: 15_000 });
      await expect(buttonGroup).toContainText('ENG-123');
    } finally {
      await page.close();
    }
  });

  test('does not inject sidebar on PR sub-views', async () => {
    setIssueSearchResponse(issueSearchWithResults);
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}/delucis/github-to-linear/pull/1/files`, {
        waitUntil: 'domcontentloaded',
      });

      // Wait for the content script to run
      await page.waitForTimeout(3000);

      const sidebar = page.locator('#github-to-linear-issue-infobox');
      await expect(sidebar).not.toBeVisible();
    } finally {
      await page.close();
    }
  });
});

test.describe('issue list page', () => {
  test('injects inline Linear links on issue list', async () => {
    setIssueSearchResponse(issueSearchWithResults);
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}/delucis/github-to-linear/issues?q=is%3Aissue+is%3Aopen`, {
        waitUntil: 'domcontentloaded',
      });

      const inlineLinks = page.locator('.gh2l-list-links');
      await expect(inlineLinks.first()).toBeVisible({ timeout: 15_000 });
      await expect(inlineLinks.first()).toContainText('ENG-123');
    } finally {
      await page.close();
    }
  });
});

test.describe('no API key', () => {
  test('shows "Add to Linear" but no sidebar when API key is missing', async () => {
    await clearStorage(context, extensionId);

    const page = await context.newPage();
    try {
      // Use a unique issue number so cache doesn't interfere
      await page.goto(`${BASE}/delucis/github-to-linear/issues/77`, {
        waitUntil: 'domcontentloaded',
      });

      // The "Add to Linear" button should still appear (it's just a link builder,
      // doesn't need the API). But no sidebar infobox since we can't fetch issues.
      const buttonGroup = page.locator('#github-to-linear-create-issue-link');
      await expect(buttonGroup).toBeVisible({ timeout: 15_000 });
      await expect(buttonGroup).toContainText('Add to Linear');

      const sidebar = page.locator('#github-to-linear-issue-infobox');
      await expect(sidebar).not.toBeVisible();
    } finally {
      await page.close();
      // Restore storage for subsequent tests
      await seedStorage(context, extensionId);
    }
  });
});

test.describe('extension health', () => {
  test('extension loads without console errors', async () => {
    const errors = [];
    const page = await context.newPage();
    page.on('pageerror', (err) => errors.push(err.message));

    try {
      setIssueSearchResponse(issueSearchWithResults);
      await page.goto(`${BASE}/delucis/github-to-linear/issues/40`, {
        waitUntil: 'domcontentloaded',
      });

      // Wait for the extension to finish its work
      await page.locator('#github-to-linear-create-issue-link').waitFor({
        state: 'visible',
        timeout: 15_000,
      });

      const extensionErrors = errors.filter(
        (e) => !e.includes('ResizeObserver') && !e.includes('Script error')
      );
      expect(extensionErrors).toEqual([]);
    } finally {
      await page.close();
    }
  });
});
