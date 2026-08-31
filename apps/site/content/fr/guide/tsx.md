---
title: TSX
description: Écrire des composants pingo en TSX, et cohabiter avec React dans un même dépôt.
---

# Écrire pingo en TSX

## Configuration

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

`jsx` sélectionne le runtime automatique de TypeScript ; `jsxImportSource` le pointe vers le
`jsx-runtime` de pingo plutôt que celui de React. Le nom `react-jsx` désigne le mode de
transformation et n'a rien à voir avec React.

## Ce qui peut servir de balise

```tsx
import { createContext, memo, Text, useState, View, type PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

const Theme = createContext("light");

function Row({ label }: { readonly label: string }): PingoNode {
  const [count, setCount] = useState(0);
  return (
    <View width={240} padding={8}>
      <text value={`${label} ${count}`} />
      <Button onPress={() => setCount(count + 1)}>Ajouter</Button>
    </View>
  );
}

root.render(
  <Theme.Provider value="dark">
    <Row label="Clics" />
  </Theme.Provider>,
);
```

Les cinq formes fonctionnent :

| Forme                            | Exemple                                               |
| -------------------------------- | ----------------------------------------------------- |
| Éléments natifs                  | `<container>`, `<text>`, `<scroll>`, `<editableText>` |
| Composants de base               | `<View>`, `<Text>`, `<Image>`, `<Input>`              |
| Vos propres composants fonction  | `<Row label="…" />`                                   |
| Composants enveloppés par `memo` | tous ceux de `@dopejs/pingo-ui`                       |
| Fournisseurs de contexte         | `<Theme.Provider value={…}>`                          |

::: warning Un composant à hooks se monte, il ne s'appelle pas
`Row({ label })` passe le contrôle de types mais échoue avec
`hooks may only run in a function component` : les hooks ont besoin de la portée de composant
que crée le réconciliateur. Écrivez `<Row label="…" />`.
:::

Annoter le type de retour `PingoNode` est possible. Il contient `undefined`, mais la
compatibilité avec les balises JSX est déclarée par le `JSX.ElementType` du moteur : inutile
de réécrire la signature.

## Cohabiter avec React

Avoir dans un même dépôt des fichiers TSX React et pingo est courant : la coquille en React,
les zones à forte contrainte de performance dessinées par pingo.

### Le mécanisme, c'est la déclaration en tête de fichier

`jsxImportSource` s'applique **par fichier**. Mettez ceci en première ligne d'un fichier
pingo :

```tsx
/** @jsxImportSource @dopejs/pingo */
```

Le `tsconfig.json` du projet garde sa configuration React, et seuls les fichiers portant
cette ligne utilisent le runtime pingo. `tsc`, esbuild/Vite et babel la respectent tous.

**Les deux autres idées ne tiennent pas**, mesuré :

| Approche                                                           | Résultat                                                                                                                                  |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Un `tsconfig.json` dans le dossier avec un autre `jsxImportSource` | `tsc` l'ignore totalement et Vite l'applique : le build et le typecheck divergent                                                         |
| Exclure par nom de fichier avec `exclude`                          | `exclude` n'agit que sur la sélection des fichiers racine ; dès qu'un fichier React l'`import`e, il revient et est compilé comme du React |

Pour que le nom de fichier pilote réellement la chaîne d'outils, il faut des composite
project references : le projet pingo émet des `.d.ts` et le projet React consomme des
déclarations plutôt que des sources.

Oublier cette ligne ne casse pas en silence, cela échoue à la compilation :

```
error TS2322: Type 'Element' is not assignable to type 'PingoNode'.
error TS2786: 'View' cannot be used as a JSX component.
```

### Le suffixe de nom est une convention

Quand les deux types de fichiers voisinent dans un dossier, donnez aux fichiers pingo un
suffixe comme `scene.pingo.tsx` : on les distingue dans la liste, et cela sert aux
configurations par nom comme les `overrides` de babel. C'est une convention pour les humains
et les outils de configuration, elle **ne remplace pas l'en-tête**. Si tout le dossier est du
pingo, le dossier est déjà le signal et le suffixe n'est que du bruit.

### La frontière est celle du fichier

Un fichier n'a qu'un seul type de JSX : **on ne peut pas écrire de balises pingo dans un
composant React**. Le fichier pingo exporte la scène, le fichier React l'importe :

```tsx
/** @jsxImportSource @dopejs/pingo */
// scene.pingo.tsx
import { Text, View, type PingoNode } from "@dopejs/pingo";

export function scene(label: string): PingoNode {
  return (
    <View width={240} height={80} padding={12}>
      <Text value={label} />
    </View>
  );
}
```

### Monter avec `PingoContainer`

```tsx
// App.tsx — les balises de ce fichier sont celles de React
import { PingoContainer } from "@dopejs/pingo/react";

import { scene } from "./scene.pingo";

export function App() {
  return <PingoContainer scene={scene("Hello")} style={{ height: 320, width: 480 }} />;
}
```

La scène arrive par la prop `scene` et non par les children, parce que les balises de ce
fichier appartiennent à React : on ne peut pas y écrire des children pingo.

`PingoContainer` crée lui-même le canvas au lieu de laisser React le rendre et d'en prendre
une ref. C'est **obligatoire** : la racine transfère le canvas à un OffscreenCanvas, ce
transfert est définitif, et React StrictMode exécute les effets deux fois en développement —
un canvas appartenant à React serait donc confié à une seconde racine, et échouerait :

```
this canvas already transferred control to an OffscreenCanvas and cannot host
a second root; create a new canvas element per root
```

Le canvas créé par le composant disparaît avec le montage abandonné, donc le cas ne se
présente pas. La taille non plus ne demande rien : la racine suit la boîte de son propre
canvas, dimensionner le conteneur en CSS suffit.

Quand vous avez besoin de la racine (contrôle du défilement, callbacks de diagnostic),
utilisez `onRoot` ; pour un échec de démarrage, `onStartupError`. Les erreurs d'exécution
continuent d'arriver dans `options.onHostError`.

### Les deux arbres ne partagent pas d'état

Le state et le contexte de React n'atteignent pas l'arbre de composants pingo, et
réciproquement. Ce sont deux réconciliateurs indépendants. La communication à travers la
frontière est un flux de données ordinaire : React calcule la valeur et la passe via `scene`,
pingo renvoie ses résultats par des callbacks d'événements.

## Ce dépôt est l'exemple

`apps/site` est une application React qui contient aussi 73 aperçus de composants écrits en
TSX pingo. Le dossier où les deux cohabitent est
[`apps/site/src/interop`](https://github.com/dopejs/pingo/tree/main/apps/site/src/interop),
et son test s'exécute sous `StrictMode`.
