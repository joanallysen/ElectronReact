"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // main tell UI to change
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  // removing event listener
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  // UI tell main to do something
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  // UI tell main to do something but expect a reply.
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  saveTask: (task) => electron.ipcRenderer.send("save-task", task),
  // You can expose other APTs you need here.
  // ...
  accessDatabase: (email, password) => electron.ipcRenderer.send("access-database", email, password),
  addUser: (user) => {
    console.log("Add user reach the bridge");
    electron.ipcRenderer.invoke("add-user", user);
  },
  addAdmin: (admin) => {
    console.log("Add admin reach bridge");
    electron.ipcRenderer.invoke("add-admin", admin);
  }
});
