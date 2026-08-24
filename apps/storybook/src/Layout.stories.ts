import { createElement, type PingoNode } from "@dopejs/pingo";
import * as UI from "@dopejs/pingo-ui";
import type { Meta, StoryObj } from "@storybook/html-vite";

import { frame, frameBox } from "./layout";
import { mountStory } from "./mount";

// Every pingo-ui component is a memo-wrapped object (and Accordion/Tabs/
// Resizable/ScrollArea/AspectRatio/Collapsible/Sidebar additionally use hooks),
// so ALL of them are rendered via createElement(Component, props) — never
// called directly. The namespace import keeps the story exports (Accordion,
// Card, Tabs, ...) from colliding with the component bindings they render.
const meta: Meta = {
  title: "Layout",
};

export default meta;

// Full-surface centered container. pingo's root is transparent, so the stage
// paints the page surface behind dark components instead of the white host.
// flexDirection/justifyContent/alignItems are not CommonProps direct props, so
// they go through the typed inline `style` channel.
function stage(
  theme: UI.PingoUiTheme,
  width: number,
  height: number,
  children: PingoNode,
): PingoNode {
  return createElement("container", {
    width,
    height,
    backgroundColor: theme === "dark" ? "#09090bff" : "#ffffffff",
    style: { flexDirection: "column", justifyContent: "center", alignItems: "center" },
    children,
  });
}

// pingo has no gap property; spacing is a fixed-size container between siblings.
function row(children: readonly PingoNode[], spacing = 8): PingoNode {
  return createElement("container", {
    style: { flexDirection: "row", alignItems: "center" },
    children: children.flatMap((node, index) =>
      index === 0 ? [node] : [createElement("container", { width: spacing }), node],
    ),
  });
}

function pane(label: string, color: string): PingoNode {
  return createElement("container", {
    backgroundColor: color,
    style: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
    children: createElement("text", { value: label, color: "#ffffffff", fontSize: 13 }),
  });
}

// ---- Accordion -------------------------------------------------------------

interface AccordionArgs {
  theme: UI.PingoUiTheme;
  openValue: "intro" | "theme" | "keyboard";
}

export const Accordion: StoryObj<AccordionArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          400,
          340,
          frame(
            360,
            createElement(UI.Accordion, {
              openValue: args.openValue,
              onValueChange: () => {},
              children: [
                createElement(UI.AccordionItem, {
                  value: "intro",
                  title: "什么是 pingo-ui？",
                  children: createElement("text", {
                    value: "与 shadcn/ui 对齐的组件库，渲染在 pingo canvas 引擎之上。",
                  }),
                }),
                createElement(UI.AccordionItem, {
                  value: "theme",
                  title: "支持暗色主题吗？",
                  children: createElement("text", {
                    value: "支持。所有组件跟随站点主题自动切换明暗两套皮肤。",
                  }),
                }),
                createElement(UI.AccordionItem, {
                  value: "keyboard",
                  title: "键盘可以操作吗？",
                  children: createElement("text", {
                    value: "方向键在标题之间移动焦点，Enter 或空格展开与收起。",
                  }),
                }),
              ],
            }),
          ),
        ),
      { width: 400, height: 340, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", openValue: "intro" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    openValue: { control: "select", options: ["intro", "theme", "keyboard"] },
  },
};

// ---- Card ------------------------------------------------------------------

interface CardArgs {
  theme: UI.PingoUiTheme;
  title: string;
  description: string;
}

export const Card: StoryObj<CardArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          400,
          300,
          frame(
            340,
            createElement(UI.Card, {
              children: [
                createElement(UI.CardHeader, {
                  children: [
                    createElement(UI.CardTitle, { children: args.title }),
                    createElement(UI.CardDescription, { children: args.description }),
                  ],
                }),
                createElement(UI.CardContent, {
                  children: createElement("text", {
                    value: "将你的更改同步到所有设备，或仅保存在本地。",
                  }),
                }),
                createElement(UI.CardFooter, {
                  children: row([
                    createElement(UI.Button, { children: "保存", onPress: () => {} }),
                    createElement(UI.Button, {
                      children: "取消",
                      variant: "outline",
                      onPress: () => {},
                    }),
                  ]),
                }),
              ],
            }),
          ),
        ),
      { width: 400, height: 300, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", title: "账户设置", description: "管理你的账户偏好与通知。" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    title: { control: "text" },
    description: { control: "text" },
  },
};

// ---- Tabs ------------------------------------------------------------------

interface TabsArgs {
  theme: UI.PingoUiTheme;
  value: "account" | "password" | "notifications";
}

export const Tabs: StoryObj<TabsArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          400,
          220,
          frame(
            360,
            createElement(UI.Tabs, {
              value: args.value,
              onValueChange: () => {},
              children: [
                createElement(UI.TabsList, {
                  children: [
                    createElement(UI.TabsTrigger, { value: "account", children: "账户" }),
                    createElement(UI.TabsTrigger, { value: "password", children: "密码" }),
                    createElement(UI.TabsTrigger, {
                      value: "notifications",
                      children: "通知",
                    }),
                  ],
                }),
                createElement(UI.TabsContent, {
                  value: "account",
                  children: createElement(UI.Label, { children: "管理你的账户信息与偏好。" }),
                }),
                createElement(UI.TabsContent, {
                  value: "password",
                  children: createElement(UI.Label, { children: "修改你的登录密码。" }),
                }),
                createElement(UI.TabsContent, {
                  value: "notifications",
                  children: createElement(UI.Label, { children: "选择要接收的通知类型。" }),
                }),
              ],
            }),
          ),
        ),
      { width: 400, height: 220, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", value: "account" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    value: { control: "select", options: ["account", "password", "notifications"] },
  },
};

// ---- Divider ---------------------------------------------------------------

interface DividerArgs {
  theme: UI.PingoUiTheme;
  orientation: "horizontal" | "vertical";
}

export const Divider: StoryObj<DividerArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          400,
          160,
          args.orientation === "vertical"
            ? createElement("container", {
                height: 48,
                style: { flexDirection: "row", alignItems: "center" },
                children: [
                  createElement(UI.Label, { children: "首页" }),
                  createElement("container", { width: 16 }),
                  createElement(UI.Divider, { orientation: "vertical" }),
                  createElement("container", { width: 16 }),
                  createElement(UI.Label, { children: "文档" }),
                  createElement("container", { width: 16 }),
                  createElement(UI.Divider, { orientation: "vertical" }),
                  createElement("container", { width: 16 }),
                  createElement(UI.Label, { children: "设置" }),
                ],
              })
            : createElement("container", {
                width: 320,
                style: { flexDirection: "column" },
                children: [
                  createElement(UI.Label, { children: "上方内容" }),
                  createElement("container", { height: 16 }),
                  createElement(UI.Divider, {}),
                  createElement("container", { height: 16 }),
                  createElement(UI.Label, { children: "下方内容" }),
                ],
              }),
        ),
      { width: 400, height: 160, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", orientation: "horizontal" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
};

// ---- Resizable -------------------------------------------------------------

interface ResizableArgs {
  theme: UI.PingoUiTheme;
  direction: "row" | "column";
  split: number;
  disabled: boolean;
}

export const Resizable: StoryObj<ResizableArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          280,
          frameBox(
            420,
            160,
            createElement(UI.Resizable, {
              direction: args.direction,
              split: args.split,
              disabled: args.disabled,
              onSplitChange: () => {},
              first: pane("左侧栏", "#3b82f6ff"),
              second: pane("主内容", "#6366f1ff"),
            }),
          ),
        ),
      { width: 480, height: 280, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", direction: "row", split: 0.4, disabled: false },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    direction: { control: "select", options: ["row", "column"] },
    split: { control: { type: "range", min: 0.1, max: 0.9, step: 0.05 } },
    disabled: { control: "boolean" },
  },
};

// ---- ScrollArea ------------------------------------------------------------

const SCROLL_ITEMS = [
  "收件箱",
  "星标邮件",
  "已发送",
  "草稿",
  "归档",
  "垃圾邮件",
  "已删除",
  "工作",
  "家庭",
  "旅行",
  "收据",
  "订阅",
];

interface ScrollAreaArgs {
  theme: UI.PingoUiTheme;
  hideScrollbar: boolean;
}

export const ScrollArea: StoryObj<ScrollAreaArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          320,
          260,
          frameBox(
            280,
            200,
            createElement(UI.ScrollArea, {
              hideScrollbar: args.hideScrollbar,
              children: SCROLL_ITEMS.map((name) =>
                createElement("container", {
                  padding: 8,
                  children: createElement(UI.Label, { children: name }),
                }),
              ),
            }),
          ),
        ),
      { width: 320, height: 260, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", hideScrollbar: false },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    hideScrollbar: { control: "boolean" },
  },
};

// ---- AspectRatio -----------------------------------------------------------

interface AspectRatioArgs {
  theme: UI.PingoUiTheme;
  ratio: number;
}

export const AspectRatio: StoryObj<AspectRatioArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          400,
          260,
          frame(
            320,
            createElement(UI.AspectRatio, {
              ratio: args.ratio,
              children: createElement("container", {
                backgroundColor: "#3b82f6ff",
                style: {
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                },
                children: createElement("text", {
                  value: "内容",
                  color: "#ffffffff",
                  fontSize: 18,
                }),
              }),
            }),
          ),
        ),
      { width: 400, height: 260, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", ratio: 16 / 9 },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    ratio: { control: { type: "range", min: 0.5, max: 3, step: 0.1 } },
  },
};

// ---- Collapsible -----------------------------------------------------------

interface CollapsibleArgs {
  theme: UI.PingoUiTheme;
  open: boolean;
  disabled: boolean;
  trigger: string;
}

export const Collapsible: StoryObj<CollapsibleArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          400,
          200,
          frame(
            340,
            createElement(UI.Collapsible, {
              trigger: args.trigger,
              open: args.open,
              disabled: args.disabled,
              onOpenChange: () => {},
              children: createElement(UI.Label, {
                children: "这里的设置会应用到当前工作区的所有项目。",
              }),
            }),
          ),
        ),
      { width: 400, height: 200, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", open: true, disabled: false, trigger: "高级选项" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    open: { control: "boolean" },
    disabled: { control: "boolean" },
    trigger: { control: "text" },
  },
};

// ---- Sidebar ---------------------------------------------------------------

interface SidebarArgs {
  theme: UI.PingoUiTheme;
  value: "home" | "stats" | "projects" | "members" | "settings";
}

export const Sidebar: StoryObj<SidebarArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          300,
          340,
          createElement(UI.Sidebar, {
            value: args.value,
            onValueChange: () => {},
            children: [
              createElement(UI.SidebarSection, {
                title: "工作区",
                children: [
                  createElement(UI.SidebarItem, { value: "home", label: "首页" }),
                  createElement(UI.SidebarItem, { value: "stats", label: "统计" }),
                  createElement(UI.SidebarItem, { value: "projects", label: "项目" }),
                ],
              }),
              createElement(UI.SidebarSection, {
                title: "系统",
                children: [
                  createElement(UI.SidebarItem, { value: "members", label: "成员" }),
                  createElement(UI.SidebarItem, { value: "settings", label: "设置" }),
                ],
              }),
            ],
          }),
        ),
      { width: 300, height: 340, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", value: "stats" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    value: {
      control: "select",
      options: ["home", "stats", "projects", "members", "settings"],
    },
  },
};
