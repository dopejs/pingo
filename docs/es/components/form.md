---
title: Form
description: Contenedor de formulario y envoltorio de campos, responsable del diseño, la semántica y los espacios de error/descripción, renderizado sobre el lienzo de pingo.
---

# Form

`Form` es el contenedor del formulario, y `FormField` ensambla la etiqueta, el control y la información de error/descripción en un solo campo. La vista previa inferior es renderizada en tiempo real por el motor pingo: los campos de entrada se pueden editar de verdad y siguen el cambio de tema claro/oscuro del sitio.

:::preview form-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Form, FormField, Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Form, {
    children: createElement(FormField, {
      label: "邮箱",
      required: true,
      error: emailError, // 校验规则由调用方持有
      children: createElement(Input, {
        semanticLabel: "邮箱",
        onValueChange: (value) => validate(value),
      }),
    }),
  }),
);
```

La validación no está dentro del componente: cuándo validar, qué error mostrar y cómo combinarlos son decisiones de producto. Quien llama conserva las reglas y las pasa mediante `error`; el componente solo se encarga del diseño, la semántica y los espacios de información.

## Ejemplos

### Error y descripción

Cuando `error` está presente, el campo se marca como inválido y **reemplaza** el texto de descripción: si una de las dos líneas de guía es un mensaje de fallo, la otra quedaría oculta. `required` añade un `*` después de la etiqueta.

## Props

### Form

| Prop        | Tipo        | Valor predeterminado | Descripción                                         |
| ----------- | ----------- | -------------------- | --------------------------------------------------- |
| `children`  | `PingoNode` | —                    | Contenido del formulario (obligatorio)              |
| `className` | `string`    | —                    | Se añade después del nombre de clase del componente |

### FormField

| Prop          | Tipo        | Valor predeterminado | Descripción                                                                                 |
| ------------- | ----------- | -------------------- | ------------------------------------------------------------------------------------------- |
| `label`       | `string`    | —                    | Etiqueta del campo (obligatorio)                                                            |
| `children`    | `PingoNode` | —                    | Control del campo (obligatorio)                                                             |
| `error`       | `string`    | —                    | Mensaje de error; si está presente, marca el campo como inválido y reemplaza la descripción |
| `description` | `string`    | —                    | Texto descriptivo de apoyo                                                                  |
| `required`    | `boolean`   | `false`              | Marca de obligatorio; añade `*` después de la etiqueta                                      |
| `className`   | `string`    | —                    | Se añade después del nombre de clase del componente                                         |

## Accesibilidad

`Form` tiene el rol semántico `form`; `FormField` tiene el rol semántico `group` y se nombra mediante su etiqueta, con el valor semántico `invalid` cuando es inválido. La anotación semántica se coloca en el grupo y no en el control: el control pertenece a quien llama, y el grupo es el único elemento cuya existencia está garantizada.
