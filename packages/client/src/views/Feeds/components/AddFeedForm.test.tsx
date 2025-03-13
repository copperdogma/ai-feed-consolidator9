import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TRPCProvider } from '../../../providers/TRPCProvider';
import AddFeedForm from './AddFeedForm';

// Mock the trpc hooks
vi.mock('../../../lib/trpc', () => ({
  trpc: {
    feed: {
      validateFeedUrl: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false,
        }),
      },
      discoverFeeds: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false,
        }),
      },
      addFeedSource: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false,
        }),
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
      expect(screen.getByText(/Processing URL/i)).toBeInTheDocument();
    });
  });

  it('should auto-fill feed name when feed URL is validated', async () => {
    // Mock successful validation with feed title
    const validateMock = vi.fn().mockImplementation(({ url, onSuccess }) => {
      setTimeout(() => {
        onSuccess({
          isValid: true,
          feedTitle: 'Example Feed',
        });
      }, 100);
    });

    // Override the mock
    vi.mocked(trpc.feed.validateFeedUrl.useMutation).mockReturnValue({
      mutate: validateMock,
      isLoading: false,
    });

    renderComponent();
    
    const urlInput = screen.getByLabelText(/Website or Feed URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/feed.xml' } });
    fireEvent.blur(urlInput);
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Feed Name/i);
      expect(nameInput.value).toBe('Example Feed');
    });
  });

  it('should discover and auto-select feed when website URL is entered', async () => {
    // Mock successful discovery with feeds
    const discoverMock = vi.fn().mockImplementation(({ url, onSuccess }) => {
      setTimeout(() => {
        onSuccess({
          success: true,
          discoveredFeeds: [
            { url: 'https://example.com/feed.xml', title: 'Example Feed' },
            { url: 'https://example.com/rss.xml', title: 'Example RSS' },
          ],
        });
      }, 100);
    });

    // Override the mock
    vi.mocked(trpc.feed.discoverFeeds.useMutation).mockReturnValue({
      mutate: discoverMock,
      isLoading: false,
    });

    renderComponent();
    
    const urlInput = screen.getByLabelText(/Website or Feed URL/i);
    fireEvent.change(urlInput, { target: { value: 'example.com' } });
    fireEvent.blur(urlInput);
    
    await waitFor(() => {
      // Should auto-select the first feed and fill in the name
      expect(screen.getByLabelText(/Feed Name/i).value).toBe('Example Feed');
      expect(screen.getByText(/Found 2 feeds/i)).toBeInTheDocument();
    });
  });

  it('should show error when no feeds are found', async () => {
    // Mock failed discovery
    const discoverMock = vi.fn().mockImplementation(({ url, onError }) => {
      setTimeout(() => {
        onError(new Error('No feeds found'));
      }, 100);
    });

    // Override the mock
    vi.mocked(trpc.feed.discoverFeeds.useMutation).mockReturnValue({
      mutate: discoverMock,
      isLoading: false,
    });

    renderComponent();
    
    const urlInput = screen.getByLabelText(/Website or Feed URL/i);
    fireEvent.change(urlInput, { target: { value: 'example.com' } });
    fireEvent.blur(urlInput);
    
    await waitFor(() => {
      expect(screen.getByText(/No feeds found/i)).toBeInTheDocument();
    });
  });

  it('should submit the form when all fields are valid', async () => {
    // Mock successful validation and feed addition
    const validateMock = vi.fn().mockImplementation(({ url, onSuccess }) => {
      setTimeout(() => {
        onSuccess({
          isValid: true,
          feedTitle: 'Example Feed',
        });
      }, 100);
    });

    const addFeedMock = vi.fn().mockImplementation(({ onSuccess }) => {
      setTimeout(() => {
        onSuccess();
      }, 100);
    });

    // Override the mocks
    vi.mocked(trpc.feed.validateFeedUrl.useMutation).mockReturnValue({
      mutate: validateMock,
      isLoading: false,
    });

    vi.mocked(trpc.feed.addFeedSource.useMutation).mockReturnValue({
      mutate: addFeedMock,
      isLoading: false,
    });

    renderComponent();
    
    // Fill in the form
    const urlInput = screen.getByLabelText(/Website or Feed URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/feed.xml' } });
    fireEvent.blur(urlInput);
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Feed Name/i);
      expect(nameInput.value).toBe('Example Feed');
    });
    
    // Submit the form
    fireEvent.click(screen.getByText(/Add Feed/i));
    
    await waitFor(() => {
      expect(addFeedMock).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
}); 