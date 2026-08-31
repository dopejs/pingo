---
title: Formular
description: Formularcontainer und Feld-Wrapper, zuständig für Layout, Semantik und Fehler-/Beschreibungstextpositionen, gerendert auf dem Pingo-Canvas.
---

# Formular

`Form` ist der Formularcontainer, `FormField` setzt Label, Steuerelement und Fehler-/Beschreibungstext zu einem Feld zusammen. Die folgende Vorschau wird von der Pingo-Engine in Echtzeit gerendert – die Eingabefelder im Feld sind tatsächlich editierbar und folgen dem Hell-/Dunkel-Themenwechsel der Website.

:::preview form-basic
:::

## Verwendung

```tsx
import { Form, FormField, Input } from "@dopejs/pingo-ui";

root.render(
  <Form>
    <FormField label="E-Mail" required error={emailError}>
      <Input semanticLabel="E-Mail" onValueChange={(value) => validate(value)} />
    </FormField>
  </Form>,
);
```

Die Validierung liegt nicht in der Komponente: Wann validiert wird, welcher Fehler gemeldet wird und wie die Kombination aussieht, sind Produktentscheidungen. Der Aufrufer hält die Regeln und übergibt `error`; die Komponente ist nur für Layout, Semantik und Textpositionen zuständig.

## Beispiele

### Fehler und Beschreibung

Wenn `error` vorhanden ist, wird das Feld als ungültig markiert und der Beschreibungstext wird **ersetzt** – wenn eine von zwei Hinweiszeilen eine Fehlermeldung ist, würde die andere sie überdecken. `required` fügt nach dem Label ein `*` an.

## Props

### Form

| Prop        | Typ         | Standardwert | Beschreibung                                    |
| ----------- | ----------- | ------------ | ----------------------------------------------- |
| `children`  | `PingoNode` | —            | Formularinhalt (erforderlich)                   |
| `className` | `string`    | —            | Wird nach dem Komponentenklassennamen angehängt |

### FormField

| Prop          | Typ         | Standardwert | Beschreibung                                                                                    |
| ------------- | ----------- | ------------ | ----------------------------------------------------------------------------------------------- |
| `label`       | `string`    | —            | Feldlabel (erforderlich)                                                                        |
| `children`    | `PingoNode` | —            | Feldsteuerelement (erforderlich)                                                                |
| `error`       | `string`    | —            | Fehlermeldung; wenn vorhanden, wird das Feld als ungültig markiert und die Beschreibung ersetzt |
| `description` | `string`    | —            | Unterstützender Beschreibungstext                                                               |
| `required`    | `boolean`   | `false`      | Pflichtmarkierung, fügt nach dem Label `*` an                                                   |
| `className`   | `string`    | —            | Wird nach dem Komponentenklassennamen angehängt                                                 |

## Barrierefreiheit

`Form` trägt die semantische Rolle `form`; `FormField` trägt die Semantik `group` und wird mit dem Label benannt, bei Ungültigkeit lautet der semantische Wert `invalid`. Die semantische Annotation liegt auf der Gruppe und nicht auf dem Steuerelement – das Steuerelement gehört dem Aufrufer, die Gruppe ist das einzige garantiert vorhandene Element.
