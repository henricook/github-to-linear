/** A realistic Linear issue matching a GitHub issue/PR. */
const sampleIssue = {
  url: 'https://linear.app/testorg/issue/ENG-123/sample-issue',
  identifier: 'ENG-123',
  title: 'Fix login redirect on mobile',
  branchName: 'eng-123-fix-login-redirect',
  state: {
    name: 'In Progress',
    color: '#f2c94c',
    type: 'started',
  },
  priorityLabel: 'High',
  priority: 2,
  assignee: {
    avatarUrl: null,
    displayName: 'Test User',
    isMe: true,
    url: 'https://linear.app/testorg/settings/account',
  },
  cycle: {
    name: 'Cycle 12',
    startsAt: '2026-03-23T00:00:00.000Z',
    endsAt: '2026-04-06T00:00:00.000Z',
  },
  project: {
    name: 'Q1 Polish',
    url: 'https://linear.app/testorg/project/q1-polish',
  },
  dueDate: '2026-04-01',
  labels: {
    nodes: [
      { name: 'bug', color: '#eb5757' },
    ],
  },
  team: { color: '#5e6ad2' },
};

export const issueSearchWithResults = {
  data: {
    issues: {
      nodes: [sampleIssue],
    },
  },
};

export const issueSearchEmpty = {
  data: {
    issues: {
      nodes: [],
    },
  },
};

export const viewerResponse = {
  data: {
    viewer: {
      displayName: 'Test User',
      email: 'test@example.com',
      organization: {
        name: 'TestOrg',
        logoUrl: null,
      },
    },
  },
};

export const workspaceResponse = {
  data: {
    teams: {
      nodes: [
        { key: 'ENG' },
        { key: 'DES' },
      ],
    },
    users: {
      nodes: [
        { displayName: 'Test User' },
        { displayName: 'Another Dev' },
      ],
    },
  },
};
