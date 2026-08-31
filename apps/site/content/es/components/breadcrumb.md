---
title: Breadcrumb
description: Navegación de migas de pan al estilo shadcn, con el último elemento como página actual no clicable, renderizada en el canvas de pingo.
---

# Breadcrumb

Navegación de migas de pan: todos los elementos salvo el último son enlaces clicables; el último
representa la página actual — no se renderiza como enlace ni ofrece a las tecnologías de asistencia
la acción de «saltar a la posición actual». La vista previa de abajo se renderiza en vivo con el
motor pingo: puedes hacer clic en los elementos anteriores, activarlos con el teclado, y sigue el
tema del sitio al cambiar entre claro y oscuro.

:::preview breadcrumb-basic
:::

## Uso

```tsx
import { Breadcrumb } from "@dopejs/pingo-ui";

root.render(
  <Breadcrumb
    items={[
      { label: "首页", onNavigate: () => navigate("/") },
      { label: "组件", onNavigate: () => navigate("/components") },
      { label: "Breadcrumb" }, // 末项是当前页，无需 onNavigate
    ]}
  />,
);
```

## Ejemplos

### Separador personalizado

`separator` es `/` por defecto y puede cambiarse por cualquier símbolo de texto (hasta que aterrice
el conjunto de iconos, el separador es un glifo de texto):

:::preview breadcrumb-separator
:::

## Props

### BreadcrumbProps

| Prop        | Tipo                        | Valor predeterminado | Descripción                                                                   |
| ----------- | --------------------------- | -------------------- | ----------------------------------------------------------------------------- |
| `items`     | `readonly BreadcrumbItem[]` | —                    | Elementos de las migas; el último se considera la página actual (obligatorio) |
| `separator` | `string`                    | `"/"`                | Separador entre elementos                                                     |
| `className` | `string`                    | —                    | Se añade tras las clases del propio componente                                |

### BreadcrumbItem

| Campo        | Tipo         | Valor predeterminado | Descripción                                                                                                                                                    |
| ------------ | ------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`      | `string`     | —                    | Texto del elemento (obligatorio)                                                                                                                               |
| `onNavigate` | `() => void` | —                    | Callback de clic; si no se proporciona, el elemento no lleva ningún comportamiento de activación (el último ya se considera la página actual y no lo necesita) |

## Accesibilidad

Las migas en conjunto tienen semántica `navigation` con el nombre "breadcrumb"; los elementos
clicables tienen semántica link, admiten activación por teclado con `Enter` / `Space` y reciben el
foco antes del clic. La página actual se renderiza como texto plano con el valor semántico
`current`, y el lector de pantalla no la trata como un enlace navegable. Más detalles en la
[guía de accesibilidad](/guide/accessibility).
