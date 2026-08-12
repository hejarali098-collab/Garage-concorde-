# Garage Concorde — Pointage Vercel

Version prévue pour Vercel + Postgres (Neon).

## Employés déjà intégrés
- Youssef Althiab — PIN 1111
- Hatem Hussein — PIN 2222
- Faisel Azizi — PIN 3333
- Ali Abdullah — PIN 4444
- Ali Amiri Asghar — PIN 5555

Changez les PIN après la première mise en service si nécessaire (dans `lib/db.js` avant la première création de la base).

## 1. Déployer sur Vercel
Importez ce dossier comme projet Next.js.

## 2. Ajouter une base Postgres
Dans Vercel :
- Project → Storage / Marketplace
- ajouter un fournisseur Postgres (par exemple Neon)
- connecter la base au projet

Vercel ajoutera automatiquement `DATABASE_URL` si l'intégration est configurée.

## 3. Variables d'environnement obligatoires
Dans Vercel → Project → Settings → Environment Variables :

- `ADMIN_PASSWORD` = votre mot de passe administrateur
- `PIN_SALT` = une longue valeur secrète, par exemple `Concorde-Pointage-2026-Secret`

Puis REDÉPLOYEZ le projet.

## 4. Rapport mensuel par e-mail (optionnel)
Le fichier `vercel.json` lance automatiquement un rapport le 1er de chaque mois.

Pour l'e-mail, ajoutez :
- `RESEND_API_KEY`
- `REPORT_EMAIL` = votre adresse e-mail
- `REPORT_FROM` = adresse expéditeur autorisée chez Resend
- `CRON_SECRET` = secret aléatoire (Vercel peut aussi le gérer pour Cron)

Le rapport envoyé est le mois précédent au format CSV.

## 5. Utilisation
- `/` : les employés pointent leur arrivée et leur départ
- `/admin` : vous entrez votre mot de passe, choisissez le mois, voyez les heures et téléchargez le CSV

## Important
Pour un vrai usage légal de suivi du temps de travail :
- gardez des sauvegardes ;
- protégez les accès ;
- informez les employés du système de pointage ;
- vérifiez les règles applicables à votre entreprise/CCT.
