import { ipcRenderer, contextBridge } from 'electron'

import {User} from '../types/user'
import {Admin} from '../types/admin'
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  // main tell UI to change
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },

  // removing event listener
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },

  // UI tell main to do something
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },

  // UI tell main to do something but expect a reply.
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  saveTask: (task:string) => ipcRenderer.send('save-task', task),
  // You can expose other APTs you need here.
  // ...
  verifyAccount: (email:string, password: string) => ipcRenderer.invoke('verify-account', email, password),
  addUser:(user: User) => {
    console.log('Add user reach the bridge');
    return ipcRenderer.invoke('add-user', user)
  },
  addAdmin:(admin: Admin) => {
    console.log('Add admin reach bridge');
    return ipcRenderer.invoke('add-admin', admin)
  },
  getUser: (user: User) => {
    console.log('Get user reach bridge');
    return ipcRenderer.invoke('get-user', user);
  },
  getAdmin: (admin: Admin) => {
    console.log('Get admin reach bridge');
    return ipcRenderer.invoke('get-admin', admin);
  }
})
