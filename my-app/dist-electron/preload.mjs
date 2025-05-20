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
  // You can expose other APTs you need here.
  // ...
  chooseImage: () => electron.ipcRenderer.invoke("choose-image"),
  verifyAccount: (email, password) => electron.ipcRenderer.invoke("verify-account", email, password),
  addUser: (email, password) => {
    console.log("Add user reach the bridge");
    return electron.ipcRenderer.invoke("add-user", email, password);
  },
  addAdmin: (email, password) => {
    console.log("Add admin reach bridge");
    return electron.ipcRenderer.invoke("add-admin", email, password);
  },
  getUser: (email) => {
    console.log("Get user reach bridge");
    return electron.ipcRenderer.invoke("get-user", email);
  },
  getAdmin: (email) => {
    console.log("Get admin reach bridge");
    return electron.ipcRenderer.invoke("get-admin", email);
  },
  addItem: (name, description, price, img, category, available, popularity) => {
    console.log("Add item reach bridge");
    return electron.ipcRenderer.invoke("add-item", name, description, price, img, category, available, popularity);
  }
});
