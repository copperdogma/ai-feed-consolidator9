import { useState } from 'react';
import { Pane, Heading, Button, Table, IconButton, Spinner, Text, Dialog, toaster, RefreshIcon, EditIcon, TrashIcon } from 'evergreen-ui';
import { trpc } from '../../lib/trpc';
import AddFeedForm from './components/AddFeedForm';
import EditFeedForm from './components/EditFeedForm';

// Define interface for feed source with all properties used in the component
interface FeedSource {
  id: string;
  name: string;
  url: string;
  refreshRate: number;
  lastRefreshedAt?: Date | string | null;
  contents?: Array<any>;
  userId: string;
}

// Define type for refresh result
interface FeedRefreshResult {
  newItemsCount: number;
  updatedItemsCount?: number;
}

const FeedManagementPage = () => {
  const [isAddingFeed, setIsAddingFeed] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedSource | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);

  // Fetch user's feed sources
  const { data: feedSources, isLoading, refetch } = trpc.feed.listFeedSources.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // Mutations
  const deleteFeedMutation = trpc.feed.deleteFeedSource.useMutation({
    onSuccess: () => {
      toaster.success('Feed source deleted successfully');
      refetch();
    },
    onError: (error: Error) => {
      toaster.danger('Error deleting feed source', { description: error.message });
    },
  });

  const refreshFeedMutation = trpc.feed.refreshFeed.useMutation({
    onSuccess: (data: FeedRefreshResult) => {
      toaster.success(`Feed refreshed successfully. ${data.newItemsCount} new items found.`);
      refetch();
    },
    onError: (error: Error) => {
      toaster.danger('Error refreshing feed', { description: error.message });
    },
  });

  const handleDeleteFeed = (feedId: string) => {
    deleteFeedMutation.mutate({ id: feedId });
    setIsConfirmingDelete(null);
  };

  const handleRefreshFeed = (feedId: string) => {
    refreshFeedMutation.mutate({ id: feedId });
  };

  return (
    <Pane padding={24} maxWidth={1200} marginLeft="auto" marginRight="auto">
      <Pane display="flex" alignItems="center" justifyContent="space-between" marginBottom={16}>
        <Heading size={700}>Feed Sources</Heading>
        <Button appearance="primary" onClick={() => setIsAddingFeed(true)}>
          Add Feed Source
        </Button>
      </Pane>

      {isLoading ? (
        <Pane display="flex" alignItems="center" justifyContent="center" height={300}>
          <Spinner />
        </Pane>
      ) : feedSources && feedSources.length > 0 ? (
        <Table>
          <Table.Head>
            <Table.TextHeaderCell>Name</Table.TextHeaderCell>
            <Table.TextHeaderCell>URL</Table.TextHeaderCell>
            <Table.TextHeaderCell>Refresh Rate</Table.TextHeaderCell>
            <Table.TextHeaderCell>Last Refreshed</Table.TextHeaderCell>
            <Table.TextHeaderCell>Items</Table.TextHeaderCell>
            <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {feedSources.map((feed: FeedSource) => (
              <Table.Row key={feed.id}>
                <Table.TextCell>{feed.name}</Table.TextCell>
                <Table.TextCell>
                  <Text>{feed.url}</Text>
                </Table.TextCell>
                <Table.TextCell>{feed.refreshRate} minutes</Table.TextCell>
                <Table.TextCell>
                  {feed.lastRefreshedAt
                    ? new Date(feed.lastRefreshedAt).toLocaleString()
                    : 'Never'}
                </Table.TextCell>
                <Table.TextCell>{feed.contents?.length || 0}</Table.TextCell>
                <Table.Cell>
                  <Pane display="flex">
                    <IconButton
                      icon={RefreshIcon}
                      marginRight={8}
                      onClick={() => handleRefreshFeed(feed.id)}
                      isLoading={refreshFeedMutation.isLoading && refreshFeedMutation.variables?.id === feed.id}
                    />
                    <IconButton
                      icon={EditIcon}
                      marginRight={8}
                      onClick={() => setEditingFeed(feed)}
                    />
                    <IconButton
                      icon={TrashIcon}
                      intent="danger"
                      onClick={() => setIsConfirmingDelete(feed.id)}
                    />
                  </Pane>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <Pane
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height={300}
          border="1px solid #EDF0F2"
          borderRadius={4}
          background="#F9FAFC"
        >
          <Text size={500} marginBottom={16}>
            You don't have any feed sources yet
          </Text>
          <Button appearance="primary" onClick={() => setIsAddingFeed(true)}>
            Add Your First Feed
          </Button>
        </Pane>
      )}

      {/* Add Feed Dialog */}
      <Dialog
        isShown={isAddingFeed}
        title="Add Feed Source"
        onCloseComplete={() => setIsAddingFeed(false)}
        hasFooter={false}
      >
        {isAddingFeed && (
          <AddFeedForm
            onSuccess={() => {
              setIsAddingFeed(false);
              refetch();
            }}
            onCancel={() => setIsAddingFeed(false)}
          />
        )}
      </Dialog>

      {/* Edit Feed Dialog */}
      <Dialog
        isShown={!!editingFeed}
        title="Edit Feed Source"
        onCloseComplete={() => setEditingFeed(null)}
        hasFooter={false}
      >
        {editingFeed && (
          <EditFeedForm
            feed={editingFeed}
            onSuccess={() => {
              setEditingFeed(null);
              refetch();
            }}
            onCancel={() => setEditingFeed(null)}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isShown={!!isConfirmingDelete}
        title="Delete Feed Source"
        intent="danger"
        onCloseComplete={() => setIsConfirmingDelete(null)}
        confirmLabel="Delete"
        onConfirm={() => isConfirmingDelete && handleDeleteFeed(isConfirmingDelete)}
      >
        <Pane>
          Are you sure you want to delete this feed source? This action cannot be undone.
        </Pane>
      </Dialog>
    </Pane>
  );
};

export default FeedManagementPage; 