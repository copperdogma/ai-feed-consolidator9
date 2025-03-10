import prisma from '../sdks/prisma';
import { Prisma } from '@prisma/client';
import { UserRepositoryImpl } from './user.repository';
import { SourceRepositoryImpl } from './source.repository';
import { ContentRepositoryImpl } from './content.repository';
import { SummaryRepositoryImpl } from './summary.repository';
import { TopicRepositoryImpl } from './topic.repository';
import { ActivityRepositoryImpl } from './activity.repository';
import { ContentTopicRepositoryImpl } from './content-topic.repository';

/**
 * Factory for creating repository instances
 * This centralizes the Prisma instance management
 */
class RepositoryFactory {
  private static userRepository: UserRepositoryImpl;
  private static sourceRepository: SourceRepositoryImpl;
  private static contentRepository: ContentRepositoryImpl;
  private static summaryRepository: SummaryRepositoryImpl;
  private static topicRepository: TopicRepositoryImpl;
  private static activityRepository: ActivityRepositoryImpl;
  private static contentTopicRepository: ContentTopicRepositoryImpl;

  /**
   * Get the User repository instance
   * @returns User repository
   */
  static getUserRepository(): UserRepositoryImpl {
    if (!this.userRepository) {
      this.userRepository = new UserRepositoryImpl(prisma);
    }
    return this.userRepository;
  }

  /**
   * Get the Source repository instance
   * @returns Source repository
   */
  static getSourceRepository(): SourceRepositoryImpl {
    if (!this.sourceRepository) {
      this.sourceRepository = new SourceRepositoryImpl(prisma);
    }
    return this.sourceRepository;
  }

  /**
   * Get the Content repository instance
   * @returns Content repository
   */
  static getContentRepository(): ContentRepositoryImpl {
    if (!this.contentRepository) {
      this.contentRepository = new ContentRepositoryImpl(prisma);
    }
    return this.contentRepository;
  }

  /**
   * Get the Summary repository instance
   * @returns Summary repository
   */
  static getSummaryRepository(): SummaryRepositoryImpl {
    if (!this.summaryRepository) {
      this.summaryRepository = new SummaryRepositoryImpl(prisma);
    }
    return this.summaryRepository;
  }

  /**
   * Get the Topic repository instance
   * @returns Topic repository
   */
  static getTopicRepository(): TopicRepositoryImpl {
    if (!this.topicRepository) {
      this.topicRepository = new TopicRepositoryImpl(prisma);
    }
    return this.topicRepository;
  }

  /**
   * Get the Activity repository instance
   * @returns Activity repository
   */
  static getActivityRepository(): ActivityRepositoryImpl {
    if (!this.activityRepository) {
      this.activityRepository = new ActivityRepositoryImpl(prisma);
    }
    return this.activityRepository;
  }

  /**
   * Get the ContentTopic repository instance
   * @returns ContentTopic repository
   */
  static getContentTopicRepository(): ContentTopicRepositoryImpl {
    if (!this.contentTopicRepository) {
      this.contentTopicRepository = new ContentTopicRepositoryImpl(prisma);
    }
    return this.contentTopicRepository;
  }

  /**
   * Execute a database transaction
   * @param callback Function to execute within the transaction
   * @returns Result of the callback
   */
  static async executeTransaction<T>(
    callback: (repositories: {
      userRepository: UserRepositoryImpl;
      sourceRepository: SourceRepositoryImpl;
      contentRepository: ContentRepositoryImpl;
      summaryRepository: SummaryRepositoryImpl;
      topicRepository: TopicRepositoryImpl;
      activityRepository: ActivityRepositoryImpl;
      contentTopicRepository: ContentTopicRepositoryImpl;
    }) => Promise<T>
  ): Promise<T> {
    return prisma.$transaction(async (tx) => {
      // Create transaction-specific repositories
      const repositories = {
        userRepository: new UserRepositoryImpl(tx),
        sourceRepository: new SourceRepositoryImpl(tx),
        contentRepository: new ContentRepositoryImpl(tx),
        summaryRepository: new SummaryRepositoryImpl(tx),
        topicRepository: new TopicRepositoryImpl(tx),
        activityRepository: new ActivityRepositoryImpl(tx),
        contentTopicRepository: new ContentTopicRepositoryImpl(tx),
      };

      // Execute the callback with the transaction repositories
      return callback(repositories);
    });
  }
}

export default RepositoryFactory; 