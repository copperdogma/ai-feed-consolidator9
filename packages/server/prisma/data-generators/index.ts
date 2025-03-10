/**
 * Data generators for database seeding
 * 
 * This module contains functions for generating realistic test data
 * for database seeding and testing.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a random date within a range
 */
export function randomDate(start: Date, end: Date = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate a random integer within a range (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random item from an array
 */
export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * User data generator
 */
export const userGenerator = {
  /**
   * Generate a test user
   */
  generate(index: number = 0) {
    const id = uuidv4();
    return {
      id,
      email: `user${index}@example.com`,
      name: `Test User ${index}`,
      firebaseUid: `test-firebase-uid-${id.substring(0, 8)}`,
      avatar: index % 3 === 0 ? `https://i.pravatar.cc/150?u=${id}` : null,
      isActive: true,
      createdAt: randomDate(new Date(2023, 0, 1)),
      updatedAt: new Date()
    };
  },

  /**
   * Generate multiple test users
   */
  generateMany(count: number) {
    return Array.from({ length: count }, (_, i) => this.generate(i + 1));
  }
};

/**
 * Source data generator
 */
export const sourceGenerator = {
  /**
   * Generate a test source
   */
  generate(userId: string, index: number = 0) {
    const types = ['RSS', 'YOUTUBE', 'TWITTER', 'EMAIL'];
    const type = randomItem(types);
    const id = uuidv4();
    
    const sourcesByType = {
      RSS: {
        name: [`Tech News ${index}`, `Dev Blog ${index}`, `News Feed ${index}`],
        url: [`https://technews${index}.example.com/rss`, `https://devblog${index}.example.com/feed`, `https://news${index}.example.com/rss`]
      },
      YOUTUBE: {
        name: [`Coding Channel ${index}`, `Tech Reviews ${index}`, `Tutorial Series ${index}`],
        url: [`https://youtube.com/channel/coding${index}`, `https://youtube.com/channel/tech${index}`, `https://youtube.com/channel/tutorials${index}`]
      },
      TWITTER: {
        name: [`Twitter Dev ${index}`, `Tech Twitter ${index}`, `Programming Twitter ${index}`],
        url: [`https://twitter.com/dev${index}`, `https://twitter.com/tech${index}`, `https://twitter.com/programming${index}`]
      },
      EMAIL: {
        name: [`Newsletter ${index}`, `Weekly Digest ${index}`, `Daily Update ${index}`],
        url: [`newsletter${index}@example.com`, `weekly${index}@example.com`, `daily${index}@example.com`]
      }
    };
    
    const nameOptions = sourcesByType[type].name;
    const urlOptions = sourcesByType[type].url;
    
    return {
      id,
      name: randomItem(nameOptions),
      url: randomItem(urlOptions),
      sourceType: type,
      userId,
      icon: index % 2 === 0 ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(randomItem(urlOptions))}` : null,
      isActive: Math.random() > 0.1, // 90% active
      refreshRate: randomItem([15, 30, 60, 120, 240, 480]),
      lastFetched: Math.random() > 0.3 ? randomDate(new Date(Date.now() - 86400000)) : null, // 70% have been fetched in last 24h
      settings: type === 'RSS' ? { fetchFullText: Math.random() > 0.5 } : null,
      createdAt: randomDate(new Date(2023, 0, 1)),
      updatedAt: new Date()
    };
  },

  /**
   * Generate multiple test sources
   */
  generateMany(userId: string, count: number) {
    return Array.from({ length: count }, (_, i) => this.generate(userId, i + 1));
  }
};

/**
 * Content data generator
 */
export const contentGenerator = {
  /**
   * Generate a test content item
   */
  generate(sourceId: string, index: number = 0) {
    const id = uuidv4();
    const statuses = ['UNREAD', 'READ', 'ARCHIVED', 'DELETED'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const titles = [
      `How to Build Better Software ${index}`,
      `Latest Tech Trends ${index}`,
      `Programming Best Practices ${index}`,
      `AI Advancements in 2025 ${index}`,
      `The Future of Web Development ${index}`
    ];
    const contentTexts = [
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis eget urna ultrices ultricies ${index}`,
      `Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor ${index}`,
      `Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi ${index}`
    ];
    
    return {
      id,
      title: randomItem(titles),
      url: `https://example.com/content/${id}`,
      contentText: randomItem(contentTexts),
      contentHtml: `<p>${randomItem(contentTexts)}</p>`,
      sourceId,
      author: Math.random() > 0.3 ? `Author ${index}` : null,
      publishedAt: randomDate(new Date(2023, 0, 1)),
      status: randomItem(statuses),
      priority: randomItem(priorities),
      metadata: { readTime: randomInt(1, 20) },
      isDeleted: Math.random() < 0.05, // 5% deleted
      createdAt: randomDate(new Date(2023, 0, 1)),
      updatedAt: new Date()
    };
  },

  /**
   * Generate multiple test content items
   */
  generateMany(sourceId: string, count: number) {
    return Array.from({ length: count }, (_, i) => this.generate(sourceId, i + 1));
  }
};

/**
 * Summary data generator
 */
export const summaryGenerator = {
  /**
   * Generate a test summary
   */
  generate(contentId: string) {
    const summaries = [
      "This article discusses the latest trends in software development, focusing on containerization and microservices.",
      "A comprehensive overview of AI advancements in the past year and predictions for future developments.",
      "The author explores best practices for writing maintainable and scalable code in modern applications.",
      "A tutorial on implementing authentication in web applications with a focus on security considerations.",
      "This post analyzes performance optimization techniques for database queries in high-load applications."
    ];
    
    return {
      id: uuidv4(),
      contentId,
      summaryText: randomItem(summaries),
      createdAt: randomDate(new Date(2023, 0, 1)),
      updatedAt: new Date()
    };
  }
};

/**
 * Topic data generator
 */
export const topicGenerator = {
  /**
   * Generate a test topic
   */
  generate(index: number = 0) {
    const topics = [
      { name: 'Programming', description: 'Software development and coding topics' },
      { name: 'AI', description: 'Artificial intelligence and machine learning' },
      { name: 'DevOps', description: 'Development operations and deployment' },
      { name: 'Security', description: 'Cybersecurity and application security' },
      { name: 'Frontend', description: 'Frontend development and UI/UX' },
      { name: 'Backend', description: 'Backend development and APIs' },
      { name: 'Database', description: 'Database design and optimization' },
      { name: 'Cloud', description: 'Cloud computing and services' },
      { name: 'Mobile', description: 'Mobile application development' },
      { name: 'IoT', description: 'Internet of Things and connected devices' }
    ];
    
    const topic = topics[index % topics.length];
    
    return {
      id: uuidv4(),
      name: topic.name,
      description: topic.description,
      createdAt: randomDate(new Date(2023, 0, 1)),
      updatedAt: new Date()
    };
  },

  /**
   * Generate multiple test topics
   */
  generateMany(count: number) {
    return Array.from({ length: Math.min(count, 10) }, (_, i) => this.generate(i));
  }
};

/**
 * Content-Topic association generator
 */
export const contentTopicGenerator = {
  /**
   * Generate a test content-topic association
   */
  generate(contentId: string, topicId: string) {
    return {
      contentId,
      topicId,
      assignedAt: randomDate(new Date(2023, 0, 1))
    };
  },

  /**
   * Generate multiple random content-topic associations
   */
  generateRandomAssociations(contentIds: string[], topicIds: string[], count: number) {
    const associations = [];
    const added = new Set<string>();
    
    // Ensure we don't exceed the possible combinations
    const maxAssociations = Math.min(count, contentIds.length * topicIds.length);
    
    for (let i = 0; i < maxAssociations; i++) {
      const contentId = randomItem(contentIds);
      const topicId = randomItem(topicIds);
      const key = `${contentId}-${topicId}`;
      
      // Skip if this association already exists
      if (added.has(key)) {
        i--;
        continue;
      }
      
      associations.push(this.generate(contentId, topicId));
      added.add(key);
    }
    
    return associations;
  }
};

/**
 * Activity data generator
 */
export const activityGenerator = {
  /**
   * Generate a test activity
   */
  generate(userId: string, contentId: string | null = null) {
    const actions = ['read', 'archive', 'mark_priority', 'share', 'summarize'];
    const action = randomItem(actions);
    
    let details: Record<string, any> = {};
    
    switch (action) {
      case 'mark_priority':
        details = { priority: randomItem(['LOW', 'MEDIUM', 'HIGH', 'URGENT']) };
        break;
      case 'share':
        details = { shareMethod: randomItem(['email', 'twitter', 'copy_link']) };
        break;
      case 'summarize':
        details = { type: randomItem(['auto', 'manual']) };
        break;
    }
    
    return {
      id: uuidv4(),
      userId,
      contentId,
      action,
      details: Object.keys(details).length > 0 ? details : null,
      createdAt: randomDate(new Date(2023, 0, 1))
    };
  },

  /**
   * Generate multiple test activities for a user
   */
  generateForUser(userId: string, contentIds: string[], count: number) {
    return Array.from({ length: count }, () => {
      const useContent = Math.random() > 0.1; // 90% activities are related to content
      const contentId = useContent ? randomItem(contentIds) : null;
      return this.generate(userId, contentId);
    });
  }
}; 