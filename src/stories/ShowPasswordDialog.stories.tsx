import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ShowPasswordDialog } from '../components/ShowPasswordDialog';

export default {
  title: 'Komponenty/ShowPasswordDialog',
  component: ShowPasswordDialog,
} as ComponentMeta<typeof ShowPasswordDialog>;

const Template: ComponentStory<typeof ShowPasswordDialog> = (args) => <ShowPasswordDialog {...args} />;

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
