# Démarrage rapide

## Installation

```sh
pnpm add @dopejs/pingo
```

Votre application ne dépend que du package `@dopejs/pingo`. `@dopejs/pingo-host`, `@dopejs/pingo-jsx` et les autres sont des packages d'implémentation interne,
ils ne font pas partie du contrat public — le [scanner de migration](/guide/migration) refusera toute importation directe de ces derniers.

## Monter votre premier canvas

```ts
import { createElement, createHostedCanvasRoot } from "@dopejs/pingo";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
canvas.width = 800;
canvas.height = 600;

const root = await createHostedCanvasRoot(canvas);

root.render(
  createElement("container", {
    width: 800,
    height: 600,
    backgroundColor: "#ffffffff",
    padding: 24,
    children: createElement("text", {
      value: "Hello pingo",
      fontSize: 24,
      lineHeight: 32,
      color: "#1f2329ff",
    }),
  }),
);
```

`createHostedCanvasRoot` détecte automatiquement les capacités du navigateur et choisit le chemin de transfert entre SharedArrayBuffer, postMessage et le Canvas2D du thread principal — vous n'avez pas besoin d'écrire de branches de repli. `root.mode` renvoie le chemin réellement sélectionné.

## Utiliser TSX

Configurez `tsconfig.json` :

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

Vous pouvez ensuite écrire :

```tsx
function OrderRow({ index }: { index: number }) {
  return (
    <container width={480} height={32} padding={[6, 12, 6, 12]}>
      <text value={`订单 #${index}`} fontSize={13} lineHeight={20} />
    </container>
  );
}

root.render(<OrderRow index={1} />);
```

## Éléments hôtes

Le moteur ne possède que cinq éléments intégrés, qui correspondent directement aux nœuds de la Scene, sans cascade CSS ni sélecteurs :

| Élément        | Usage                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| `container`    | Groupement générique, arrière-plan, padding, transformations                      |
| `text`         | Exécution de texte (shaping, retour à la ligne, géométrie du caret issue du Core) |
| `scroll`       | Conteneur défilable appartenant au Core                                           |
| `virtualList`  | Liste virtuelle à fenêtrage planifié par le Core                                  |
| `editableText` | Primitive de texte éditable                                                       |

`TextField` et `TextArea` sont des widgets composés au-dessus de `editableText` (bordure, état d'erreur),
ils n'introduisent pas de nouveau chemin d'entrée.

## État et effets

```ts
import { signal, useEffect, useSignal, useState } from "@dopejs/pingo";

function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return createElement("text", { value: `已过 ${count} 秒` });
}
```

Primitives réactives disponibles : `signal`, `computed`, `effect`, `batch`, `untracked`,
ainsi que les hooks `useState`, `useSignal`, `useMemo`, `useCallback`, `useRef`, `useEffect`.

::: warning Pas de lecture de layout synchrone
La lecture de layout synchrone dans le Worker, à la manière de `useLayoutEffect`, n'est pas prise en charge — le layout se produit sur une autre horloge.
Lorsque vous avez besoin de résultats de layout, utilisez les contrats asynchrones ; n'essayez pas de lire la géométrie de manière synchrone pendant le rendu.
:::

## Observer l'état de fonctionnement

```ts
const root = await createHostedCanvasRoot(canvas, {
  onFrame: (report) => {
    console.log(report.commands, report.displayListBytes, report.core?.sceneNodes);
  },
  onHostError: (error) => report(error),
});
```

`onFrame` fournit à chaque frame le nombre de commandes, la taille en octets de la DisplayList ainsi que le comptage des zones sales côté Core, la charge de travail de layout et le hash de picture —
c'est la première source de données pour le diagnostic de performance. Pour en savoir plus, consultez [Diagnostics](/guide/diagnostics).

## Aperçu des capacités

Au-dessus des cinq éléments intégrés, pingo offre également trois couches de capacités orientées auteur :

- [Composants de base](/guide/elements) : éléments de niveau moteur tels que View/Text/Image, Input/TextArea, SVG/Path.
- [Styles](/guide/styling) : sous-ensemble CSS versionné — sélecteurs de classe, états d'interaction, limites explicites de la cascade et de l'héritage ;
  pour les variables et les mixins, passez par le [pipeline SCSS / Less](/guide/scss-less) au moment de la compilation.
- [Bibliothèque de composants UI](/components) : `@dopejs/pingo-ui`, des composants prêts à l'emploi alignés sur shadcn/ui, tous rendus sur canvas.

## Prochaines étapes

- [Aperçu de l'architecture](/guide/architecture) : comment Shell et Core se répartissent les tâches
- [Défilement et virtualisation](/guide/scrolling), [Texte et édition](/guide/editing)
- [Playground](/playground) : démonstrations interactives en temps réel
