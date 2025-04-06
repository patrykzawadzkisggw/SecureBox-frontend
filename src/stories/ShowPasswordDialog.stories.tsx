import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ShowPasswordDialog } from '../components/ShowPasswordDialog';
import { PasswordProvider } from '../data/PasswordContext';
import '../index.css';

export default {
  title: 'Komponenty/ShowPasswordDialog',
  component: ShowPasswordDialog,
} as ComponentMeta<typeof ShowPasswordDialog>;

const Template: ComponentStory<typeof ShowPasswordDialog> = (args) => (
  <PasswordProvider>
    <ShowPasswordDialog {...args} />
  </PasswordProvider>
);

export const Default = Template.bind({});
Default.args = {
  isDialogOpen: true,
  setIsDialogOpen: () => {},
  passwordfile: 'example-password-file',
  platform: 'Example Platform',
  login: 'example-login',
};

export const Loading = Template.bind({});
Loading.args = {
  isDialogOpen: true,
  setIsDialogOpen: () => {},
  passwordfile: 'example-password-file',
  platform: 'Example Platform',
  login: 'example-login',
};

export const DecryptionError = Template.bind({});
DecryptionError.args = {
  isDialogOpen: true,
  setIsDialogOpen: () => {},
  passwordfile: 'example-password-file',
  platform: 'Example Platform',
  login: 'example-login',
};
