import { ipcRenderer, contextBridge } from 'electron'

import {User} from '../src/types/user'
import {Admin} from '../src/types/admin'
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

  // You can expose other APTs you need here.
  // ...
  chooseImage: () => ipcRenderer.invoke('choose-image'),
  verifyAccount: (email:string, password: string) => ipcRenderer.invoke('verify-account', email, password),
  addUser:(email: string, password: string) => {
    console.log('Add user reach the bridge');
    return ipcRenderer.invoke('add-user', email, password)
  },
  addAdmin:(email: string, password: string) => {
    console.log('Add admin reach bridge');
    return ipcRenderer.invoke('add-admin', email, password)
  },
  getUser: (email: string) => {
    console.log('Get user reach bridge');
    return ipcRenderer.invoke('get-user', email);
  },
  getAdmin: (email: string) => {
    console.log('Get admin reach bridge');
    return ipcRenderer.invoke('get-admin', email);
  },
  addItem: (name:string, description: string, price: number, img: {mime: string, data: string}, category:string, available: boolean, popularity: number) => {
    console.log('Add item reach bridge');
    return ipcRenderer.invoke('add-item', name, description, price, img, category, available, popularity);
  }
})
