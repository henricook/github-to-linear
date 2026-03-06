# <img src=”resources/store-icon.svg” alt=”” align=”left” width=”45”> GitHub to Linear Redux

> Maintained fork of [GitHub to Linear](https://github.com/delucis/github-to-linear). Browser extension that adds an “Add to Linear” button to GitHub issues and PRs.

## Install

See [INSTALL.md](INSTALL.md) for step-by-step instructions to download and load the extension in Chrome or Firefox.

## Usage

### Basics

By default, this extension will show an <kbd>Add to Linear</kbd> button on every GitHub issue and PR.

### Enabling more features

You can enable more functionality by authenticating with the Linear API.

Currently, authenticating enables the following features:

<table>
	<tr>
		<th width="50%">
			<p><a title="details-card"></a> Show linked Linear issues in GitHub issues & PRs
			<p><img src="https://github.com/delucis/github-to-linear/assets/357379/910c6b53-09c3-4b90-bb68-918ef212a295">
		<th width="50%">
			<p><a title="list-display"></a> Show linked Linear issues in GitHub issue & PR lists
			<p><img src="https://github.com/delucis/github-to-linear/assets/357379/a6b94479-c501-40ae-9012-789fdee7979b">
	<tr>
		<th width="50%">
			<p><a title="new-issue-defaults"></a> Set the default team and assignee to use when creating a new Linear issue
			<p><img src="https://github.com/delucis/github-to-linear/assets/357379/1d85494d-cedf-4ead-9d05-1b00f9fe5e62">
		<th width="50%">
			<p><a title="quick-link"></a> Show a link to an existing Linear issue instead of the “Add to Linear” button when one exists.
			<p><img src="https://github.com/delucis/github-to-linear/assets/357379/45a9bf49-3399-404b-b6ad-42d87ac6cecb">
</table>

#### How to authenticate with Linear

1. [Create a new personal API key](https://linear.app/settings/api) in the Linear dashboard.
2. Open the extension options and paste your API key into the **Linear personal API key** field.

## Contribute

This is an open-source repository. You can

- [Create an issue](https://github.com/henricook/github-to-linear/issues/new/choose) to report a bug or make a feature request.
- Open a PR to submit changes to the code you made yourself.

## License

This software is free to use, modify, and redistribute under the [GNU General Public License v3.0](/LICENSE).
