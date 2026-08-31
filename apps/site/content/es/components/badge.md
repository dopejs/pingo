---
title: Badge
description: Pequeña etiqueta de estado no interactiva, renderizada en el canvas de pingo.
---

# Badge

Badge es una etiqueta de estado no interactiva para anotar estados, categorías o cantidades, por
ejemplo «Administrador» o «Beta». La vista previa de abajo se renderiza en vivo con el motor
pingo y sigue el tema del sitio al cambiar entre claro y oscuro.

:::preview badge-variants
:::

## Uso

```tsx
import { Badge } from "@dopejs/pingo-ui";

root.render(<Badge>Beta</Badge>);
```

## Ejemplos

### Variantes

Cuatro variantes cubren la semántica habitual: `default` (énfasis), `secondary` (atenuado),
`destructive` (error/peligro) y `outline` (contorno). La vista previa las muestra en ese orden.

```tsx
<Badge variant="secondary">只读</Badge>
```

### Combinación con otros componentes

Badge suele usarse como elemento trailing de una fila de lista o de una tarjeta, combinado con
`Avatar` y `ListRow`:

```tsx
<ListRow
  title="张三"
  leading={<Avatar fallback="张" size={32} />}
  trailing={<Badge>管理员</Badge>}
  onPress={() => {}}
/>
```

## Props

| Prop            | Tipo                                                     | Valor predeterminado | Descripción                                                   |
| --------------- | -------------------------------------------------------- | -------------------- | ------------------------------------------------------------- |
| `children`      | `string`                                                 | —                    | Texto de la etiqueta (obligatorio)                            |
| `variant`       | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"`          | Variante visual                                               |
| `semanticLabel` | `string`                                                 | —                    | Nombre accesible; si se omite se usa la semántica por defecto |
| `className`     | `string`                                                 | —                    | Se añade tras las clases del propio componente                |

## Accesibilidad

Badge no responde al puntero ni al teclado: es un elemento puramente expositivo. Cuando el texto
no basta para transmitir el significado (como un contador puramente numérico), usa
`semanticLabel` para dar la explicación completa.
