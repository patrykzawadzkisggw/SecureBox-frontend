import React from 'react';
import { Meta, Story } from '@storybook/react';
import { NavWorkspaces } from '../components/nav-workspaces';
import { PasswordProvider } from '../data/PasswordContext';
import '../index.css';

export default {
  title: 'Komponenty/NavWorkspaces',
  component: NavWorkspaces,
} as Meta;

const Template: Story = (args) => (
  <PasswordProvider>
    <NavWorkspaces {...args} />
  </PasswordProvider>
);

export const Default = Template.bind({});
Default.args = {
  workspaces: [
    {
      name: 'Workspace 1',
      emoji: '🏢',
      pages: [
        { name: 'Page 1', emoji: '📄' },
        { name: 'Page 2', emoji: '📄' },
      ],
    },
    {
      name: 'Workspace 2',
      emoji: '🏠',
      pages: [
        { name: 'Page 3', emoji: '📄' },
        { name: 'Page 4', emoji: '📄' },
      ],
    },
  ],
};

export const WithMore = Template.bind({});
WithMore.args = {
  workspaces: [
    {
      name: 'Workspace 1',
      emoji: '🏢',
      pages: [
        { name: 'Page 1', emoji: '📄' },
        { name: 'Page 2', emoji: '📄' },
      ],
    },
    {
      name: 'Workspace 2',
      emoji: '🏠',
      pages: [
        { name: 'Page 3', emoji: '📄' },
        { name: 'Page 4', emoji: '📄' },
      ],
    },
  ],
};
