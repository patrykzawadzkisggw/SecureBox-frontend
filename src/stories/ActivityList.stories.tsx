import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ActivityList from '../components/ActivityList';

export default {
  title: 'Komponenty/ActivityList',
  component: ActivityList,
} as ComponentMeta<typeof ActivityList>;

const Template: ComponentStory<typeof ActivityList> = (args) => <ActivityList {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const WithActivities = Template.bind({});
WithActivities.args = {
  activities: [
    {
      time: '10:15',
      date: 'Dziś',
      name: 'Twitter',
      email: 'user123',
      color: 'bg-purple-500',
    },
    {
      time: '12:30',
      date: 'Wczoraj',
      name: 'Facebook',
      email: 'user456',
      color: 'bg-blue-500',
    },
  ],
};

export const NoActivities = Template.bind({});
NoActivities.args = {
  activities: [],
};
