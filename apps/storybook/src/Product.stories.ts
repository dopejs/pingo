import { createElement, type PingoNode } from "@dopejs/pingo";
import {
  Avatar,
  Badge,
  Button,
  ListRow as ListRowComponent,
  StatCard as StatCardComponent,
  TopBar as TopBarComponent,
  createPingoUiStyleSheet,
  setTheme,
  type PingoUiTheme,
  type StatTrend,
} from "@dopejs/pingo-ui";
import type { Meta, StoryObj } from "@storybook/html-vite";

import { mountStory } from "./mount";

// pingo has no gap property, so a multi-child slot (TopBar actions) is spaced
// with fixed-width containers between the children, matching the demos.
function row(children: PingoNode[]): PingoNode {
  return createElement("container", {
    style: { flexDirection: "row", alignItems: "center" },
    children: children.flatMap((node, index) =>
      index === 0 ? [node] : [createElement("container", { width: 8 }), node],
    ),
  });
}

const meta: Meta = { title: "Product" };
export default meta;

interface ListRowArgs {
  theme: PingoUiTheme;
  title: string;
  description: string;
  selected: boolean;
  disabled: boolean;
}

export const ListRow: StoryObj<ListRowArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        createElement(ListRowComponent, {
          title: args.title,
          ...(args.description === "" ? {} : { description: args.description }),
          leading: createElement(Avatar, { fallback: "张", size: 32 }),
          trailing: createElement(Badge, { children: "管理员" }),
          selected: args.selected,
          disabled: args.disabled,
          onPress: () => {},
        }),
      { width: 480, height: 160, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    title: "张三",
    description: "zhangsan@example.com",
    selected: false,
    disabled: false,
  },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    title: { control: "text" },
    description: { control: "text" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

interface StatCardArgs {
  theme: PingoUiTheme;
  label: string;
  value: string;
  delta: string;
  trend: StatTrend;
}

export const StatCard: StoryObj<StatCardArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        createElement(StatCardComponent, {
          label: args.label,
          value: args.value,
          trend: args.trend,
          ...(args.delta === "" ? {} : { delta: args.delta }),
        }),
      { width: 480, height: 160, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    label: "本月营收",
    value: "¥128,400",
    delta: "+12.5%",
    trend: "up",
  },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    label: { control: "text" },
    value: { control: "text" },
    delta: { control: "text" },
    trend: { control: "select", options: ["up", "down", "flat"] },
  },
};

interface TopBarArgs {
  theme: PingoUiTheme;
  title: string;
  showLeading: boolean;
  showActions: boolean;
}

export const TopBar: StoryObj<TopBarArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        createElement(TopBarComponent, {
          title: args.title,
          ...(args.showLeading
            ? { leading: createElement(Avatar, { fallback: "P", size: 28 }) }
            : {}),
          ...(args.showActions
            ? {
                actions: row([
                  createElement(Button, {
                    children: "新建",
                    variant: "outline",
                    size: "sm",
                    onPress: () => {},
                  }),
                  createElement(Avatar, { fallback: "ZJ", size: 32 }),
                ]),
              }
            : {}),
        }),
      { width: 480, height: 160, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    title: "仪表盘",
    showLeading: true,
    showActions: true,
  },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    title: { control: "text" },
    showLeading: { control: "boolean" },
    showActions: { control: "boolean" },
  },
};
