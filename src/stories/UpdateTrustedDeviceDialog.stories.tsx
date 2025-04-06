import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { UpdateTrustedDeviceDialog, UpdateTrustedDeviceDialogProps } from '../components/UpdateTrustedDeviceDialog';
import { PasswordProvider } from '../data/PasswordContext';
import { toast } from 'react-toastify';
import '../index.css';

export default {
  title: 'Komponenty/UpdateTrustedDeviceDialog',
  component: UpdateTrustedDeviceDialog,
} as ComponentMeta<typeof UpdateTrustedDeviceDialog>;

const Template: ComponentStory<typeof UpdateTrustedDeviceDialog> = (args) => (
  <PasswordProvider>
    <UpdateTrustedDeviceDialog {...args} />
  </PasswordProvider>
);

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  onClose: () => toast('Dialog zamknięty'),
  onUpdate: (deviceName: string) => toast(`Zaktualizowano urządzenie: ${deviceName}`),
} as UpdateTrustedDeviceDialogProps;

export const Closed = Template.bind({});
Closed.args = {
  isOpen: false,
  onClose: () => toast('Dialog zamknięty'),
  onUpdate: (deviceName: string) => toast(`Zaktualizowano urządzenie: ${deviceName}`),
} as UpdateTrustedDeviceDialogProps;
