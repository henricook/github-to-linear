import { test, expect } from '@playwright/test';
import { startMockServer, stopMockServer } from './helpers/mock-server.mjs';
import { launchBrowserWithExtension, getExtensionId, seedStorage } from './helpers/extension.mjs';

/** @type {import('playwright').BrowserContext} */
let context;
let extensionId;
let userDataDir;

test.beforeAll(async () => {
  await startMockServer();
  ({ context, userDataDir } = await launchBrowserWithExtension());
  extensionId = await getExtensionId(context);
  await seedStorage(context, extensionId);
});

test.afterAll(async () => {
  await context?.close();
  await stopMockServer();
});

test.describe('options page', () => {
  test('shows authenticated user info', async () => {
    const page = await context.newPage();
    try {
      await page.goto(`chrome-extension://${extensionId}/options/options.html`);

      const status = page.locator('#status');
      await expect(status).toContainText('TestOrg', { timeout: 10_000 });
      await expect(status).toContainText('Test User');
      await expect(status).toContainText('test@example.com');
    } finally {
      await page.close();
    }
  });

  test('populates team and assignee dropdowns', async () => {
    const page = await context.newPage();
    try {
      await page.goto(`chrome-extension://${extensionId}/options/options.html`);

      // Wait for the preferences form to be populated
      const teamSelect = page.locator('#team');
      await expect(teamSelect).toBeVisible({ timeout: 10_000 });

      // Verify teams are listed
      const teamOptions = teamSelect.locator('option');
      const teamTexts = await teamOptions.allTextContents();
      expect(teamTexts).toContain('ENG');
      expect(teamTexts).toContain('DES');

      // Verify assignees are listed
      const assigneeSelect = page.locator('#assignee');
      await expect(assigneeSelect).toBeVisible();
      const assigneeOptions = assigneeSelect.locator('option');
      const assigneeTexts = await assigneeOptions.allTextContents();
      expect(assigneeTexts).toContain('Test User');
      expect(assigneeTexts).toContain('Another Dev');
    } finally {
      await page.close();
    }
  });
});
