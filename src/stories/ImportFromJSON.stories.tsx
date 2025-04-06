import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ImportFromJSON from '../components/ImportFromJSON';

export default {
  title: 'Komponenty/ImportFromJSON',
  component: ImportFromJSON,
} as ComponentMeta<typeof ImportFromJSON>;

const Template: ComponentStory<typeof ImportFromJSON> = (args) => <ImportFromJSON {...args} />;

export const Default = Template.bind({});
Default.args = {};
