/**
 * Type declaration file to augment evergreen-ui types
 */
import '@types/react';

declare module 'evergreen-ui' {
  // Extend IconButton component to accept string type for icon prop
  export interface IconButtonProps {
    icon?: string | React.ReactElement;
  }
} 