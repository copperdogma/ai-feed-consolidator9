/**
 * Tests for the UserRepository implementation
 * (Migrated from Jest to Vitest)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepositoryImpl } from '../../repositories/user.repository';
import { PrismaClient } from '@prisma/client';
import { mockPrisma } from '../utils/mock-utils';

// Mock the PrismaClient
describe('UserRepository', () => {
  let prisma: any;
  let userRepository: UserRepositoryImpl;
  
  // Sample user data for testing
  const sampleUser = {
    id: 'user-123',
    email: 'user@example.com',
    firebaseUid: 'firebase-uid-123',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    role: 'USER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Create a fresh mock for each test
    prisma = mockPrisma();
    userRepository = new UserRepositoryImpl(prisma as any);
  });

  describe('findById', () => {
    it('should return user when it exists', async () => {
      // Setup the mock to return our sample user
      (prisma.user.findUnique as any).mockResolvedValue(sampleUser);

      // Execute the method under test
      const result = await userRepository.findById('user-123');

      // Verify the result
      expect(result).toEqual(sampleUser);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' }
      });
    });

    it('should return null when user does not exist', async () => {
      // Setup the mock to return null
      (prisma.user.findUnique as any).mockResolvedValue(null);

      // Execute the method under test
      const result = await userRepository.findById('non-existent');

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Setup: Create an array of sample users
      const users = [
        { ...sampleUser, id: 'user-1' },
        { ...sampleUser, id: 'user-2', email: 'user2@example.com' }
      ];
      (prisma.user.findMany as any).mockResolvedValue(users);

      // Execute the method under test
      const result = await userRepository.findAll();

      // Verify the result
      expect(result).toEqual(users);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined
      });
    });

    it('should return users with pagination', async () => {
      // Setup: Create an array of sample users
      const users = [{ ...sampleUser, id: 'user-2' }];
      (prisma.user.findMany as any).mockResolvedValue(users);

      // Execute the method under test with pagination
      const result = await userRepository.findAll({ skip: 1, take: 1 });

      // Verify the result
      expect(result).toEqual(users);
      expect(result.length).toBe(1);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: 1,
        take: 1,
        where: undefined
      });
    });

    it('should return users with filtering', async () => {
      // Setup: Create filtered users
      const users = [{ ...sampleUser, role: 'ADMIN' }];
      (prisma.user.findMany as any).mockResolvedValue(users);

      // Execute the method under test with filtering
      const result = await userRepository.findAll({ 
        where: { role: 'ADMIN' } 
      });

      // Verify the result
      expect(result).toEqual(users);
      expect(result.length).toBe(1);
      expect((result[0] as any).role).toBe('ADMIN');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: { role: 'ADMIN' }
      });
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      // Setup: The data we want to create
      const newUserData = {
        email: 'newuser@example.com',
        firebaseUid: 'firebase-uid-new',
        name: 'New User',
        role: 'USER'
      };

      // Setup: Mock the create method to return our data plus an ID
      const createdUser = { 
        ...newUserData,
        id: 'new-user-123', 
        avatar: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date() 
      };
      (prisma.user.create as any).mockResolvedValue(createdUser);

      // Execute the method under test
      const result = await userRepository.create(newUserData);

      // Verify the result
      expect(result).toEqual(createdUser);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: newUserData
      });
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      // Setup: The data we want to update
      const updateData = {
        name: 'Updated Name',
        avatar: 'https://example.com/new-avatar.jpg'
      };

      // Setup: Mock the update method to return updated user
      const updatedUser = { 
        ...sampleUser,
        ...updateData,
        updatedAt: new Date() 
      };
      (prisma.user.update as any).mockResolvedValue(updatedUser);

      // Execute the method under test
      const result = await userRepository.update('user-123', updateData);

      // Verify the result
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe('Updated Name');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateData
      });
    });

    it('should throw an error when user does not exist', async () => {
      // Setup: Mock to throw an error
      const error = new Error('User not found');
      (prisma.user.update as any).mockRejectedValue(error);

      // Execute & Verify
      await expect(userRepository.update('non-existent', { name: 'New Name' }))
        .rejects.toThrow('User not found');
    });
  });

  describe('delete', () => {
    it('should delete user and return true on success', async () => {
      // Setup: Mock the delete method to return the deleted user
      (prisma.user.delete as any).mockResolvedValue(sampleUser);

      // Execute the method under test
      const result = await userRepository.delete('user-123');

      // Verify the result
      expect(result).toBe(true);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' }
      });
    });

    it('should return false when deletion fails', async () => {
      // Setup: Mock to throw an error
      const error = new Error('User not found');
      (prisma.user.delete as any).mockRejectedValue(error);

      // Execute the method under test
      const result = await userRepository.delete('non-existent');

      // Verify the result
      expect(result).toBe(false);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent' }
      });
    });
  });

  describe('count', () => {
    it('should return the number of users', async () => {
      // Setup: Mock to return a count
      (prisma.user.count as any).mockResolvedValue(10);

      // Execute the method under test
      const result = await userRepository.count();

      // Verify the result
      expect(result).toBe(10);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: undefined
      });
    });

    it('should return the number of filtered users', async () => {
      // Setup: Mock to return a filtered count
      (prisma.user.count as any).mockResolvedValue(2);

      // Execute the method under test with filter
      const result = await userRepository.count({ role: 'ADMIN' });

      // Verify the result
      expect(result).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { role: 'ADMIN' }
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user when email exists', async () => {
      // Setup the mock to return our sample user
      (prisma.user.findUnique as any).mockResolvedValue(sampleUser);

      // Execute the method under test
      const result = await userRepository.findByEmail('user@example.com');

      // Verify the result
      expect(result).toEqual(sampleUser);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' }
      });
    });

    it('should return null when email does not exist', async () => {
      // Setup the mock to return null
      (prisma.user.findUnique as any).mockResolvedValue(null);

      // Execute the method under test
      const result = await userRepository.findByEmail('nonexistent@example.com');

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('findByFirebaseUid', () => {
    it('should return user when Firebase UID exists', async () => {
      // Setup the mock to return our sample user
      (prisma.user.findUnique as any).mockResolvedValue(sampleUser);

      // Execute the method under test
      const result = await userRepository.findByFirebaseUid('firebase-uid-123');

      // Verify the result
      expect(result).toEqual(sampleUser);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid: 'firebase-uid-123' }
      });
    });

    it('should return null when Firebase UID does not exist', async () => {
      // Setup the mock to return null
      (prisma.user.findUnique as any).mockResolvedValue(null);

      // Execute the method under test
      const result = await userRepository.findByFirebaseUid('non-existent-uid');

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile with name and avatar', async () => {
      // Setup: The profile data we want to update
      const profileData = {
        name: 'Updated Name',
        avatar: 'https://example.com/new-avatar.jpg'
      };

      // Setup: Mock the update method to return updated user
      const updatedUser = { 
        ...sampleUser,
        ...profileData,
        updatedAt: new Date() 
      };
      (prisma.user.update as any).mockResolvedValue(updatedUser);

      // Execute the method under test
      const result = await userRepository.updateProfile('user-123', profileData);

      // Verify the result
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe('Updated Name');
      expect(result.avatar).toBe('https://example.com/new-avatar.jpg');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: profileData
      });
    });

    it('should update profile with only name', async () => {
      // Setup: The profile data with only name
      const profileData = {
        name: 'Updated Name'
      };

      // Setup: Mock the update method to return updated user
      const updatedUser = { 
        ...sampleUser,
        name: 'Updated Name',
        updatedAt: new Date() 
      };
      (prisma.user.update as any).mockResolvedValue(updatedUser);

      // Execute the method under test
      const result = await userRepository.updateProfile('user-123', profileData);

      // Verify the result
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe('Updated Name');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: profileData
      });
    });

    it('should throw an error when user does not exist', async () => {
      // Setup: Mock to throw an error
      const error = new Error('User not found');
      (prisma.user.update as any).mockRejectedValue(error);

      // Execute & Verify
      await expect(userRepository.updateProfile('non-existent', { name: 'New Name' }))
        .rejects.toThrow('User not found');
    });
  });

  describe('withTransaction', () => {
    it('should return a new repository instance with transaction client', () => {
      // Setup: Create a mock transaction client
      const mockTx = mockPrisma();
      
      // Execute the method under test
      const txRepository = userRepository.withTransaction(mockTx);
      
      // Verify the result
      expect(txRepository).toBeInstanceOf(UserRepositoryImpl);
      // Note: We cannot easily test the internal state (that it's using the tx client)
      // without exposing internal details
    });
  });
}); 