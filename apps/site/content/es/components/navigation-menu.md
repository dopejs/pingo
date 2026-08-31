---
title: Navigation Menu
description: Barra de menú estilo navegación del sitio, comportamiento idéntico a Menubar pero con semántica de navegación.
---

# Navigation Menu

Navigation Menu es la versión con semántica de navegación del [Menubar](/components/menubar): la misma fila de disparadores y panel expandible, pero expone semántica de navegación, ideal para la navegación principal del sitio. La vista previa a continuación es renderizada en tiempo real por el motor pingo y alterna entre claro y oscuro según el tema del sitio.

:::preview navigation-menu-basic
:::

## Uso

```tsx
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

root.render(
  <NavigationMenu onValueChange={(value) => {}}>
    <MenubarMenu value="products" label="产品">
      <text value="渲染引擎" />
    </MenubarMenu>
    <MenubarMenu value="docs" label="文档">
      <text value="快速开始" />
    </MenubarMenu>
  </NavigationMenu>,
);
```

Los elementos reutilizan `MenubarMenu`. La apertura y cierre no son controlados por defecto; al pasar `value` se cambia al modo controlado. El comportamiento interactivo (navegación por teclado, compartición del estado de apertura) es completamente idéntico al de Menubar.

## Props

`NavigationMenu` acepta todas las props de `MenubarProps` excepto `navigation`:

| Prop            | 类型                                   | 默认值 | 说明                                                        |
| --------------- | -------------------------------------- | ------ | ----------------------------------------------------------- |
| `value`         | `string`                               | —      | Controlado: valor del menú abierto actualmente              |
| `onValueChange` | `(value: string \| undefined) => void` | —      | Callback al cambiar el menú abierto (`undefined` al cerrar) |
| `children`      | `PingoNode`                            | —      | Varios `MenubarMenu` (obligatorio)                          |
| `className`     | `string`                               | —      | Clase adicional                                             |

Para las props de los elementos, consulta [Menubar](/components/menubar#menubarmenu).

## Accesibilidad

El contenedor tiene semántica de navigation, las etiquetas tienen semántica de menuitem y exponen el estado expanded/collapsed; las flechas izquierda y derecha se mueven entre elementos, `Escape` cierra y devuelve el foco a la etiqueta actual.
