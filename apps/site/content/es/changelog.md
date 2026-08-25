---
title: Registro de cambios
---

# Changelog

El criterio de versionado está en `docs/release.md`: los 12 paquetes se publican de forma atómica con
la misma versión, y el semver de npm y la versión del ABI binario se gestionan por separado.

## 0.3.1 - 2026-08-25

- `@dopejs/pingo-ui` ya se publica en npm, con la misma versión que el motor. Hasta ahora solo
  existía en el repositorio y en la documentación, no en el conjunto de publicación: 46
  componentes documentados que no se podían instalar. Al incluirlo se activa además su
  verificación de tarball: archivos obligatorios, archivos legales, reescritura de los rangos
  del workspace y cierre de dependencias.

## 0.3.0 - 2026-08-25

- Los elementos de una lista virtual ahora se estiran a lo ancho de la lista, de modo que
  las filas del cuerpo de una tabla coinciden con las columnas de su cabecera. La
  disposición del envoltorio pertenece al Core y no pasa por la cascada de estilos.
- Una caja estirada dentro de un contenedor con desplazamiento recupera su tamaño
  transversal definido y su base porcentual: las cajas de un panel con desplazamiento ya no
  vuelven a ajustarse al contenido, y `100%` dentro de un elemento virtual ya no da cero.
- Los elementos flex reciben el tamaño mínimo automático de CSS en el eje de bloque: un
  hermano muy grande ya no puede aplastar a otro dimensionado por su contenido. Subconjunto
  CSS 1.8.0: `min-width`/`min-height` ahora son `auto` inicialmente.
- Componentes: Skeleton late; NavigationMenu deja de llevar el borde de Menubar y añade un
  chevron; la cabecera de una tabla ya no se encoge; StatCard/TopBar/ListRow conservan el
  ancho de su contenido cuando se montan sin uno.
- Publicación: el conjunto que se publica y la lista de artefactos se derivan de la lista
  del verificador; la comprobación de compilación reproducible pasa al final de las puertas.
- La licencia del proyecto cambia de MIT a Apache-2.0 a partir de 0.3.0;
  las versiones publicadas hasta v0.2.1 siguen bajo MIT.

## 0.2.1 - 2026-08-20

- `initializeWasm` es ahora público, idempotente y reintentable, de modo que la aplicación
  puede orquestar la carga del WASM. El estado de carga de Storybook pasa a mostrarse de forma
  ligera y diferida, y la inicialización del Worker reutiliza el mismo punto de entrada.
- El playground de dos relojes desplaza un millón de filas de forma continua desde que se abre
  la página; los botones solo bloquean el hilo principal en lugar de iniciar o reiniciar el
  estado del desplazamiento.
- Nuevo `setScrollVelocity`, un desplazamiento programático a velocidad constante que sostiene
  el reloj del Core/Worker. El Input Stream gana el comando correspondiente y la versión del
  ABI pasa de 10 a 11.

## 0.2.0 - 2026-08-20

- La curva de transferencia de la rueda se alinea con el navegador: los saltos discretos de rueda se
  animan y los deltas de alta precisión (trackpad) se siguen aplicando 1:1 al instante. `DispatchEvent`
  del Input Stream gana un campo de flags y la versión del ABI pasa de 1 a 2.
- El sitio oficial está disponible en chino simplificado, chino tradicional, español, francés, alemán,
  ruso, hebreo, árabe, japonés y coreano.

## 0.1.0

Primera versión publicable. Todos los hitos de ingeniería P0–M5 están completos y `pnpm m5:check`
(la cadena automática de M0 a M5) pasa en verde.

- Core Rust/WASM determinista + capa TypeScript: esquema de fuente única, flujos binarios versionados
  de Mutation/Input/DisplayList e inverso, y rechazo atómico de entradas malformadas.
- Renderizado con dos relojes: cadena SAB → postMessage → Canvas2D en el hilo principal; el Worker
  sigue presentando aunque el hilo principal quede bloqueado 200 ms.
- Scroll virtual nativo (reproducción P95/P99 por debajo del microsegundo con un millón de filas) y
  subsistema de texto (shaping explícito de fuentes, atlas de glifos, fallback a fuentes del sistema).
- Edición nativa en canvas: doble camino EditContext/proxy de entrada, composición IME, navegación del
  cursor con puntero y teclado, portapapeles, undo/redo, enmascarado de contraseñas y scroll-into-view
  del cursor.
- Hit testing (BVH incremental con tests de propiedades contra un oráculo trivial) y eventos en tres
  fases captura/objetivo/burbuja, con el protocolo de `preventDefault` síncrono sobre zonas no pasivas.
- Accesibilidad: exportación del árbol semántico, proyección al árbol DOM en la sombra, selectores E2E
  semánticos `getByRole` y reenvío del foco de teclado.
- Migración y puesta en producción: `@dopejs/pingo-compat` con despliegue y vuelta atrás por página,
  escáner de migración, verificación de integridad SHA-256 del paquete y del WASM, diagnóstico y
  manual de operación.
- Prototipo WebGPU aislado y comparación sin discrepancias contra el oráculo headless (ADR-0006:
  Continue Experiment, desactivado por defecto).

Aplazamientos explícitos: navegación visual bidi, placeholder en los widgets y activar WebGPU por
defecto. La cualificación de plataforma (rendimiento en dispositivos reales, IME reales, lectores de
pantalla) se registra aparte y no se promete con la versión del paquete.
