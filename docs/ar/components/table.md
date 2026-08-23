---
title: Table
description: جدول بيانات بالتمرير الافتراضي، تعريف الأعمدة يقود الترويسة والصفوف معًا، ويتم الرسم على pingo canvas.
---

# Table

جدول بالتمرير الافتراضي: تعريف الأعمدة يقود الترويسة وكل صف معًا، وتكلفة رسم عشرة آلاف صف تساوي تكلفة رسم شاشة واحدة من الصفوف. المعاينة أدناه تُعرض لحظيًا بواسطة محرك pingo — يمكنك التمرير والنقر على الصفوف، ومتابعة تبديل السمة بين الفاتح والداكن.

:::preview table-basic
:::

## الاستخدام

`Table` هي دالة بناء خالصة وليست مكوّن memo؛ باستدعائها مباشرة تحصل على عقدة المشهد. عند استدعائها داخل نطاق رسم المكوّن (كما في المكوّن الدالّي أدناه)، تشترك قراءة السمة في تبديل سمة الموقع.

```tsx
import { createElement, type PingoNode } from "@dopejs/pingo";
import { Table } from "@dopejs/pingo-ui";

type FileRow = { name: string; size: string };

function FileTable(): PingoNode {
  return Table<FileRow>({
    columns: [
      {
        key: "name",
        header: "الاسم",
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "size",
        header: "الحجم",
        width: 96,
        align: "end",
        cell: (row) => createElement("text", { value: row.size }),
      },
    ],
    rowCount: files.length,
    getRow: (index) => files[index],
    onRowPress: (index) => open(files[index]),
  });
}
```

جسم الجدول هو [VirtualList](/guide/scrolling)، ويحتاج إلى ارتفاع محدد من الحاوية الأب (في المثال الحاوية الخارجية `height: 260`).

## أمثلة

### الحالة الفارغة

عندما يكون `rowCount` مساويًا `0` يُرسم `emptyLabel` (الافتراضي «لا توجد بيانات»)، ولا يُنشأ virtual list.

:::preview table-empty
:::

## Props

### TableProps\<Row\>

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `columns` | `readonly TableColumn<Row>[]` | — | تعريف الأعمدة، يقود الترويسة والصفوف معًا (مطلوب) |
| `rowCount` | `number` | — | العدد الإجمالي للصفوف (مطلوب)؛ عند `0` تُرسم الحالة الفارغة |
| `getRow` | `(index: number) => Row` | — | جلب بيانات الصف حسب رقم الصف، يُستدعى فقط للنافذة المرئية (مطلوب) |
| `estimatedRowHeight` | `number` | `44` | ارتفاع الصف التقديري المستخدم في تخطيط التمرير الافتراضي |
| `onRowPress` | `(index: number) => void` | — | رد نداء النقر على الصف؛ عند تمريره يصبح الصف قابلًا للتركيز |
| `emptyLabel` | `string` | `"لا توجد بيانات"` | نص الحالة الفارغة |
| `renderHeaderCell` | `(column: TableColumn<Row>, index: number) => PingoNode` | — | استبدال خلية ترويسة افتراضية لعمود معين |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوّن |

### TableColumn\<Row\>

| الحقل | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `key` | `string` | — | معرّف العمود المستخدم كمفتاح للعقدة (مطلوب) |
| `header` | `string` | — | نص الترويسة (مطلوب) |
| `width` | `number` | — | عرض ثابت (بالبكسل المنطقي)؛ عند الحذف يُوزَّع العرض المتبقي حسب `flex` |
| `flex` | `number` | `1` | حصة توزيع العرض المتبقي عند عدم تعيين `width` |
| `align` | `"start" \| "center" \| "end"` | `"start"` | المحاذاة الأفقية لمحتوى العمود، مشتركة بين الترويسة والخلايا |
| `cell` | `(row: Row, index: number) => PingoNode` | — | دالة بناء محتوى الخلية (مطلوب) |

لا يمكن للجدول الافتراضي قياس عرض الأعمدة من المحتوى: الصفوف غير المرسومة لا تشارك في القياس، لذلك لا يمكن أن يأتي عرض العمود إلا من تعريف الأعمدة — وهذا ما يجعل الترويسة والصفوف متحاذية طبيعيًا.

## إمكانية الوصول

يحمل الجدول دلالة `table`، والترويسة `columnheader` وكل صف `row`؛ وعند تمرير `onRowPress` يصبح الصف قابلًا للتركيز والتفعيل عبر المؤشر. للمزيد انظر [دليل إمكانية الوصول](/guide/accessibility).
