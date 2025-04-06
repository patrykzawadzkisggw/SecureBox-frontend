import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { UpdateMasterkeyDialog } from '../components/UpdateMasterkeyDialog';
import { PasswordProvider } from '../data/PasswordContext';
import '../index.css';

export default {
  title: 'Przykłady/UpdateMasterkeyDialog',
  component: UpdateMasterkeyDialog,
} as ComponentMeta<typeof UpdateMasterkeyDialog>;

const Template: ComponentStory<typeof UpdateMasterkeyDialog> = (args) => (
  <PasswordProvider>
    <UpdateMasterkeyDialog {...args} />
  </PasswordProvider>
);

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  onClose: () => {},
  onSubmit: (newMasterkey: string) => {},
};

export const WithError = Template.bind({});
WithError.args = {
  isOpen: true,
  onClose: () => {},
  onSubmit: (newMasterkey: string) => {},
  error: 'Błąd aktualizacji klucza głównego',
};
