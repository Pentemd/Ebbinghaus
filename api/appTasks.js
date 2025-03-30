const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'tokenTasks.json';
const SCOPES = ['https://www.googleapis.com/auth/tasks'];

// Fonction pour authentifier l'utilisateur
async function authenticate() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const { client_secret, client_id, redirect_uris } = JSON.parse(content).installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Lire le token d'authentification
  const token = fs.readFileSync(TOKEN_PATH);
  oAuth2Client.setCredentials(JSON.parse(token));
  
  return oAuth2Client;
}

// Fonction pour obtenir l'ID de la liste de tâches "Tâches Quotidiennes"
async function getTaskListId(auth, listName) {
  const tasks = google.tasks({ version: 'v1', auth });
  const res = await tasks.tasklists.list();
  const taskLists = res.data.items;
  const taskList = taskLists.find(list => list.title === listName);

  if (taskList) {
    return taskList.id;
  } else {
    throw new Error(`Liste de tâches "${listName}" non trouvée.`);
  }
}

// Fonction pour créer plusieurs tâches avec des dates d'échéance
async function createTasks(auth, taskListId, tasksToCreate) {
  const tasks = google.tasks({ version: 'v1', auth });

  for (const task of tasksToCreate) {
    try {
      const res = await tasks.tasks.insert({
        tasklist: taskListId,
        requestBody: {
          title: task.title,
          due: new Date(task.due).toISOString(), // Définit la date d'échéance au format ISO 8601
          notes: task.notes || '',
        },
      });
      console.log('Tâche créée:', res.data);
    } catch (err) {
      console.error('Erreur lors de la création de la tâche :', err);
    }
  }
}

// Fonction principale
async function mainTasks(tasksToCreate) {
  try {
    const auth = await authenticate();
    const taskListId = await getTaskListId(auth, 'Ebbinghaus');
    
    

    // Créer les tâches
    await createTasks(auth, taskListId, tasksToCreate);
  } catch (err) {
    console.error(err);
  }
}

module.exports = {mainTasks};