---
title: Alert
description: Bloque callout para mostrar avisos importantes, renderizado en el canvas de pingo.
---

# Alert

Alert muestra en la página avisos que requieren la atención del usuario sin interrumpir el flujo.
La vista previa de abajo se renderiza en vivo con el motor pingo y sigue el tema del sitio al
cambiar entre claro y oscuro.

:::preview alert-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Alert } from "@dopejs/pingo-ui";

root.render(
  createElement(Alert, {
    title: "提示",
    children: "你的配置已自动保存。",
  }),
);
```

## Ejemplos

### Aviso destructivo

`variant="destructive"` se usa en escenarios de error o fallo: el borde y el título adoptan la
paleta destructiva, mientras el texto descriptivo conserva el color de primer plano habitual para
mantener la legibilidad.

```tsx
createElement(Alert, {
  title: "同步失败",
  variant: "destructive",
  children: "请检查网络连接后重试。",
});
```

## Props

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `title` | `string` | — | Título (obligatorio) |
| `children` | `string` | — | Texto descriptivo (obligatorio) |
| `variant` | `"default" \| "destructive"` | `"default"` | Variante visual |
| `className` | `string` | — | Se añade tras las clases del propio componente |

## Accesibilidad

Alert es un bloque de texto puramente estático y no roba el foco; resume la conclusión con un
`title` conciso y deja los detalles en la descripción. Para escenarios que requieren confirmación
o acción del usuario, usa `AlertDialog`.
