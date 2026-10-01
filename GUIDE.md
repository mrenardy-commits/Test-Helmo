# Votre premier chatbot documentaire

## Ce qui est préparé
Interface française, fonction serveur Netlify, recherche plein texte française Supabase, appel Groq et références aux passages. Pas de dépendance npm pour l’application. Node.js 22 ou supérieur pour l’import local.

Prototype privé avec code partagé : ce n’est pas encore une authentification individuelle ni une application prête pour des documents de clients. Le code reste en mémoire dans la page et n’est pas enregistré dans le navigateur. Chaque utilisateur autorisé peut consulter le même corpus. Les extraits pertinents sont transmis à Groq.

## 1. Supabase
Créer un projet de test. Dans SQL Editor, exécuter `supabase/schema.sql` une fois. Le schéma crée une table de passages et une fonction de recherche ; il bloque l’accès des rôles publics. Utiliser des documents fictifs pour le premier essai.

Récupérer l’URL du projet et la clé serveur secrète `sb_secret_…` dans les paramètres API. Cette clé reste exclusivement côté serveur. Ne pas la mettre dans les fichiers publics ni dans GitHub.

## 2. Importer un document
Pour cette première version, formats acceptés : TXT et Markdown UTF-8. Les PDF, scans, DOCX et fichiers Excel devront faire l’objet d’une extraction supplémentaire. Supabase stocke ici le texte et les références ; le téléversement des fichiers originaux dans Storage n’est pas encore implémenté.

Sur un ordinateur avec Node.js 22 ou supérieur, dans le dossier du projet :

```sh
cp .env.example .env
```

Remplir uniquement `SUPABASE_URL` et `SUPABASE_SECRET_KEY` pour l’import, dans `.env`. Créer `documents/exemple.txt`, puis :

```sh
npm run import -- documents/exemple.txt
```

Un nom de fichier représente une source unique. Un second import du même nom est refusé ; supprimer explicitement les anciens passages de cette source avant remplacement. L’import découpe le texte avec chevauchement ; il ne conserve pas les numéros de page.

## 3. Netlify via GitHub
Mettre les fichiers du projet dans `Test-Helmo`. Dans Netlify, choisir l’import d’un projet existant depuis GitHub et sélectionner ce dépôt. Répertoire de publication : `public`. Aucun build front-end nécessaire. Les fonctions sont dans `netlify/functions`, comme indiqué dans `netlify.toml`.

Ce projet utilise une fonction serveur : le dépôt GitHub avec déploiement Netlify convient mieux qu’un simple dépôt de fichiers HTML dans Netlify Drop.

Ajouter ces variables dans les paramètres Netlify, accessibles aux Functions :

| Variable | Valeur |
|---|---|
| GROQ_API_KEY | Votre clé Groq |
| GROQ_MODEL | Identifiant exact d’un modèle disponible dans votre compte, par exemple llama-3.3-70b-versatile à vérifier |
| SUPABASE_URL | URL du projet Supabase |
| SUPABASE_SECRET_KEY | Clé serveur secrète sb_secret_… |
| CHAT_ACCESS_TOKEN | Code privé long et aléatoire, réservé aux utilisateurs de test |

Ne jamais enregistrer les clés dans `netlify.toml`, dans GitHub ou dans la conversation. Relancer le déploiement après toute modification des variables.

## 4. Essai
Ouvrir le site, saisir le code privé et une question utilisant les mots présents dans le document. Vérifier la réponse et les passages référencés. Tester également une question sans rapport : le chatbot doit annoncer l’absence de passage pertinent.

La recherche est lexicale, pas vectorielle : reformuler avec les termes exacts peut être nécessaire. Les sources affichées sont les passages fournis au modèle ; leur présence ne garantit pas que chaque affirmation est justifiée. Les règles du prompt réduisent les inventions sans pouvoir les supprimer entièrement.

## 5. Suite du projet
Ajouter selon vos besoins : import PDF/DOCX avec pages, Supabase Storage, authentification individuelle, séparation des corpus, limites d’usage persistantes et recherche hybride/vectorielle. Une recherche vectorielle nécessitera un modèle d’embeddings distinct, à choisir.

Avant une diffusion plus large, remplacer le code partagé par une authentification et prévoir une limitation d’usage. Pour le premier test, ne partager le code qu’avec vous-même.

## Vérification technique
`npm test` exécute les tests serveur avec services simulés. Les tests réels Groq/Supabase et le déploiement nécessitent vos comptes configurés ; ils ne sont pas inclus dans ces vérifications.
