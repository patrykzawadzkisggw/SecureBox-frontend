import React from 'react';
import { Meta, Story } from '@storybook/react';
import { LoginForm } from '../components/login-form';

export default {
  title: 'Komponenty/LoginForm',
  component: LoginForm,
} as Meta;

const Template: Story = (args) => <LoginForm {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const WithError = Template.bind({});
WithError.args = {
  errorMessage: 'Nieprawidłowy login, hasło lub masterkey',
};

export const Loading = Template.bind({});
Loading.args = {
  isLoading: true,
};
