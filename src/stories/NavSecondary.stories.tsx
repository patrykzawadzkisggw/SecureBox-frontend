import React from "react";
import { Meta, Story } from "@storybook/react";
import { NavSecondary } from "../components/nav-secondary";
import { LucideIcon } from "lucide-react";
import { BrowserRouter as Router } from "react-router-dom";

export default {
  title: "Komponenty/NavSecondary",
  component: NavSecondary,
} as Meta;

const Template: Story<{
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    badge?: React.ReactNode;
  }[];
}> = (args) => (
  <Router>
    <NavSecondary {...args} />
  </Router>
);

export const Default = Template.bind({});
Default.args = {
  items: [
    {
      title: "Strona główna",
      url: "/",
      icon: () => <span>🏠</span>,
    },
    {
      title: "Ustawienia",
      url: "/settings",
      icon: () => <span>⚙️</span>,
      badge: <span>New</span>,
    },
  ],
};

export const WithBadges = Template.bind({});
WithBadges.args = {
  items: [
    {
      title: "Strona główna",
      url: "/",
      icon: () => <span>🏠</span>,
    },
    {
      title: "Ustawienia",
      url: "/settings",
      icon: () => <span>⚙️</span>,
      badge: <span>New</span>,
    },
    {
      title: "Powiadomienia",
      url: "/notifications",
      icon: () => <span>🔔</span>,
      badge: <span>3</span>,
    },
  ],
};
