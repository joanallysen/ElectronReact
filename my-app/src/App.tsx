import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/electron-vite.animate.svg'
import './App.css'

import {User} from '../types/user'
import {Admin} from '../types/admin'

declare global {
  interface Window {
    electronAPI: {
      saveTask: (task: string) => void;
      accessDatabase: (email: string, password: string) => void;
      addUser: (user: User) => void;
      addAdmin: (admin: Admin) => void;
    };
  }
}

function Debugform({isAdmin}: {isAdmin: boolean}){
  const [email, setEmail] = useState('');
  const [password, setPassword]= useState('');

  let text = 'user';
  if(isAdmin){
    text = 'admin';
  }

  const handleAdd = () =>{
    if (email.trim() === '' || password.trim() === '') {
      console.log('Email or password is empty!');
      return;
    }

      if(isAdmin){
        console.log('Adding new admin...');
        window.electronAPI.addAdmin({email, password});
    } else if(!isAdmin){
        console.log('Adding new user...');
        window.electronAPI.addUser({email, password});
    }

    setEmail('');
    setPassword('');
  }

  return(
    <div>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={`Enter new ${text} email...`}
        />
        <input 
          type="text" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={`Enter new ${text} password...`}
        />

        <button onClick={handleAdd}>
          Add new {text}
        </button>
      </div>
  )
}

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword]= useState('');


  // const addTask = () => {
  //   if (input.trim() === '') return;
  //   setTasks([...tasks, input.trim()]);
  //   window.electronAPI.saveTask(input.trim());
  //   setInput('');
  // };

  // const deleteTask = (index: number) => {
  //   setTasks(tasks.filter((_, i) => i !== index));
  // };

  const sendPasswordAndEmail = () => {
    if (email.trim() === '' || password.trim() === '') return;
    window.electronAPI.accessDatabase(email.trim(), password.trim());
    setEmail('');
    setPassword('');
  }

  return (
    <div>
      <h1>🗝️ Login Page</h1>
      <div>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email..."
        />
        <input 
          type="text" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Enter password...'
        />

        <button onClick={sendPasswordAndEmail}>
          Add
        </button>
      </div>

      <h1>🗝️ Debug Section</h1>
      <Debugform isAdmin={true}></Debugform>
      <Debugform isAdmin={false}></Debugform>


      {/* <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((task, index) => (
          <li key={index} style={{ marginBottom: '0.5rem' }}>
            {task}
            <button
              onClick={() => deleteTask(index)}
              style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul> */}
    </div>
  );
}

export default App;