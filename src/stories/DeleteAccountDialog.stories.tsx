import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { DeleteAccountDialog } from '../components/DeleteAccountDialog';
import { PasswordProvider } from '../data/PasswordContext';
import '../index.css';

export default {
  title: 'Komponenty/DeleteAccountDialog',
  component: DeleteAccountDialog,
} as ComponentMeta<typeof DeleteAccountDialog>;

const Template: ComponentStory<typeof DeleteAccountDialog> = (args) => (
  <PasswordProvider>
    <DeleteAccountDialog {...args} />
  </PasswordProvider>
);

export const Default = Template.bind({});
Default.args = {
  isDialogOpen: true,
  setIsDialogOpen: () => console.log('Dialog zamknięty'),
  platform: 'example.com',
  login: 'user@example.com',
};

export const Closed = Template.bind({});
Closed.args = {
  isDialogOpen: false,
  setIsDialogOpen: () => console.log('Dialog zamknięty'),
  platform: 'example.com',
  login: 'user@example.com',
};
