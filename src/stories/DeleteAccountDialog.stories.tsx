import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { DeleteAccountDialog } from '../components/DeleteAccountDialog';

export default {
  title: 'Komponenty/DeleteAccountDialog',
  component: DeleteAccountDialog,
} as ComponentMeta<typeof DeleteAccountDialog>;

const Template: ComponentStory<typeof DeleteAccountDialog> = (args) => <DeleteAccountDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  onClose: () => console.log('Dialog zamknięty'),
  onDelete: () => console.log('Konto usunięte'),
};

export const Closed = Template.bind({});
Closed.args = {
  isOpen: false,
  onClose: () => console.log('Dialog zamknięty'),
  onDelete: () => console.log('Konto usunięte'),
};
