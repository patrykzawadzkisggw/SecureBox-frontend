import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { RecoverMasterkeyDialog } from '../components/RecoverMasterkeyDialog';
import { PasswordProvider } from '../data/PasswordContext';
import '../index.css';

export default {
  title: 'Przykłady/RecoverMasterkeyDialog',
  component: RecoverMasterkeyDialog,
} as ComponentMeta<typeof RecoverMasterkeyDialog>;

const Template: ComponentStory<typeof RecoverMasterkeyDialog> = (args) => (
  <PasswordProvider>
    <RecoverMasterkeyDialog {...args} />
  </PasswordProvider>
);

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  onClose: () => {},
  onSubmit: (masterkey: string) => {},
};

export const Closed = Template.bind({});
Closed.args = {
  isOpen: false,
  onClose: () => {},
  onSubmit: (masterkey: string) => {},
};
