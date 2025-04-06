import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ExportToJSON from '../components/ExportToJSON';
import { PasswordProvider } from '../data/PasswordContext';
import { ToastProvider } from 'sonner';
import '../index.css';

export default {
  title: 'Komponenty/ExportToJSON',
  component: ExportToJSON,
  decorators: [
    (Story) => (
      <ToastProvider>
        <PasswordProvider>
          <Story />
        </PasswordProvider>
      </ToastProvider>
    ),
  ],
} as ComponentMeta<typeof ExportToJSON>;

const Template: ComponentStory<typeof ExportToJSON> = (args) => <ExportToJSON {...args} />;

export const Default = Template.bind({});
Default.args = {};
