import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { UpdateMasterkeyDialog } from '../components/UpdateMasterkeyDialog';

export default {
  title: 'Przykłady/UpdateMasterkeyDialog',
  component: UpdateMasterkeyDialog,
} as ComponentMeta<typeof UpdateMasterkeyDialog>;

const Template: ComponentStory<typeof UpdateMasterkeyDialog> = (args) => <UpdateMasterkeyDialog {...args} />;

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
