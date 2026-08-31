---
title: Toast
description: Notificación ligera que aparece en una esquina, alojada por ToastViewport y renderizada en el lienzo de pingo.
---

# Toast

Toast es una notificación ligera que aparece brevemente en una esquina, adecuada para dar una respuesta inmediata al guardar correctamente, al producirse un fallo de sincronización, etc. La siguiente vista previa está renderizada en tiempo real por el motor de pingo: haz clic en el botón para activar un toast, que también seguirá el tema claro u oscuro del sitio.

:::preview toast-basic
:::

## Uso

Toast debe usarse junto con `ToastViewport`. El viewport es un contenedor de esquina con posicionamiento absoluto (arriba a la derecha de forma predeterminada) y **debe montarse bajo un contenedor cercano a la raíz**; en este motor, el bloque contenedor es el nodo padre y no el ancestro posicionado más cercano, así que si se monta dentro de un contenedor pequeño solo cubrirá ese contenedor pequeño.

```tsx
import { Button, Toast, ToastViewport } from "@dopejs/pingo-ui";

let open = false;

function scene() {
  return (
    <container width={surfaceWidth} height={surfaceHeight}>
      <Button
        onPress={() => {
          open = true;
          root.render(scene());
        }}
      >
        保存
      </Button>
      <ToastViewport>
        <Toast open={open} title="已保存" description="配置已写入本地。" />
      </ToastViewport>
    </container>
  );
}
```

La visualización, la ocultación y el momento del cierre automático los controla la propia aplicación: basta con invertir `open` y volver a ejecutar `root.render(...)` (el botón de la vista previa sigue este patrón).

## Ejemplos

### Variantes

`variant="destructive"` se utiliza para notificaciones de error. En ese caso, el texto de descripción deja de usar el color de primer plano atenuado: el fondo destructivo ya invierte el primer plano, y si se atenuara de nuevo quedaría texto gris sobre fondo rojo.

:::preview toast-variants
:::

## Props

### Toast

| Prop          | Tipo                         | Valor predeterminado | Descripción                                                                |
| ------------- | ---------------------------- | -------------------- | -------------------------------------------------------------------------- |
| `open`        | `boolean`                    | —                    | Si se muestra; cuando es `false` se renderiza como `null` (obligatorio)    |
| `title`       | `string`                     | —                    | Título (obligatorio)                                                       |
| `description` | `string`                     | —                    | Texto de descripción; si se omite, no se renderiza la línea de descripción |
| `variant`     | `"default" \| "destructive"` | `"default"`          | Variante visual                                                            |
| `className`   | `string`                     | —                    | Se añade después del nombre de clase del componente                        |

### ToastViewport

| Prop        | Tipo        | Valor predeterminado | Descripción                                                                                                 |
| ----------- | ----------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `children`  | `PingoNode` | —                    | Lista de toasts dentro del viewport; varios se apilan verticalmente con una separación de 8px (obligatorio) |
| `className` | `string`    | —                    | Se añade después del nombre de clase del componente                                                         |

## Accesibilidad

Toast tiene el rol semántico `status`, por lo que las tecnologías de asistencia lo anuncian como mensaje de estado. El toast no interrumpe el foco actual; para el resultado de acciones críticas, mantén además una respuesta persistente en la página (como `Alert`).
