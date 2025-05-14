import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import {MongoClient, ObjectId, Db} from 'mongodb';

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

// PRIVATE KEY------------------------------------------------------------------------
const privateKey = process.env.PRIVATE_KEY;

// CONFIGURE ENVIRONMENT ------------------------------------------------------------
dotenv.config();

// MONGODB CONNECTION --------------------------------------------------------------------
const uri = process.env.MONGODB_URI;
let dbClient: MongoClient | null = null;
let db: Db | null = null;

async function connectToMongoDB(){
  try{
    console.log(`Mongodb uri: ${uri}`)
    dbClient = new MongoClient(uri!);
    await dbClient.connect();
    console.log('Connecting to MongoDB');
    db = dbClient.db(process.env.DB_NAME || 'my-app');
    return true;
  } catch (error){
    console.error('Cannot connect to MongoDB:', error);
    return false;
  }
}


// IPC HANDLER ------------------------------------------------------------------------
ipcMain.on('save-task', (_, task: string) => {
  console.log("Saving task...");
});

ipcMain.on('access-database', (_, email: string, password: string) =>{
  console.log(`Received email: ${email} and password: ${password}`);
});

import {User} from '../types/user.ts'
import {Admin} from '../types/admin.ts'

ipcMain.handle('add-user', async (_, user: User) =>{
  console.log(`Adding new user, email: ${user.email}, password: ${user.password}`);

  try{
    if (!db){
      const connected = await connectToMongoDB();
      if (!connected) {
        console.log('Cannot connect to MongoDB in ipcMain:add-user, main.ts');
        return {success: false};
      };
    }

    const collection = db?.collection('users');
    await collection?.insertOne(user);
    console.log("Successfully added a new user");
    return {success: true};
  } catch (error: any){
    console.error('Error adding user:', error);
    return {success: false};
  }
})

ipcMain.handle('add-admin', async(_, admin: Admin) =>{
  console.log(`Adding new admin, email: ${admin.email}, password: ${admin.password}`);

  try{
    if (!db){
      const connected = await connectToMongoDB();
      if (!connected) {
        console.log('Cannot connect to MongoDB in ipcMain:add-admin, main.ts');
        return {success: false};
      };
    }

    const collection = db?.collection('admins');
    await collection?.insertOne(admin);
    console.log("Successfully added a new admin");
    return {success: true};
  } catch (error: any){
    console.error('Error adding admin:', error);
    return {success: false};
  }
})

// ipcMain.on('get-user', async (e) =>{
//   try{
//     if (!db) {
//       const connected = await connectToMongoDB();
//       if (!connected) {
//         console.log('Cannot connect: ipcMain get-user');
//         return { success: false, error: 'Cannot connect to database' };
//       }

//       return { success: false, error: 'Database connection is null' };
//     }

//     const collection = db.collection('user');
//     const result = collection.find({});
//     return {success: true, collection: result};

//   }
//   catch(error){
//     console.error('Error getting debtor:', error);
//     return {success: false, error};
//   }
// })





