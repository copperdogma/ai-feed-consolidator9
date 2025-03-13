import { useState, FormEvent, useEffect, useRef } from 'react';
import { Pane, TextInputField, Button, toaster, Spinner, Text, Alert, Paragraph, Radio, RadioGroup } from 'evergreen-ui';
import { trpc } from '../../../lib/trpc';

interface AddFeedFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ValidationResult {
  isValid: boolean;
  feedTitle?: string;
  error?: string;
}

interface DiscoveredFeed {
  url: string;
  title: string | null;
}

interface DiscoveryResult {
  success: boolean;
  discoveredFeeds?: DiscoveredFeed[];
  error?: string;
}

const AddFeedForm = ({ onSuccess, onCancel }: AddFeedFormProps) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [refreshRate, setRefreshRate] = useState('60'); // Default to 60 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [selectedFeedUrl, setSelectedFeedUrl] = useState<string>('');
  
  // For debouncing URL processing
  const urlTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Setup the mutations
  const validateUrlMutation = trpc.feed.validateFeedUrl.useMutation({
    onSuccess: (data: ValidationResult) => {
      setIsValidating(false);
      setIsProcessing(false);
      setValidationResult(data);
      
      if (data.isValid && data.feedTitle && !name) {
        // Auto-fill the name field with the feed title if it's empty
        setName(data.feedTitle);
      }
    },
    onError: (error: Error) => {
      setIsValidating(false);
      setIsProcessing(false);
      toaster.danger('Error validating feed URL', { description: error.message });
    }
  });

  const discoverFeedsMutation = trpc.feed.discoverFeeds.useMutation({
    onSuccess: (data: DiscoveryResult) => {
      setIsDiscovering(false);
      setIsProcessing(false);
      setDiscoveryResult(data);
      
      if (data.success && data.discoveredFeeds && data.discoveredFeeds.length > 0) {
        // Automatically select the first feed
        const firstFeed = data.discoveredFeeds[0];
        setSelectedFeedUrl(firstFeed.url);
        
        // Populate feed name if empty
        if (!name && firstFeed.title) {
          setName(firstFeed.title);
        }
        
        // Auto-validate the selected feed
        validateUrlMutation.mutate({ url: firstFeed.url });
        
        toaster.success(`Found ${data.discoveredFeeds.length} feed${data.discoveredFeeds.length > 1 ? 's' : ''}!`);
      }
    },
    onError: (error: Error) => {
      setIsDiscovering(false);
      setIsProcessing(false);
      toaster.danger('Error discovering feeds', { description: error.message });
    }
  });

  const addFeedMutation = trpc.feed.addFeedSource.useMutation({
    onSuccess: () => {
      toaster.success('Feed source added successfully!');
      onSuccess();
    },
    onError: (error: Error) => {
      toaster.danger('Error adding feed source', { description: error.message });
    }
  });

  // Process URL when it changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // Reset state when URL changes
    if (newUrl !== url) {
      setValidationResult(null);
      setDiscoveryResult(null);
      setSelectedFeedUrl('');
    }
    
    // Clear any existing timeout
    if (urlTimeoutRef.current) {
      clearTimeout(urlTimeoutRef.current);
    }
    
    // Set a new timeout for processing
    if (newUrl) {
      urlTimeoutRef.current = setTimeout(() => {
        processUrl(newUrl);
      }, 500); // 500ms delay
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (urlTimeoutRef.current) {
        clearTimeout(urlTimeoutRef.current);
      }
    };
  }, []);

  // Process URL to determine if it's a feed or website
  const processUrl = (urlToProcess: string) => {
    if (!urlToProcess) return;
    
    setIsProcessing(true);
    
    // Simple check if it might be a direct feed URL
    const isFeedUrl = urlToProcess.match(/\.(rss|xml|atom)($|\?|#)/i) !== null;
    
    if (isFeedUrl) {
      // Likely a feed URL, validate it directly
      setIsValidating(true);
      validateUrlMutation.mutate({ url: urlToProcess });
    } else {
      // Likely a website URL, discover feeds
      setIsDiscovering(true);
      discoverFeedsMutation.mutate({ url: urlToProcess });
    }
  };

  const handleFeedSelection = (value: string) => {
    setSelectedFeedUrl(value);
    
    // Update name if available
    if (discoveryResult?.discoveredFeeds) {
      const selected = discoveryResult.discoveredFeeds.find(feed => feed.url === value);
      if (selected && selected.title && !name) {
        setName(selected.title);
      }
    }
    
    // Auto-validate the selected feed
    setIsValidating(true);
    setValidationResult(null);
    validateUrlMutation.mutate({ url: value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!url && !selectedFeedUrl) {
      toaster.warning('Please enter a URL');
      return;
    }

    if (!name) {
      toaster.warning('Please enter a name for the feed');
      return;
    }

    // Use the selected feed URL if available, otherwise use the entered URL
    const finalUrl = selectedFeedUrl || url;

    // If the URL hasn't been validated yet, validate it first
    if (!validationResult) {
      setIsProcessing(true);
      setIsValidating(true);
      validateUrlMutation.mutate({ url: finalUrl });
      return;
    }

    // If the URL is invalid, don't submit
    if (!validationResult.isValid) {
      toaster.warning('Please enter a valid RSS feed URL');
      return;
    }

    // Add the feed
    addFeedMutation.mutate({
      url: finalUrl,
      name,
      refreshRate: parseInt(refreshRate, 10)
    });
  };

  const renderStatus = () => {
    if (isProcessing) {
      let message = 'Processing URL...';
      if (isValidating) message = 'Validating feed URL...';
      if (isDiscovering) message = 'Discovering feeds from website...';
      
      return (
        <Pane display="flex" alignItems="center" marginBottom={16}>
          <Spinner size={16} marginRight={8} />
          <Text>{message}</Text>
        </Pane>
      );
    }

    if (validationResult && !validationResult.isValid) {
      return (
        <Alert intent="danger" title="Invalid Feed URL" marginBottom={16}>
          {validationResult.error || 'The URL does not point to a valid RSS feed.'}
        </Alert>
      );
    }

    if (validationResult && validationResult.isValid) {
      return (
        <Alert intent="success" title="Valid Feed" marginBottom={16}>
          Successfully validated "{validationResult.feedTitle || 'Feed'}"
        </Alert>
      );
    }

    if (discoveryResult && !discoveryResult.success) {
      return (
        <Alert intent="danger" title="Feed Discovery Failed" marginBottom={16}>
          {discoveryResult.error || 'Could not find any RSS feeds at this URL.'}
          <Paragraph marginTop={8}>
            Try entering the direct feed URL instead, or try a different website.
          </Paragraph>
        </Alert>
      );
    }

    return null;
  };

  const renderDiscoveredFeeds = () => {
    if (!discoveryResult || !discoveryResult.success || !discoveryResult.discoveredFeeds?.length) {
      return null;
    }

    return (
      <Pane marginBottom={16} background="tint1" padding={12} borderRadius={3}>
        <Text fontWeight="bold" display="block" marginBottom={8}>
          Discovered Feeds ({discoveryResult.discoveredFeeds.length})
        </Text>
        <RadioGroup
          value={selectedFeedUrl}
          onChange={(event) => handleFeedSelection(event.target.value)}
          options={discoveryResult.discoveredFeeds.map((feed) => ({
            label: feed.title || feed.url,
            value: feed.url
          }))}
        />
      </Pane>
    );
  };

  return (
    <Pane>
      <form onSubmit={handleSubmit}>
        <TextInputField
          label="Website or Feed URL"
          placeholder="https://example.com or https://example.com/feed"
          value={url}
          onChange={handleUrlChange}
          required
          hint="Enter a website URL to discover feeds or paste a direct RSS feed URL"
        />

        {renderStatus()}
        {renderDiscoveredFeeds()}

        <TextInputField
          label="Feed Name"
          placeholder="My Awesome Feed"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
          hint="A name to identify this feed source"
        />

        <TextInputField
          label="Refresh Rate (minutes)"
          type="number"
          value={refreshRate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRefreshRate(e.target.value)}
          required
          hint="How often should we check for new content"
          min={5}
          max={1440} // 24 hours
        />

        <Pane display="flex" justifyContent="flex-end" marginTop={24}>
          <Button appearance="minimal" onClick={onCancel} marginRight={8}>
            Cancel
          </Button>

          <Button 
            appearance="primary" 
            type="submit" 
            isLoading={addFeedMutation.isLoading || isProcessing}
            disabled={!url || !name || (validationResult && !validationResult.isValid) || addFeedMutation.isLoading || isProcessing}
          >
            Add Feed
          </Button>
        </Pane>
      </form>
    </Pane>
  );
};

export default AddFeedForm; 