---
title: Alert
description: Bloc callout affichant une information importante, rendu dans le canvas pingo.
---

# Alert

Alert affiche dans la page une information qui demande l'attention de l'utilisateur sans
interrompre son parcours. L'aperçu ci-dessous est rendu en direct par le moteur pingo et suit le
thème clair/sombre du site.

:::preview alert-basic
:::

## Utilisation

```tsx
import { Alert } from "@dopejs/pingo-ui";

root.render(<Alert title="提示">你的配置已自动保存。</Alert>);
```

## Exemples

### Alerte destructive

`variant="destructive"` s'emploie pour les erreurs et les échecs : bordure et titre passent en
couleurs destructives, tandis que le texte de description garde la couleur de premier plan
habituelle pour rester lisible.

```tsx
<Alert title="同步失败" variant="destructive">
  请检查网络连接后重试。
</Alert>
```

## Props

| Prop        | Type                         | Valeur par défaut | Description                           |
| ----------- | ---------------------------- | ----------------- | ------------------------------------- |
| `title`     | `string`                     | —                 | Titre (obligatoire)                   |
| `children`  | `string`                     | —                 | Texte descriptif (obligatoire)        |
| `variant`   | `"default" \| "destructive"` | `"default"`       | Variante visuelle                     |
| `className` | `string`                     | —                 | Ajouté après les classes du composant |

## Accessibilité

Alert est un bloc de texte purement statique qui ne prend pas le focus ; résumez la conclusion
dans un `title` concis et placez les détails dans la description. Pour les scénarios exigeant une
confirmation ou une action de l'utilisateur, utilisez plutôt `AlertDialog`.
