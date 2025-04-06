import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Chart, ChartProps } from '../components/Chart';

export default {
  title: 'Komponenty/Chart',
  component: Chart,
} as Meta;

const Template: Story<ChartProps> = (args) => <Chart {...args} />;

export const Default = Template.bind({});
Default.args = {
  data: [
    { date: '2021-01-01', value: 10 },
    { date: '2021-01-02', value: 20 },
    { date: '2021-01-03', value: 30 },
  ],
};

export const WithCustomColors = Template.bind({});
WithCustomColors.args = {
  data: [
    { date: '2021-01-01', value: 10 },
    { date: '2021-01-02', value: 20 },
    { date: '2021-01-03', value: 30 },
  ],
  colors: ['#ff0000', '#00ff00', '#0000ff'],
};

export const EmptyData = Template.bind({});
EmptyData.args = {
  data: [],
};
