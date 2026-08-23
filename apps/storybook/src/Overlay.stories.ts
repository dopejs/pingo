import { createElement, type PingoNode } from "@dopejs/pingo";
import * as UI from "@dopejs/pingo-ui";
import type { Meta, StoryObj } from "@storybook/html-vite";

import { mountStory } from "./mount";

// Story export names must equal the component names (Dialog/AlertDialog/...),
// so the components themselves are imported via namespace to avoid identifier
// clashes. Every component is a memo-wrapped object, so ALL of them are
// rendered via createElement(Component, props) — never called directly.
type PingoUiTheme = UI.PingoUiTheme;

const THEMES: string[] = ["light", "dark"];

// pingo has no `gap` property, so spacing is an explicit fixed-size container
// between siblings; flexDirection/alignItems go through the inline `style`
// channel. These mirror the site's preview layout helpers.
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

/**
 * Full-surface container with a theme-matched background. `center` keeps the
 * trigger in the middle for anchored overlays; modal overlays fill their own
 * parent, so they skip centering.
 */
function stage(
  theme: PingoUiTheme,
  width: number,
  height: number,
  children: PingoNode,
  center = false,
): PingoNode {
  const background = theme === "dark" ? "#09090bff" : "#ffffffff";
  if (center) {
    return createElement("container", {
      width,
      height,
      backgroundColor: background,
      style: { flexDirection: "column", justifyContent: "center", alignItems: "center" },
      children,
    });
  }
  return createElement("container", { width, height, backgroundColor: background, children });
}

const meta: Meta = { title: "Overlay" };
export default meta;

interface DialogArgs {
  theme: PingoUiTheme;
  title: string;
  description: string;
}
export const Dialog: StoryObj<DialogArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          320,
          createElement(UI.Dialog, {
            open: true,
            onOpenChange: () => {},
            children: column(
              [
                createElement(UI.DialogHeader, {
                  children: column([
                    createElement(UI.DialogTitle, { children: args.title }),
                    createElement(UI.DialogDescription, { children: args.description }),
                  ]),
                }),
                createElement("text", { value: "对话框内容放在这里。" }),
                createElement(UI.DialogFooter, {
                  children: row([
                    createElement(UI.Button, {
                      children: "取消",
                      variant: "outline",
                      onPress: () => {},
                    }),
                    createElement(UI.Button, { children: "保存", onPress: () => {} }),
                  ]),
                }),
              ],
              12,
            ),
          }),
        ),
      { width: 480, height: 320, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", title: "编辑资料", description: "修改会立即同步到你的公开资料。" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    title: { control: "text" },
    description: { control: "text" },
  },
};

interface AlertDialogArgs {
  theme: PingoUiTheme;
  title: string;
  description: string;
  destructive: boolean;
  cancelLabel: string;
  actionLabel: string;
}
export const AlertDialog: StoryObj<AlertDialogArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          300,
          createElement(UI.AlertDialog, {
            open: true,
            onOpenChange: () => {},
            title: args.title,
            description: args.description,
            cancelLabel: args.cancelLabel,
            actionLabel: args.actionLabel,
            destructive: args.destructive,
            children: null,
          }),
        ),
      { width: 480, height: 300, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    title: "确认退出？",
    description: "未保存的修改将会丢失。",
    destructive: true,
    cancelLabel: "取消",
    actionLabel: "退出",
  },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    title: { control: "text" },
    description: { control: "text" },
    destructive: { control: "boolean" },
    cancelLabel: { control: "text" },
    actionLabel: { control: "text" },
  },
};

interface DrawerArgs {
  theme: PingoUiTheme;
  side: "top" | "bottom";
  title: string;
}
export const Drawer: StoryObj<DrawerArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          320,
          createElement(UI.Drawer, {
            open: true,
            side: args.side,
            onOpenChange: () => {},
            children: column(
              [
                createElement(UI.DialogHeader, {
                  children: column([
                    createElement(UI.DialogTitle, { children: args.title }),
                    createElement(UI.DialogDescription, {
                      children: "选择一个目标位置。",
                    }),
                  ]),
                }),
                createElement(UI.Button, { children: "完成", onPress: () => {} }),
              ],
              12,
            ),
          }),
        ),
      { width: 480, height: 320, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", side: "bottom", title: "移动到哪里？" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    side: { control: "select", options: ["top", "bottom"] },
    title: { control: "text" },
  },
};

interface SheetArgs {
  theme: PingoUiTheme;
  side: "left" | "right" | "top" | "bottom";
  title: string;
}
export const Sheet: StoryObj<SheetArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          320,
          createElement(UI.Sheet, {
            open: true,
            side: args.side,
            onOpenChange: () => {},
            children: column(
              [
                createElement(UI.DialogHeader, {
                  children: column([
                    createElement(UI.DialogTitle, { children: args.title }),
                    createElement(UI.DialogDescription, {
                      children: "按条件缩小结果范围。",
                    }),
                  ]),
                }),
                createElement(UI.Button, { children: "应用", onPress: () => {} }),
              ],
              12,
            ),
          }),
        ),
      { width: 480, height: 320, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", side: "right", title: "筛选" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    side: { control: "select", options: ["left", "right", "top", "bottom"] },
    title: { control: "text" },
  },
};

interface PopoverArgs {
  theme: PingoUiTheme;
  open: boolean;
  content: string;
}
export const Popover: StoryObj<PopoverArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          240,
          createElement(UI.Popover, {
            open: args.open,
            onOpenChange: () => {},
            children: [
              createElement(UI.PopoverTrigger, {
                children: createElement(UI.Button, {
                  children: "打开浮层",
                  variant: "outline",
                  onPress: () => {},
                }),
              }),
              createElement(UI.PopoverContent, {
                children: createElement("text", { value: args.content }),
              }),
            ],
          }),
          true,
        ),
      { width: 480, height: 240, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", open: true, content: "锚定在触发器下方。" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    open: { control: "boolean" },
    content: { control: "text" },
  },
};

interface TooltipArgs {
  theme: PingoUiTheme;
  content: string;
}
export const Tooltip: StoryObj<TooltipArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          200,
          createElement(UI.Tooltip, {
            content: args.content,
            children: createElement(UI.Button, {
              children: "悬停我",
              variant: "ghost",
              onPress: () => {},
            }),
          }),
          true,
        ),
      { width: 480, height: 200, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", content: "这是一段说明文字。" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    content: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        story: "浮层仅在指针进入触发器时显示；悬停按钮可预览提示文案。",
      },
    },
  },
};

interface HoverCardArgs {
  theme: PingoUiTheme;
  open: boolean;
  openDelayMs: number;
  closeDelayMs: number;
}
export const HoverCard: StoryObj<HoverCardArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          260,
          createElement(UI.HoverCard, {
            open: args.open,
            onOpenChange: () => {},
            openDelayMs: args.openDelayMs,
            closeDelayMs: args.closeDelayMs,
            children: createElement(UI.Button, {
              children: "@pingo",
              variant: "ghost",
              onPress: () => {},
            }),
            content: column([
              createElement("text", { value: "pingo" }),
              createElement("text", { value: "Canvas 渲染引擎与 UI 组件库。" }),
            ]),
          }),
          true,
        ),
      { width: 480, height: 260, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", open: true, openDelayMs: 300, closeDelayMs: 200 },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    open: { control: "boolean" },
    openDelayMs: { control: { type: "range", min: 0, max: 1000, step: 50 } },
    closeDelayMs: { control: { type: "range", min: 0, max: 1000, step: 50 } },
  },
};

interface ContextMenuArgs {
  theme: PingoUiTheme;
}
export const ContextMenu: StoryObj<ContextMenuArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          200,
          createElement(UI.ContextMenu, {
            items: [
              { value: "copy", label: "复制" },
              { value: "paste", label: "粘贴", disabled: true },
              { value: "delete", label: "删除" },
            ],
            onSelect: () => {},
            children: createElement("container", {
              padding: 24,
              children: createElement("text", { value: "在此右键打开菜单" }),
            }),
          }),
        ),
      { width: 480, height: 200, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
  },
  parameters: {
    docs: {
      description: {
        story: "菜单由右键触发（无受控 open 属性）；在画布内右键即可看到菜单。",
      },
    },
  },
};

interface DropdownMenuArgs {
  theme: PingoUiTheme;
  defaultOpen: boolean;
}
export const DropdownMenu: StoryObj<DropdownMenuArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          260,
          createElement(UI.DropdownMenu, {
            defaultOpen: args.defaultOpen,
            onValueChange: () => {},
            children: [
              createElement(UI.DropdownMenuTrigger, {
                children: createElement(UI.Button, {
                  children: "打开菜单",
                  variant: "outline",
                  onPress: () => {},
                }),
              }),
              createElement(UI.DropdownMenuContent, {
                children: [
                  createElement(UI.DropdownMenuItem, { value: "profile", children: "个人资料" }),
                  createElement(UI.DropdownMenuItem, { value: "billing", children: "账单" }),
                  createElement(UI.DropdownMenuItem, { value: "settings", children: "设置" }),
                ],
              }),
            ],
          }),
          true,
        ),
      { width: 480, height: 260, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", defaultOpen: true },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    defaultOpen: { control: "boolean" },
  },
};

interface MenubarArgs {
  theme: PingoUiTheme;
  value: string;
}
export const Menubar: StoryObj<MenubarArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          220,
          createElement(UI.Menubar, {
            value: args.value,
            onValueChange: () => {},
            children: [
              createElement(UI.MenubarMenu, {
                value: "file",
                label: "文件",
                children: column([
                  createElement("text", { value: "新建" }),
                  createElement("text", { value: "打开…" }),
                  createElement("text", { value: "保存" }),
                ]),
              }),
              createElement(UI.MenubarMenu, {
                value: "edit",
                label: "编辑",
                children: createElement("text", { value: "撤销" }),
              }),
              createElement(UI.MenubarMenu, {
                value: "view",
                label: "视图",
                children: createElement("text", { value: "缩放" }),
              }),
            ],
          }),
        ),
      { width: 480, height: 220, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", value: "file" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    value: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        story: "value 控制当前展开的菜单（file / edit / view）；留空则收起全部。",
      },
    },
  },
};

interface NavigationMenuArgs {
  theme: PingoUiTheme;
  value: string;
}
export const NavigationMenu: StoryObj<NavigationMenuArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          220,
          createElement(UI.NavigationMenu, {
            value: args.value,
            onValueChange: () => {},
            children: [
              createElement(UI.MenubarMenu, {
                value: "products",
                label: "产品",
                children: column([
                  createElement("text", { value: "渲染引擎" }),
                  createElement("text", { value: "组件库" }),
                ]),
              }),
              createElement(UI.MenubarMenu, {
                value: "docs",
                label: "文档",
                children: column([
                  createElement("text", { value: "快速开始" }),
                  createElement("text", { value: "API 参考" }),
                ]),
              }),
              createElement(UI.MenubarMenu, {
                value: "community",
                label: "社区",
                children: createElement("text", { value: "讨论区" }),
              }),
            ],
          }),
        ),
      { width: 480, height: 220, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", value: "docs" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    value: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        story: "value 控制当前展开的菜单（products / docs / community）；留空则收起全部。",
      },
    },
  },
};

interface CommandArgs {
  theme: PingoUiTheme;
  placeholder: string;
  emptyLabel: string;
}
export const Command: StoryObj<CommandArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          480,
          300,
          createElement(UI.Command, {
            items: [
              { value: "open", label: "打开文件" },
              { value: "save", label: "保存文件" },
              { value: "share", label: "分享链接" },
              { value: "quit", label: "退出" },
            ],
            onSelect: () => {},
            placeholder: args.placeholder,
            emptyLabel: args.emptyLabel,
          }),
        ),
      { width: 480, height: 300, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", placeholder: "输入命令…", emptyLabel: "无匹配结果" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    placeholder: { control: "text" },
    emptyLabel: { control: "text" },
  },
};
