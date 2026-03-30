import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { chromium } from '@playwright/test';

const EXTENSION_PATH = path.resolve('dist/chrome');

/**
 * Launch a Chromium browser with the extension loaded.
 * Returns the browser context (persistent context required for extensions).
 * @returns {Promise<{ context: import('playwright').BrowserContext; userDataDir: string }>}
 */
export async function launchBrowserWithExtension() {
  const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gh2l-test-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });
  return { context, userDataDir };
}

/**
 * Get the extension's ID by finding its service worker.
 * @param {import('playwright').BrowserContext} context
 * @returns {Promise<string>}
 */
export async function getExtensionId(context) {
  let sw = context.serviceWorkers()[0];
  if (!sw) {
    sw = await context.waitForEvent('serviceworker');
  }
  const url = sw.url();
  const match = url.match(/chrome-extension:\/\/([^/]+)/);
  if (!match) throw new Error(`Could not extract extension ID from ${url}`);
  return match[1];
}

/**
 * Pre-seed the extension's storage with a test API key and defaults.
 * Navigates to the extension's options page to get access to chrome.storage.
 * @param {import('playwright').BrowserContext} context
 * @param {string} extensionId
 */
export async function seedStorage(context, extensionId) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options/options.html`);
  await page.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.local.set(
        { pat: 'test-api-key', defaults: { team: 'ENG', assignee: '' } },
        resolve
      );
    });
  });
  await page.close();
}

/**
 * Clear the extension's storage.
 * @param {import('playwright').BrowserContext} context
 * @param {string} extensionId
 */
export async function clearStorage(context, extensionId) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options/options.html`);
  await page.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
  });
  await page.close();
}
