import React from 'react';
import { Meta, Story } from '@storybook/react';
import { LoginForm } from '../components/login-form';
import { PasswordProvider } from '../data/PasswordContext';
import '../index.css';

export default {
  title: 'Komponenty/LoginForm',
  component: LoginForm,
} as Meta;

const Template: Story = (args) => (
  <PasswordProvider>
    <LoginForm {...args} />
  </PasswordProvider>
);

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
