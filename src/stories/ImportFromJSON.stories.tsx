import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ImportFromJSON from '../components/ImportFromJSON';
import { PasswordProvider } from '../data/PasswordContext';
import '../index.css';

export default {
  title: 'Komponenty/ImportFromJSON',
  component: ImportFromJSON,
} as ComponentMeta<typeof ImportFromJSON>;

const Template: ComponentStory<typeof ImportFromJSON> = (args) => (
  <PasswordProvider>
    <ImportFromJSON {...args} />
  </PasswordProvider>
);

export const Default = Template.bind({});
Default.args = {};
