import { useState, FormEvent, useEffect } from 'react';
import { Pane, TextInputField, Button, toaster } from 'evergreen-ui';
import { trpc } from '../../../lib/trpc';

interface FeedSource {
  id: string;
  name: string;
  url: string;
  refreshRate: number;
  userId: string;
  lastRefreshedAt?: Date | string | null;
  settings?: any;
}

interface EditFeedFormProps {
  feed: FeedSource;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditFeedForm = ({ feed, onSuccess, onCancel }: EditFeedFormProps) => {
  const [name, setName] = useState(feed.name);
  const [refreshRate, setRefreshRate] = useState(feed.refreshRate.toString());

  // Reset form when feed changes
  useEffect(() => {
    setName(feed.name);
    setRefreshRate(feed.refreshRate.toString());
  }, [feed]);

  // Setup the mutation
  const updateFeedMutation = trpc.feed.updateFeedSource.useMutation({
    onSuccess: () => {
      toaster.success('Feed source updated successfully!');
      onSuccess();
    },
    onError: (error: Error) => {
      toaster.danger('Error updating feed source', { description: error.message });
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name) {
      toaster.warning('Please enter a name for the feed');
      return;
    }

    // Update the feed
    updateFeedMutation.mutate({
      id: feed.id,
      name,
      refreshRate: parseInt(refreshRate, 10)
    });
  };

  return (
    <Pane>
      <form onSubmit={handleSubmit}>
        <TextInputField
          label="Feed URL"
          value={feed.url}
          disabled
          hint="Feed URL cannot be changed. You can delete this feed and add a new one if needed."
        />

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
            isLoading={updateFeedMutation.isLoading}
            disabled={!name || updateFeedMutation.isLoading}
          >
            Update Feed
          </Button>
        </Pane>
      </form>
    </Pane>
  );
};

export default EditFeedForm; 