import { createElement, type PingoNode } from "@dopejs/pingo";
import * as UI from "@dopejs/pingo-ui";
import type { Meta, StoryObj } from "@storybook/html-vite";

import { stateful } from "./layout";
import { mountStory } from "./mount";

// Story export names must equal the component names (Button/Input/...), so the
// components themselves are imported via namespace to avoid identifier clashes.
type PingoUiTheme = UI.PingoUiTheme;
type ButtonVariant = UI.ButtonVariant;
type ButtonSize = UI.ButtonSize;
type IconButtonSize = UI.IconButtonSize;

const THEMES: string[] = ["light", "dark"];

// flexDirection/alignItems are not CommonProps direct props, so they go
// through the typed inline `style` channel (same as the old showcase).
function column(children: PingoNode[]): PingoNode {
  return createElement("container", { style: { flexDirection: "column" }, children });
}

// pingo has no gap property: spacing is a fixed-size container between nodes.
function spacer(height: number): PingoNode {
  return createElement("container", { height });
}

// Every component draws onto its own themed surface so dark mode is visible
// instead of the host div's fixed white background showing through.
function stage(theme: PingoUiTheme, children: PingoNode): PingoNode {
  return createElement("container", {
    width: 480,
    padding: 24,
    backgroundColor: theme === "dark" ? "#09090bff" : "#ffffffff",
    // A container with no style prop is on the direct-prop path, where
    // align-items is flex-start rather than the CSS initial `stretch`: without
    // this a form control shrinks to its own label instead of filling the
    // field, and an anchored panel has no trigger width to match.
    style: { flexDirection: "column" },
    children,
  });
}

const meta: Meta = { title: "Form" };
export default meta;

interface ButtonArgs {
  theme: PingoUiTheme;
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
  label: string;
}
export const Button: StoryObj<ButtonArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.Button, {
            children: args.label,
            variant: args.variant,
            size: args.size,
            disabled: args.disabled,
          }),
        ),
      { width: 480, height: 160, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", variant: "default", size: "default", disabled: false, label: "按钮" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "destructive"],
    },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};

interface IconButtonArgs {
  theme: PingoUiTheme;
  variant: ButtonVariant;
  size: IconButtonSize;
  disabled: boolean;
}
export const IconButton: StoryObj<IconButtonArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.IconButton, {
            // The icon slot accepts any PingoNode; a host text element stands
            // in for a real icon asset here (same as the old showcase).
            icon: createElement("text", { value: "★" }),
            semanticLabel: "收藏",
            variant: args.variant,
            size: args.size,
            disabled: args.disabled,
          }),
        ),
      { width: 480, height: 160, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", variant: "default", size: "default", disabled: false },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "destructive"],
    },
    size: { control: "select", options: ["default", "sm", "lg"] },
    disabled: { control: "boolean" },
  },
};

interface InputArgs {
  theme: PingoUiTheme;
  value: string;
  disabled: boolean;
  readOnly: boolean;
  width: number;
}
export const Input: StoryObj<InputArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.Input, {
            value: args.value,
            disabled: args.disabled,
            readOnly: args.readOnly,
            width: args.width,
            semanticLabel: "输入",
          }),
        ),
      { width: 480, height: 160, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    value: "输入内容",
    disabled: false,
    readOnly: false,
    width: 360,
  },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    value: { control: "text" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    width: { control: { type: "range", min: 160, max: 432, step: 8 } },
  },
};

interface TextAreaArgs {
  theme: PingoUiTheme;
  value: string;
  rows: number;
  disabled: boolean;
}
export const TextArea: StoryObj<TextAreaArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.TextArea, {
            value: args.value,
            rows: args.rows,
            disabled: args.disabled,
            width: 432,
            semanticLabel: "说明",
          }),
        ),
      { width: 480, height: 260, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    value: "多行文本：\n换行与跨行方向键导航都在 Core 内实现。",
    rows: 4,
    disabled: false,
  },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    value: { control: "text" },
    rows: { control: { type: "range", min: 2, max: 8, step: 1 } },
    disabled: { control: "boolean" },
  },
};

interface CheckboxArgs {
  theme: PingoUiTheme;
  checked: boolean;
  disabled: boolean;
  label: string;
}
export const Checkbox: StoryObj<CheckboxArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.Checkbox, {
            defaultChecked: args.checked,
            disabled: args.disabled,
            label: args.label,
          }),
        ),
      { width: 480, height: 140, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", checked: true, disabled: false, label: "已启用通知" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};

interface RadioGroupArgs {
  theme: PingoUiTheme;
  value: "a" | "b" | "c";
  disabled: boolean;
}
export const RadioGroup: StoryObj<RadioGroupArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.RadioGroup, {
            defaultValue: args.value,
            disabled: args.disabled,
            children: column([
              createElement(UI.RadioGroupItem, { value: "a", label: "选项 A" }),
              spacer(8),
              createElement(UI.RadioGroupItem, { value: "b", label: "选项 B" }),
              spacer(8),
              createElement(UI.RadioGroupItem, { value: "c", label: "选项 C" }),
            ]),
          }),
        ),
      { width: 480, height: 220, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", value: "b", disabled: false },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    value: { control: "select", options: ["a", "b", "c"] },
    disabled: { control: "boolean" },
  },
};

interface SwitchArgs {
  theme: PingoUiTheme;
  checked: boolean;
  disabled: boolean;
}
export const Switch: StoryObj<SwitchArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.Switch, {
            defaultChecked: args.checked,
            disabled: args.disabled,
            semanticLabel: "通知开关",
          }),
        ),
      { width: 480, height: 140, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", checked: true, disabled: false },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

interface SelectArgs {
  theme: PingoUiTheme;
  value: "甲" | "乙" | "丙";
  defaultOpen: boolean;
  placeholder: string;
}
export const Select: StoryObj<SelectArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.Select, {
            defaultOpen: args.defaultOpen,
            defaultValue: args.value,
            children: [
              createElement(UI.SelectTrigger, { placeholder: args.placeholder }),
              createElement(UI.SelectContent, {
                children: [
                  createElement(UI.SelectItem, { value: "甲", children: "甲" }),
                  createElement(UI.SelectItem, { value: "乙", children: "乙" }),
                  createElement(UI.SelectItem, { value: "丙", children: "丙" }),
                ],
              }),
            ],
          }),
        ),
      { width: 480, height: 280, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", value: "乙", defaultOpen: true, placeholder: "选择一项" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    value: { control: "select", options: ["甲", "乙", "丙"] },
    defaultOpen: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

interface SliderArgs {
  theme: PingoUiTheme;
  value: number;
  disabled: boolean;
}
export const Slider: StoryObj<SliderArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.Slider, {
            defaultValue: args.value,
            disabled: args.disabled,
            semanticLabel: "音量",
          }),
        ),
      { width: 480, height: 140, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", value: 40, disabled: false },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    disabled: { control: "boolean" },
  },
};

interface FormArgs {
  theme: PingoUiTheme;
  label: string;
  required: boolean;
  error: string;
  description: string;
}
export const Form: StoryObj<FormArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.Form, {
            children: createElement(UI.FormField, {
              label: args.label,
              required: args.required,
              ...(args.error === "" ? {} : { error: args.error }),
              ...(args.description === "" ? {} : { description: args.description }),
              children: createElement(UI.Input, { value: "example@domain.com", width: 360 }),
            }),
          }),
        ),
      { width: 480, height: 220, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    label: "邮箱",
    required: true,
    error: "",
    description: "用于登录与通知的邮箱地址",
  },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    label: { control: "text" },
    required: { control: "boolean" },
    error: { control: "text" },
    description: { control: "text" },
  },
};
interface InputOTPArgs {
  theme: PingoUiTheme;
  value: string;
  length: number;
  disabled: boolean;
}
export const InputOTP: StoryObj<InputOTPArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.InputOTP, {
            defaultValue: args.value,
            length: args.length,
            disabled: args.disabled,
            semanticLabel: "验证码",
          }),
        ),
      { width: 480, height: 160, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", value: "123456", length: 6, disabled: false },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    value: { control: "text" },
    length: { control: { type: "range", min: 4, max: 6, step: 1 } },
    disabled: { control: "boolean" },
  },
};

interface LabelArgs {
  theme: PingoUiTheme;
  children: string;
}
export const Label: StoryObj<LabelArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () => stage(args.theme, createElement(UI.Label, { children: args.children })),
      { width: 480, height: 120, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", children: "表单标签" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    children: { control: "text" },
  },
};

interface DatePickerArgs {
  theme: PingoUiTheme;
  placeholder: string;
}
export const DatePicker: StoryObj<DatePickerArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          // DatePicker opens and pages on its own, but the chosen date is
          // controlled: without somewhere to put it, pressing a day did
          // nothing at all.
          stateful({ year: 2026, month: 8, day: 22 }, (value, set) =>
            createElement(UI.DatePicker, {
              placeholder: args.placeholder,
              value,
              onSelect: set,
            }),
          ),
        ),
      { width: 480, height: 420, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", placeholder: "选择日期" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    placeholder: { control: "text" },
  },
};

interface ComboboxArgs {
  theme: PingoUiTheme;
  value: "next" | "remix" | "astro";
  defaultOpen: boolean;
  placeholder: string;
}
export const Combobox: StoryObj<ComboboxArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.Combobox, {
            items: [
              { value: "next", label: "Next.js" },
              { value: "remix", label: "Remix" },
              { value: "astro", label: "Astro" },
            ],
            defaultValue: args.value,
            defaultOpen: args.defaultOpen,
            placeholder: args.placeholder,
          }),
        ),
      { width: 480, height: 280, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", value: "next", defaultOpen: true, placeholder: "选择框架" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    value: { control: "select", options: ["next", "remix", "astro"] },
    defaultOpen: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

interface ToggleArgs {
  theme: PingoUiTheme;
  pressed: boolean;
  disabled: boolean;
  label: string;
}
export const Toggle: StoryObj<ToggleArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.Toggle, {
            children: args.label,
            defaultPressed: args.pressed,
            disabled: args.disabled,
          }),
        ),
      { width: 480, height: 140, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", pressed: true, disabled: false, label: "加粗" },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};

interface ToggleGroupArgs {
  theme: PingoUiTheme;
  type: "single" | "multiple";
  rightDisabled: boolean;
}
export const ToggleGroup: StoryObj<ToggleGroupArgs> = {
  render: (args) => {
    UI.setTheme(args.theme);
    return mountStory(
      () =>
        stage(
          args.theme,
          createElement(UI.ToggleGroup, {
            type: args.type,
            defaultValue: args.type === "single" ? ["center"] : ["left", "center"],
            children: [
              createElement(UI.ToggleGroupItem, { value: "left", children: "左" }),
              createElement(UI.ToggleGroupItem, { value: "center", children: "中" }),
              createElement(UI.ToggleGroupItem, {
                value: "right",
                children: "右",
                disabled: args.rightDisabled,
              }),
            ],
          }),
        ),
      { width: 480, height: 160, styleSheets: [UI.createPingoUiStyleSheet()] },
    );
  },
  args: { theme: "light", type: "single", rightDisabled: false },
  argTypes: {
    theme: { control: "radio", options: THEMES },
    type: { control: "select", options: ["single", "multiple"] },
    rightDisabled: { control: "boolean" },
  },
};
