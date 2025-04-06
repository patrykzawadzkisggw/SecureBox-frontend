import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { AddPasswordDialog } from '../components/AddPasswordDialog';
import { PasswordProvider } from '../data/PasswordContext';
import '../index.css';

export default {
  title: 'Komponenty/AddPasswordDialog',
  component: AddPasswordDialog,
} as ComponentMeta<typeof AddPasswordDialog>;

const Template: ComponentStory<typeof AddPasswordDialog> = (args) => (
  <PasswordProvider>
    <AddPasswordDialog {...args} />
  </PasswordProvider>
);

export const Default = Template.bind({});
Default.args = {
  isDialogOpen: true,
  setIsDialogOpen: () => {},
};

export const WithError = Template.bind({});
WithError.args = {
  isDialogOpen: true,
  setIsDialogOpen: () => {},
  error: "Pole 'Strona' nie może być puste.",
};
