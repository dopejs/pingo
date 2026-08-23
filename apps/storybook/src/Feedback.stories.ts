import { createElement, type PingoNode } from "@dopejs/pingo";
import {
  Alert as AlertComponent,
  Avatar as AvatarComponent,
  Badge as BadgeComponent,
  Progress as ProgressComponent,
  Skeleton as SkeletonComponent,
  Toast as ToastComponent,
  ToastViewport,
  createPingoUiStyleSheet,
  setTheme,
  type PingoUiTheme,
  type ToastVariant,
} from "@dopejs/pingo-ui";
import type { Meta, StoryObj } from "@storybook/html-vite";

import { mountStory } from "./mount";

// flexDirection/alignItems/justifyContent are not direct props on the
// container element, so they go through the typed inline `style` channel.
// pingo has no `gap` property; spacing is an explicit fixed-size container
// between siblings.
function row(children: readonly PingoNode[], spacing = 8): PingoNode {
  return createElement("container", {
    style: { flexDirection: "row", alignItems: "center" },
    children: children.flatMap((node, index) =>
      index === 0 ? [node] : [createElement("container", { width: spacing }), node],
    ),
  });
}

function column(children: readonly PingoNode[], spacing = 8): PingoNode {
  return createElement("container", {
    style: { flexDirection: "column" },
    children: children.flatMap((node, index) =>
      index === 0 ? [node] : [createElement("container", { height: spacing }), node],
    ),
  });
}

/** Full-surface, centered container with a theme-aware background. */
function surface(
  theme: PingoUiTheme,
  width: number,
  height: number,
  children: readonly PingoNode[],
): PingoNode {
  return createElement("container", {
    width,
    height,
    padding: 24,
    style: { flexDirection: "column", justifyContent: "center", alignItems: "center" },
    backgroundColor: theme === "dark" ? "#09090bff" : "#ffffffff",
    children,
  });
}

/** Fixed-width wrapper so intrinsic-width components stretch like a real layout. */
function framed(width: number, node: PingoNode): PingoNode {
  return createElement("container", { width, children: node });
}

const meta: Meta = { title: "Feedback" };
export default meta;

// ---- Alert ----

interface AlertArgs {
  theme: PingoUiTheme;
  title: string;
  description: string;
}

export const Alert: StoryObj<AlertArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        surface(args.theme, 520, 210, [
          column(
            [
              framed(
                440,
                createElement(AlertComponent, { title: args.title, children: args.description }),
              ),
              framed(
                440,
                createElement(AlertComponent, {
                  title: "操作失败",
                  variant: "destructive",
                  children: args.description,
                }),
              ),
            ],
            12,
          ),
        ]),
      { width: 520, height: 210, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", title: "提示", description: "你的配置已自动保存。" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    title: { control: "text" },
    description: { control: "text" },
  },
};

// ---- Toast ----

interface ToastArgs {
  theme: PingoUiTheme;
  title: string;
  description: string;
  variant: ToastVariant;
}

export const Toast: StoryObj<ToastArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        createElement("container", {
          width: 480,
          height: 160,
          backgroundColor: args.theme === "dark" ? "#09090bff" : "#ffffffff",
          children: createElement(ToastViewport, {
            children: createElement(ToastComponent, {
              open: true,
              title: args.title,
              ...(args.description === "" ? {} : { description: args.description }),
              variant: args.variant,
            }),
          }),
        }),
      { width: 480, height: 160, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", title: "已保存", description: "配置已写入本地。", variant: "default" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    title: { control: "text" },
    description: { control: "text" },
    variant: { control: "select", options: ["default", "destructive"] },
  },
};

// ---- Progress ----

interface ProgressArgs {
  theme: PingoUiTheme;
  value: number;
  max: number;
}

export const Progress: StoryObj<ProgressArgs> = {
  render: (args) => {
    setTheme(args.theme);
    const bar = (value: number): PingoNode =>
      framed(440, createElement(ProgressComponent, { value, max: args.max }));
    return mountStory(
      () => surface(args.theme, 520, 200, [column([bar(args.value), bar(30), bar(75)], 16)]),
      { width: 520, height: 200, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", value: 60, max: 100 },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    max: { control: { type: "number", min: 1, max: 200, step: 1 } },
  },
};

// ---- Skeleton ----

interface SkeletonArgs {
  theme: PingoUiTheme;
  width: number;
  height: number;
}

export const Skeleton: StoryObj<SkeletonArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        surface(args.theme, 520, 200, [
          column(
            [
              row(
                [
                  createElement(SkeletonComponent, { width: 48, height: 48 }),
                  column(
                    [
                      createElement(SkeletonComponent, { width: 120, height: 14 }),
                      createElement(SkeletonComponent, { width: 200, height: 14 }),
                    ],
                    10,
                  ),
                ],
                12,
              ),
              createElement(SkeletonComponent, { width: args.width, height: args.height }),
              createElement(SkeletonComponent, {
                width: Math.round(args.width * 0.86),
                height: args.height,
              }),
            ],
            14,
          ),
        ]),
      { width: 520, height: 200, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", width: 320, height: 14 },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    width: { control: { type: "range", min: 160, max: 440, step: 10 } },
    height: { control: { type: "range", min: 10, max: 24, step: 2 } },
  },
};

// ---- Badge ----

interface BadgeArgs {
  theme: PingoUiTheme;
  children: string;
}

export const Badge: StoryObj<BadgeArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        surface(args.theme, 520, 120, [
          row([
            createElement(BadgeComponent, { children: args.children }),
            createElement(BadgeComponent, { children: args.children, variant: "secondary" }),
            createElement(BadgeComponent, { children: args.children, variant: "destructive" }),
            createElement(BadgeComponent, { children: args.children, variant: "outline" }),
          ]),
        ]),
      { width: 520, height: 120, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", children: "徽章" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    children: { control: "text" },
  },
};

// ---- Avatar ----

interface AvatarArgs {
  theme: PingoUiTheme;
  fallback: string;
  size: number;
}

export const Avatar: StoryObj<AvatarArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        surface(args.theme, 360, 160, [
          createElement(AvatarComponent, { fallback: args.fallback, size: args.size }),
        ]),
      { width: 360, height: 160, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", fallback: "ZJ", size: 48 },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    fallback: { control: "text" },
    size: { control: { type: "range", min: 24, max: 96, step: 4 } },
  },
};
