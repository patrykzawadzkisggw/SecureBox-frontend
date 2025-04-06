import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { AppSidebar } from '../components/app-sidebar';
import { PasswordProvider } from '../data/PasswordContext';
import '../index.css';

export default {
  title: 'Komponenty/AppSidebar',
  component: AppSidebar,
} as ComponentMeta<typeof AppSidebar>;

const Template: ComponentStory<typeof AppSidebar> = (args) => (
  <PasswordProvider>
    <AppSidebar {...args} />
  </PasswordProvider>
);

export const Default = Template.bind({});
Default.args = {};

export const WithUser = Template.bind({});
WithUser.args = {
  state: {
    currentUser: {
      first_name: 'Jan',
      last_name: 'Kowalski',
    },
  },
};

export const NoUser = Template.bind({});
NoUser.args = {
  state: {
    currentUser: null,
  },
};
