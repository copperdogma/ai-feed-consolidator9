/**
 * Mock RSS feed data for testing
 */

/**
 * Sample valid RSS feed XML
 */
export const validRssFeedXml = `
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Tech Blog</title>
    <link>https://testblog.example.com</link>
    <description>A blog about technology and programming</description>
    <language>en-us</language>
    <lastBuildDate>Mon, 01 May 2023 12:00:00 GMT</lastBuildDate>
    <item>
      <title>Introduction to TDD</title>
      <link>https://testblog.example.com/intro-to-tdd</link>
      <description>Learn about Test-Driven Development and its benefits.</description>
      <pubDate>Mon, 01 May 2023 10:00:00 GMT</pubDate>
      <guid>https://testblog.example.com/intro-to-tdd</guid>
      <author>John Doe</author>
      <content:encoded><![CDATA[<p>Test-Driven Development (TDD) is a software development approach where tests are written before the code itself.</p><p>This article explores the benefits of this methodology.</p>]]></content:encoded>
    </item>
    <item>
      <title>Modern JavaScript Frameworks</title>
      <link>https://testblog.example.com/modern-js-frameworks</link>
      <description>A comparison of popular JavaScript frameworks in 2023.</description>
      <pubDate>Sun, 30 Apr 2023 15:30:00 GMT</pubDate>
      <guid>https://testblog.example.com/modern-js-frameworks</guid>
      <author>Jane Smith</author>
      <content:encoded><![CDATA[<p>This is a comprehensive comparison of React, Angular, and Vue.js in 2023.</p><p>Learn the pros and cons of each framework.</p>]]></content:encoded>
    </item>
  </channel>
</rss>
`;

/**
 * Sample valid Atom feed XML
 */
export const validAtomFeedXml = `
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Test Dev News</title>
  <link href="https://devnews.example.com"/>
  <updated>2023-05-01T12:00:00Z</updated>
  <author>
    <name>Dev News Team</name>
  </author>
  <id>https://devnews.example.com</id>
  <entry>
    <title>Understanding Kubernetes</title>
    <link href="https://devnews.example.com/understanding-kubernetes"/>
    <id>https://devnews.example.com/understanding-kubernetes</id>
    <updated>2023-05-01T11:00:00Z</updated>
    <summary>Learn how Kubernetes can simplify your container orchestration.</summary>
    <content type="html"><![CDATA[<p>Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications.</p>]]></content>
  </entry>
  <entry>
    <title>GraphQL vs REST</title>
    <link href="https://devnews.example.com/graphql-vs-rest"/>
    <id>https://devnews.example.com/graphql-vs-rest</id>
    <updated>2023-04-30T09:15:00Z</updated>
    <summary>Comparing GraphQL and REST API architectures.</summary>
    <content type="html"><![CDATA[<p>This article compares the benefits and drawbacks of GraphQL and REST API architectures for modern applications.</p>]]></content>
  </entry>
</feed>
`;

/**
 * Sample invalid feed (HTML instead of RSS/Atom)
 */
export const invalidFeedHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Not a Feed</title>
  <meta charset="UTF-8">
</head>
<body>
  <h1>This is not an RSS or Atom feed</h1>
  <p>This is just a regular HTML page that should not be parsed as a feed.</p>
</body>
</html>
`;

/**
 * Sample parsed RSS feed data (already processed by rss-parser)
 */
export const parsedRssFeed = {
  title: 'Test Tech Blog',
  link: 'https://testblog.example.com',
  description: 'A blog about technology and programming',
  language: 'en-us',
  lastBuildDate: 'Mon, 01 May 2023 12:00:00 GMT',
  items: [
    {
      title: 'Introduction to TDD',
      link: 'https://testblog.example.com/intro-to-tdd',
      pubDate: 'Mon, 01 May 2023 10:00:00 GMT',
      content: '<p>Test-Driven Development (TDD) is a software development approach where tests are written before the code itself.</p><p>This article explores the benefits of this methodology.</p>',
      contentSnippet: 'Test-Driven Development (TDD) is a software development approach where tests are written before the code itself. This article explores the benefits of this methodology.',
      guid: 'https://testblog.example.com/intro-to-tdd',
      author: 'John Doe',
      contentEncoded: '<p>Test-Driven Development (TDD) is a software development approach where tests are written before the code itself.</p><p>This article explores the benefits of this methodology.</p>'
    },
    {
      title: 'Modern JavaScript Frameworks',
      link: 'https://testblog.example.com/modern-js-frameworks',
      pubDate: 'Sun, 30 Apr 2023 15:30:00 GMT',
      content: '<p>This is a comprehensive comparison of React, Angular, and Vue.js in 2023.</p><p>Learn the pros and cons of each framework.</p>',
      contentSnippet: 'This is a comprehensive comparison of React, Angular, and Vue.js in 2023. Learn the pros and cons of each framework.',
      guid: 'https://testblog.example.com/modern-js-frameworks',
      author: 'Jane Smith',
      contentEncoded: '<p>This is a comprehensive comparison of React, Angular, and Vue.js in 2023.</p><p>Learn the pros and cons of each framework.</p>'
    }
  ]
};

/**
 * Sample mock source records from the database
 */
export const mockSources = [
  {
    id: 'source-1',
    name: 'Test Tech Blog',
    url: 'https://testblog.example.com/rss',
    sourceType: 'RSS',
    userId: 'user-1',
    isActive: true,
    refreshRate: 60,
    lastFetched: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
    settings: { fetchFullText: false },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 'source-2',
    name: 'Test Dev News',
    url: 'https://devnews.example.com/atom',
    sourceType: 'RSS',
    userId: 'user-1',
    isActive: true,
    refreshRate: 30,
    lastFetched: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    settings: { fetchFullText: true },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
  },
  {
    id: 'source-3',
    name: 'Inactive Blog',
    url: 'https://inactive.example.com/rss',
    sourceType: 'RSS',
    userId: 'user-2',
    isActive: false,
    refreshRate: 60,
    lastFetched: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    settings: { fetchFullText: false },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  }
];

/**
 * Sample mock content records from the database
 */
export const mockContents = [
  {
    id: 'content-1',
    title: 'Introduction to TDD',
    url: 'https://testblog.example.com/intro-to-tdd',
    sourceId: 'source-1',
    publishedAt: new Date('2023-05-01T10:00:00Z'),
    contentText: 'Test-Driven Development (TDD) is a software development approach where tests are written before the code itself. This article explores the benefits of this methodology.',
    contentHtml: '<p>Test-Driven Development (TDD) is a software development approach where tests are written before the code itself.</p><p>This article explores the benefits of this methodology.</p>',
    author: 'John Doe',
    status: 'UNREAD',
    priority: 'MEDIUM',
    isDeleted: false,
    metadata: { 
      readTime: 4,
      feedItemId: 'https://testblog.example.com/intro-to-tdd',
      categories: []
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 'content-2',
    title: 'Modern JavaScript Frameworks',
    url: 'https://testblog.example.com/modern-js-frameworks',
    sourceId: 'source-1',
    publishedAt: new Date('2023-04-30T15:30:00Z'),
    contentText: 'This is a comprehensive comparison of React, Angular, and Vue.js in 2023. Learn the pros and cons of each framework.',
    contentHtml: '<p>This is a comprehensive comparison of React, Angular, and Vue.js in 2023.</p><p>Learn the pros and cons of each framework.</p>',
    author: 'Jane Smith',
    status: 'READ',
    priority: 'HIGH',
    isDeleted: false,
    metadata: { 
      readTime: 6,
      feedItemId: 'https://testblog.example.com/modern-js-frameworks',
      categories: ['JavaScript', 'Frameworks']
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  }
]; 