import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { NavFavorites } from '../components/nav-favorites';
import { PasswordProvider } from '../data/PasswordContext';
import '../index.css';

export default {
  title: 'Komponenty/NavFavorites',
  component: NavFavorites,
} as ComponentMeta<typeof NavFavorites>;

const Template: ComponentStory<typeof NavFavorites> = (args) => (
  <PasswordProvider>
    <NavFavorites {...args} />
  </PasswordProvider>
);

export const Default = Template.bind({});
Default.args = {
  favorites: [
    { name: 'Google', url: 'https://www.google.com', emoji: '🔍' },
    { name: 'Facebook', url: 'https://www.facebook.com', emoji: '📘' },
  ],
};

export const NoFavorites = Template.bind({});
NoFavorites.args = {
  favorites: [],
};
