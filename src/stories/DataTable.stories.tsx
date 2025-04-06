import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { DataTable } from '../components/DataTable';

export default {
  title: 'Komponenty/DataTable',
  component: DataTable,
} as ComponentMeta<typeof DataTable>;

const Template: ComponentStory<typeof DataTable> = (args) => <DataTable {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const WithData = Template.bind({});
WithData.args = {
  state: {
    passwords: [
      {
        platform: 'Twitter',
        login: 'user123',
        passwordfile: 'encryptedPassword1',
      },
      {
        platform: 'Facebook',
        login: 'user456',
        passwordfile: 'encryptedPassword2',
      },
    ],
    loading: false,
  },
};

export const Loading = Template.bind({});
Loading.args = {
  state: {
    passwords: [],
    loading: true,
  },
};

export const NoData = Template.bind({});
NoData.args = {
  state: {
    passwords: [],
    loading: false,
  },
};
