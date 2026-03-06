# Installing GitHub to Linear Redux

This guide walks you through installing the browser extension from a GitHub release. No developer tools or command line needed.

## 1. Download the extension

1. Go to the [latest release](https://github.com/henricook/github-to-linear/releases/latest)
2. Under **Assets**, download the zip for your browser:
   - `github-to-linear-v*-chrome.zip` for Chrome, Brave, Edge, Arc, or other Chromium browsers
   - `github-to-linear-v*-firefox.zip` for Firefox
3. Unzip the downloaded file to a folder you'll keep around (the browser loads the extension from this folder, so don't delete it)

## 2. Load the extension

### Chrome / Chromium browsers

1. Open `chrome://extensions` in your address bar
2. Turn on **Developer mode** using the toggle in the top-right corner
3. Click **Load unpacked**
4. Select the folder you unzipped in step 1
5. The extension icon should appear in your toolbar

### Firefox

Firefox only supports loading unsigned extensions as "temporary add-ons" which need to be re-loaded each time you restart the browser.

1. Open `about:debugging#/runtime/this-firefox` in your address bar
2. Click **Load Temporary Add-on...**
3. Navigate into the folder you unzipped in step 1 and select the `manifest.json` file
4. The extension icon should appear in your toolbar

> **Note**: Temporary add-ons are removed when Firefox closes. You'll need to repeat step 2 each time you restart Firefox. For a permanent install, the extension needs to be signed and published to [addons.mozilla.org](https://addons.mozilla.org).

## 3. Configure your Linear API key

1. Click the extension icon in your toolbar, or right-click it and choose **Options** / **Extension options**
2. Enter your Linear API key - you can create one at [linear.app/settings/api](https://linear.app/settings/api)
3. Optionally set a default team and assignee for new issues
4. Click **Save**

## 4. Use it

Visit any GitHub issue or pull request page. If there's a linked Linear issue, you'll see it in the sidebar. On issue/PR list pages, Linear status indicators appear next to linked items. You can also click **Add to Linear** to create a new Linear issue from any GitHub issue or PR.
