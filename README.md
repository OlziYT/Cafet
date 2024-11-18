# Gestion des repas scolaires

Une application Web moderne pour la gestion des repas scolaires et des réservations.

## Développement

```bash
npm install
npm run dev
```

## Déploiement

L'application est automatiquement déployée sur GitHub Pages lorsque les modifications sont transmises à la branche principale. Pour déployer manuellement :

```bash
npm run deploy
```

## Variables d'environnement

Créez un fichier `.env` avec les variables suivantes :

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Fonctionnalités

- Gestion des éléments de menu
- Réservations de repas
- Authentification des utilisateurs
- Panneau d'administration
- Préférences alimentaires
