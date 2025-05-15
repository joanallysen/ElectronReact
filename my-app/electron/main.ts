import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import {MongoClient, ObjectId, Db, Collection} from 'mongodb';

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

async function hashPassword(password: string){
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('hashed password', hash);
  return hash;
}

// async function checkEmailExist(email:string){
//   let collection; let data;
//   collection = db?.collection('admins');
//   data = await collection?.findOne({email: email});
//   if (data) { return {success:true, isAdmin: true}; }
//   collection = db?.collection('users');
//   data = await collection?.findOne({email:email});
//   if (data) {return {success:true, isAdmin: false}};
//   return false;
// }


// IPC HANDLER ------------------------------------------------------------------------
import {User} from '../types/user.ts'
import {Admin} from '../types/admin.ts'


ipcMain.handle('verify-account', async (_, email: string, password: string) =>{
  console.log(`Received email: ${email} and password: ${password}`);
  try{
    if (!db){
      const connected = await connectToMongoDB();
      if (!connected) {
        console.log('Cannot connect to MongoDB in ipcMain:verify-account, main.ts');
        return {success: false};
      };
    }

    // checkEmailExist(email);
    let collection; let matchedAccount;
    collection = db?.collection('admins');
    matchedAccount = await collection?.findOne({email: email});
    if(matchedAccount && await bcrypt.compare(password, matchedAccount.password)){
      console.log(`email: ${email} matched! in admin`)
      return {isVerified: true, isAdmin: true}
    }

    collection = db?.collection('users');
    matchedAccount = await collection?.findOne({email: email});
    if(matchedAccount && await bcrypt.compare(password, matchedAccount.password)){
      console.log(`email: ${email} matched! in users`);
      return {isVerified: true, isAdmin: false}
    }

    return {isVerified: false, isAdmin: false}
  } catch (error: any){
    console.error('Error verifying:', error);
    return {isVerified: false, isAdmin: false}
  }
});



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
    user.password = await hashPassword(user.password);
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
    admin.password = await hashPassword(admin.password);
    await collection?.insertOne(admin);
    console.log("Successfully added a new admin");
    return {success: true};
  } catch (error: any){
    console.error('Error adding admin:', error);
    return {success: false};
  }
})

ipcMain.handle('get-user', async(_, user: User = {email: '', password: ''}) =>{
  try{
    if (!db){
      const connected = await connectToMongoDB();
      if (!connected) {
        console.log('Cannot connect to MongoDB in ipcMain:get-user, main.ts');
        return [];
      };
    }

    if (user.email === ''){
      const collection = db?.collection('users');
      const data = await collection?.find({}).toArray();
      console.log('Value is not inserted, showing all user');
      return data;
    }
    
    const collection = db?.collection('users');
    const data = await collection?.find({email: user.email}).toArray();
    return data;
  } catch(error){
    console.error('Error getting user:', error);
    return [];
  }
})

ipcMain.handle('get-admin', async(_, admin: Admin = {email: '', password: ''}) =>{
  try{
    if (!db){
      const connected = await connectToMongoDB();
      if (!connected) {
        console.log('Cannot connect to MongoDB in ipcMain:get-admin, main.ts');
        return [];
      };
    }

    if (admin.email === ''){
      const collection = db?.collection('admins');
      const data = await collection?.find({}).toArray();
      console.log('Value is not inserted, showing all admin');
      return data;
    }
    
    const collection = db?.collection('admins');
    const data = await collection?.find({email: admin.email}).toArray();
    return data;
  } catch(error){
    console.error('Error getting admin:', error);
    return [];
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





