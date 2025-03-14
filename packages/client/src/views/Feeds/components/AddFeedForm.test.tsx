import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom for the toBeInTheDocument matcher
import { TRPCProvider } from '../../../tests/mocks/TRPCProvider';
import { createMockMutation, MutationOptions } from '../../../tests/mocks/trpcMock';
import AddFeedForm from './AddFeedForm';
import { RouterOutput, RouterInput } from '../../../lib/trpc';

// Define explicit types for our mock functions
type ValidateFeedUrlInput = RouterInput['feed']['validateFeedUrl'];
type ValidateFeedUrlOutput = RouterOutput['feed']['validateFeedUrl'];

type DiscoverFeedsInput = RouterInput['feed']['discoverFeeds'];
type DiscoverFeedsOutput = RouterOutput['feed']['discoverFeeds'];

type AddFeedSourceInput = RouterInput['feed']['addFeedSource'];
type AddFeedSourceOutput = RouterOutput['feed']['addFeedSource'];

// Create typed mock mutations using our utility
const validateFeedUrlMock = createMockMutation<'feed.validateFeedUrl', ValidateFeedUrlInput, ValidateFeedUrlOutput>();
const discoverFeedsMock = createMockMutation<'feed.discoverFeeds', DiscoverFeedsInput, DiscoverFeedsOutput>();
const addFeedSourceMock = createMockMutation<'feed.addFeedSource', AddFeedSourceInput, AddFeedSourceOutput>();

// Mock the trpc hooks
vi.mock('../../../lib/trpc', () => ({
  trpc: {
    feed: {
      validateFeedUrl: {
        useMutation: (options?: MutationOptions<ValidateFeedUrlOutput, Error, ValidateFeedUrlInput, unknown>) => 
          validateFeedUrlMock(options)
      },
      discoverFeeds: {
        useMutation: (options?: MutationOptions<DiscoverFeedsOutput, Error, DiscoverFeedsInput, unknown>) => 
          discoverFeedsMock(options)
      },
      addFeedSource: {
        useMutation: (options?: MutationOptions<AddFeedSourceOutput, Error, AddFeedSourceInput, unknown>) => 
          addFeedSourceMock(options)
      },
    },
  },
}));

// Mock toaster
vi.mock('evergreen-ui', async () => {
  const actual = await vi.importActual('evergreen-ui');
  return {
    ...actual,
    toaster: {
      success: vi.fn(),
      warning: vi.fn(),
      danger: vi.fn(),
    },
  };
});

describe('AddFeedForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to render the component
  const renderComponent = () => {
    return render(
      <TRPCProvider>
        <AddFeedForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      </TRPCProvider>
    );
  };

  it('should render the form with required fields', () => {
    renderComponent();
    
    expect(screen.getByLabelText(/Website or Feed URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Feed Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Refresh Rate/i)).toBeInTheDocument();
  });

  it('should show processing state when URL is entered', async () => {
    renderComponent();
    
    const urlInput = screen.getByLabelText(/Website or Feed URL/i);
    fireEvent.change(urlInput, { target: { value: 'example.com' } });
    fireEvent.blur(urlInput);
    
    await waitFor(() => {
      expect(screen.getByText(/Discovering feeds/i)).toBeInTheDocument();
    });
  });

  it('should auto-fill feed name when feed URL is validated', async () => {
    renderComponent();
    
    const urlInput = screen.getByLabelText(/Website or Feed URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/feed.xml' } });
    fireEvent.blur(urlInput);
    
    // Simulate successful validation response
    await validateFeedUrlMock.mockSuccess({
      isValid: true,
      feedTitle: 'Example Feed'
    });
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Feed Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Example Feed');
    }, { timeout: 1000 });
  });

  it('should discover and auto-select feed when website URL is entered', async () => {
    renderComponent();
    
    const urlInput = screen.getByLabelText(/Website or Feed URL/i);
    fireEvent.change(urlInput, { target: { value: 'example.com' } });
    fireEvent.blur(urlInput);
    
    // Simulate successful discovery response
    await discoverFeedsMock.mockSuccess({
      success: true,
      discoveredFeeds: [
        { url: 'https://example.com/feed.xml', title: 'Example Feed' },
        { url: 'https://example.com/rss.xml', title: 'Example RSS' },
      ]
    });
    
    await waitFor(() => {
      // Should auto-select the first feed and fill in the name
      const nameInput = screen.getByLabelText(/Feed Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Example Feed');
      expect(screen.getByText(/Discovered Feeds/i)).toBeInTheDocument();
      expect(screen.getByText(/2/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should show error when no feeds are found', async () => {
    // Mock the toaster.danger function for this test
    const dangerMock = vi.fn();
    const evergreen = await import('evergreen-ui');
    evergreen.toaster.danger = dangerMock;
    
    renderComponent();
    
    const urlInput = screen.getByLabelText(/Website or Feed URL/i);
    fireEvent.change(urlInput, { target: { value: 'no-feeds-site.com' } });
    fireEvent.blur(urlInput);
    
    // Simulate error response
    await discoverFeedsMock.mockError(new Error('No feeds found'));
    
    await waitFor(() => {
      expect(dangerMock).toHaveBeenCalledWith('Error discovering feeds', { description: 'No feeds found' });
    }, { timeout: 1000 });
  });

  it('should submit the form when all fields are valid', async () => {
    renderComponent();
    
    // Fill in the form
    const urlInput = screen.getByLabelText(/Website or Feed URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/feed.xml' } });
    fireEvent.blur(urlInput);
    
    // Simulate successful validation
    await validateFeedUrlMock.mockSuccess({
      isValid: true,
      feedTitle: 'Example Feed'
    });
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Feed Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Example Feed');
    }, { timeout: 1000 });
    
    // Submit the form
    fireEvent.click(screen.getByText(/Add Feed/i));
    
    // Simulate successful submission
    await addFeedSourceMock.mockSuccess();
    
    await waitFor(() => {
      expect(addFeedSourceMock._mutateMock).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
}); 