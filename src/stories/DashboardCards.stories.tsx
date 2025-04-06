import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import DashboardCards from '../components/DashboardCards';
import { PasswordProvider } from '../data/PasswordContext';
import '../index.css';

export default {
  title: 'Komponenty/DashboardCards',
  component: DashboardCards,
} as ComponentMeta<typeof DashboardCards>;

const Template: ComponentStory<typeof DashboardCards> = (args) => (
  <PasswordProvider>
    <DashboardCards {...args} />
  </PasswordProvider>
);

export const Default = Template.bind({});
Default.args = {};

export const WithPasswords = Template.bind({});
WithPasswords.args = {
  state: {
    history: [
      { platform: 'Twitter', login: 'user123', strength: 80 },
      { platform: 'Facebook', login: 'user456', strength: 70 },
    ],
    passwords: [
      { platform: 'Twitter', login: 'user123' },
      { platform: 'Facebook', login: 'user456' },
    ],
  },
};

export const NoPasswords = Template.bind({});
NoPasswords.args = {
  state: {
    history: [],
    passwords: [],
  },
};
