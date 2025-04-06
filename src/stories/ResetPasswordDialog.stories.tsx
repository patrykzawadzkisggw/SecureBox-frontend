import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import { ResetPasswordDialog, ResetPasswordDialogProps } from "../components/ResetPasswordDialog";
import { PasswordProvider } from "../data/PasswordContext";
import "../index.css";

export default {
  title: "Komponenty/ResetPasswordDialog",
  component: ResetPasswordDialog,
  argTypes: {
    isOpen: { control: "boolean" },
    onClose: { action: "zamknięcie" },
  },
} as Meta;

const Template: Story<ResetPasswordDialogProps> = (args) => {
  const [isOpen, setIsOpen] = useState(args.isOpen);

  const handleClose = () => {
    setIsOpen(false);
    args.onClose();
  };

  return (
    <PasswordProvider>
      <ResetPasswordDialog {...args} isOpen={isOpen} onClose={handleClose} />
    </PasswordProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
};

export const Closed = Template.bind({});
Closed.args = {
  isOpen: false,
};
