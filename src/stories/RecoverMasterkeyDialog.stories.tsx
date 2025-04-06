import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { RecoverMasterkeyDialog } from '../components/RecoverMasterkeyDialog';

export default {
  title: 'Przykłady/RecoverMasterkeyDialog',
  component: RecoverMasterkeyDialog,
} as ComponentMeta<typeof RecoverMasterkeyDialog>;

const Template: ComponentStory<typeof RecoverMasterkeyDialog> = (args) => <RecoverMasterkeyDialog {...args} />;

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
