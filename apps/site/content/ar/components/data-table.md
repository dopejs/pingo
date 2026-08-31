---
title: جدول البيانات
description: جدول بتمرير افتراضي مع رؤوس قابلة للفرز، يُبلَّغ الترتيب على شكل نداء رجعي، ويتم العرض/الرسم على لوحة pingo.
---

# جدول البيانات

يضيف فوق [الجدول](/components/table) رؤوسًا قابلة للفرز. الفرز **يُبلَّغ ولا يُنفَّذ**: يُخبر المكوّن بحالة الفرز الجديدة عبر `onSortChange`، وتقوم أنت بإعادة ترتيب مصدر بيانات `getRow` — ففي الجداول الافتراضية تكون بيانات الصفوف غالبًا على الخادم أو في المخزن، ولن يقوم المكوّن بتجسيد كل الصفوف من أجل الفرز. المعاينة أدناه تُعرض/تُرسم مباشرةً بواسطة محرك pingo: انقر على رؤوس «الأعضاء» و«الإرسالات» و«آخر نشاط» للتنقل بين تصاعدي ← تنازلي ← إلغاء، وتتبع سمة الموقع للتبديل بين الفاتح والداكن.

:::preview data-table-sortable
:::

## الاستخدام

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { DataTable, type SortState } from "@dopejs/pingo-ui";

function MemberTable(): PingoNode {
  const sort = useSignal<SortState | undefined>(undefined);
  const current = sort.get();
  const rows = sortMembers(members, current); // أعد ترتيب مصدر البيانات بنفسك
  return DataTable<Member>({
    columns: [
      {
        key: "name",
        header: "الأعضاء",
        sortable: true,
        cell: (row) => <text value={row.name} />,
      },
      {
        key: "commits",
        header: "الإرسالات",
        width: 80,
        align: "end",
        sortable: true,
        cell: (row) => <text value={String(row.commits)} />,
      },
    ],
    sort: current,
    onSortChange: (next) => sort.set(next),
    rowCount: rows.length,
    getRow: (index) => rows[index],
  });
}
```

النقر على عمود مُفرَز يتنقل حسب الدورة تصاعدي ← تنازلي ← إلغاء (قاعدة `nextSort`)؛ سبب وجود الحالة الثالثة هو أن المستخدم الذي ضغط الفرز عن طريق الخطأ يحتاج سبيلًا للعودة إلى الترتيب الأصلي للبيانات. كما هو الحال مع Table، فإن جسم الجدول قائمة افتراضية، ويجب إعطاء الحاوية الأم ارتفاعًا.

## الخصائص

### DataTableProps\<Row\>

يرث جميع حقول `TableProps<Row>` (مع استبدال `columns` بالنسخة القابلة للفرز):

| Prop                 | النوع                                    | القيمة الافتراضية  | الوصف                                                                                             |
| -------------------- | ---------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------- |
| `columns`            | `readonly DataTableColumn<Row>[]`        | —                  | تعريف الأعمدة (إلزامي)، يزيد عن `TableColumn` بحقل `sortable`                                     |
| `sort`               | `SortState`                              | —                  | حالة الفرز الحالية؛ حذفه يعني عدم وجود فرز                                                        |
| `onSortChange`       | `(sort: SortState \| undefined) => void` | —                  | نداء رجعي عند تغير الفرز؛ `undefined` يعني إلغاء الفرز. عند عدم تمريره لا يكون الرأس قابلاً للنقر |
| `rowCount`           | `number`                                 | —                  | إجمالي عدد الصفوف (إلزامي)                                                                        |
| `getRow`             | `(index: number) => Row`                 | —                  | جلب بيانات الصف برقم الصف (إلزامي)                                                                |
| `estimatedRowHeight` | `number`                                 | `44`               | ارتفاع الصف التقديري                                                                              |
| `onRowPress`         | `(index: number) => void`                | —                  | نداء رجعي عند النقر على الصف                                                                      |
| `emptyLabel`         | `string`                                 | `"لا توجد بيانات"` | نص حالة الفراغ                                                                                    |
| `renderHeaderCell`   | `(column, index) => PingoNode`           | —                  | موجود في النوع، لكن المكوّن يستخدمه داخليًا لتنفيذ الرأس القابل للفرز، وأي تمرير له سيُستبدل      |
| `className`          | `string`                                 | —                  | يُضاف بعد اسم فئة المكوّن                                                                         |

### DataTableColumn\<Row\>

امتداد لـ `TableColumn<Row>`، ويضيف:

| الحقل      | النوع     | القيمة الافتراضية | الوصف                          |
| ---------- | --------- | ----------------- | ------------------------------ |
| `sortable` | `boolean` | `false`           | هل رأس العمود قابل للنقر للفرز |

### SortState

| الحقل       | النوع                         | الوصف                   |
| ----------- | ----------------------------- | ----------------------- |
| `key`       | `string`                      | مفتاح `key` لعمود الفرز |
| `direction` | `"ascending" \| "descending"` | اتجاه الفرز             |

يحمل رأس العمود المُفرَز حاليًا مؤشر `▲` / `▼`.

## إمكانية الوصول

تمتلك خلايا الرأس دلالات `columnheader`؛ وتُعرض حالة فرز العمود القابل للفرز (`ascending` / `descending` / `none`) للتقنيات المساعدة عبر القيمة الدلالية، ويُركَّز على الرأس قبل النقر. للمزيد راجع [دليل إمكانية الوصول](/guide/accessibility).
