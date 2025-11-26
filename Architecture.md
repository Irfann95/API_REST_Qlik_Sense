## Instructions d'utilisation

Il est impératif de se connecter (le nom d'utilisateur ainsi que le mot de passe vous sera fourni) pour avoir accès aux requêtes QLik. N'hésitez pas à changer de mot de passe si nécessaire. La requête de login vous renverra un BEARER Token à fournir et compléter dans l'icône "Authorize".

Pour chaque requête dans le module QLik, il faudra au minimum renseigner 3 paramètres dans le body : le `tenant`, l'`appId` ainsi que l'`apiKey`. Ces 3 paramètres vous seront fournis.

## Description des requêtes QLik

### /sheets
Répertorier toutes les feuilles de la session.

### /dimensions
Lister les filtres d'entrée ainsi que leurs valeurs d'une feuille spécifique. L'identifiant de la feuille devra être renseigné dans le body.

### /visualisations
Lister les visualisations ainsi que leurs valeurs d'une feuille spécifique. L'identifiant de la feuille devra être renseigné dans le body.

### /export
Générer un rapport sous format PDF. Dans le cas d'un téléchargement d'une feuille entière, doivent être renseignés le `sheetId`, les filtres ainsi que leurs valeurs.

**Exemple :**

```json
{
  "appId": "12a23fc3-1bef-450d-be07-9865ef2eb274",
  "tenant": "cecim.us.qlikcloud.com",
  "apiKey": "ey...DbVa",
  "sheetId": "7d630...",
  "type": "sheet",
  "selections": [
    { 
      "fieldName": "tva_name", 
      "values": ["reduite"] 
    },
    { 
      "fieldName": "sect_lib", 
      "values": ["1ERE COURONNE (St-E)", "AGGLO PAYS D'ISSOIRE", "AIRE AVIGNONNAISE"] 
    }
  ],
  "format": "pdf"
}