import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { NavMain } from '../components/nav-main';
import { Home, Settings, User } from 'lucide-react';

export default {
  title: 'Komponenty/NavMain',
  component: NavMain,
} as ComponentMeta<typeof NavMain>;

const Template: ComponentStory<typeof NavMain> = (args) => <NavMain {...args} />;

export const Default = Template.bind({});
Default.args = {
  items: [
    { title: 'Strona główna', url: '/home', icon: Home },
    { title: 'Ustawienia', url: '/settings', icon: Settings },
    { title: 'Profil', url: '/profile', icon: User },
  ],
};

export const ActiveHome = Template.bind({});
ActiveHome.args = {
  items: [
    { title: 'Strona główna', url: '/home', icon: Home },
    { title: 'Ustawienia', url: '/settings', icon: Settings },
    { title: 'Profil', url: '/profile', icon: User },
  ],
  initialPath: '/home',
};

export const ActiveSettings = Template.bind({});
ActiveSettings.args = {
  items: [
    { title: 'Strona główna', url: '/home', icon: Home },
    { title: 'Ustawienia', url: '/settings', icon: Settings },
    { title: 'Profil', url: '/profile', icon: User },
  ],
  initialPath: '/settings',
};
