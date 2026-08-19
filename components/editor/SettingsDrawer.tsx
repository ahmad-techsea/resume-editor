import React from 'react';
import { FiSettings } from 'react-icons/fi';
import Drawer from './Drawer';
import Toolbar, { type ToolbarProps } from './Toolbar';

export interface SettingsDrawerProps {
  open: boolean;
  onToggle: () => void;
  toolbar: ToolbarProps;
}

export default function SettingsDrawer({ open, onToggle, toolbar }: SettingsDrawerProps) {
  return (
    <Drawer
      side="right"
      open={open}
      onToggle={onToggle}
      title="Settings"
      toggleLabel={open ? 'Close settings' : 'Open settings'}
      icon={<FiSettings size={18} />}
      width={300}
    >
      <Toolbar {...toolbar} />
    </Drawer>
  );
}
