import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/electron-vite.animate.svg'
import './App.css'

import {User} from '../types/user'
import {Admin} from '../types/admin'

declare global {
  interface Window {
    electronAPI: {
      verifyAccount: (email: string, password: string) => {isVerified: boolean, isAdmin: boolean};
      addUser: (user: User) => void;
      addAdmin: (admin: Admin) => void;
      getUser: (user?: User) => User[]; // no argument gonna show all user
      getAdmin: (admin?: Admin) => Admin[]; // no argument gonna show all user
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
    <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', flexDirection: 'row', gap: '2rem'}}>
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

function LoginForm(){
  const [email, setEmail] = useState('');
  const [password, setPassword]= useState('');
  const [status, setStatus] = useState({success: false, attempted: false});

  const handleVerifyAccount = async () => {
    if (email.trim() === '' || password.trim() === '') return;
    const isVerifiedAndAttempted = {success: (await window.electronAPI.verifyAccount(email.trim(), password.trim())).isVerified, attempted: true};
    console.log(isVerifiedAndAttempted.success, isVerifiedAndAttempted.attempted);
    setStatus(isVerifiedAndAttempted);
    setEmail('');
    setPassword('');
  }

  return (
    <div>
      <h1> Verifying Page 🗝️</h1>
      <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', flexDirection: 'row', gap: '2rem'}}>
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

          <button onClick={handleVerifyAccount}>
            Log in
          </button>

        </div>
        {status.attempted && (
          status.success ? (
            <h3>Account found and verified!</h3>
          ) : (
            <h3>Email or password is wrong!</h3>
          )
        )}
      </div>
  );
}

function App() {

  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);

  

  const handleGetUser = async () => {
    console.log("Getting users...");
    const users = await window.electronAPI.getUser();
    console.log('Received users in UI: ', users);
    setUsers(users);
  }

  const handleGetAdmin = async () => {
    console.log("Getting users...");
    const admins = await window.electronAPI.getAdmin();
    console.log('Received admins in UI: ', admins);
    setAdmins(admins);
  }

  return (
    <div>
      <LoginForm></LoginForm>
      <h1> Debug Section 🐛</h1>
      <Debugform isAdmin={true}></Debugform>
      <Debugform isAdmin={false}></Debugform>
      
      <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', flexDirection: 'row', gap: '2rem'}}>
        <ul>
          <h3>Users: </h3>
          {users.map((user, index) =>{
            return <li key={index}>{user.email} {user.password}</li>
          })}
          <button onClick={handleGetUser}>Refresh User</button>
        </ul>

        <ul>
          <h3>Admins: </h3>
          {admins.map((admin, index) =>{
            return <li key={index}>{admin.email} {admin.password}</li>
          })}
          <button onClick={handleGetAdmin}>Refresh Admin</button>
        </ul>
      </div>
      

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

  // const addTask = () => {
  //   if (input.trim() === '') return;
  //   setTasks([...tasks, input.trim()]);
  //   window.electronAPI.saveTask(input.trim());
  //   setInput('');
  // };

  // const deleteTask = (index: number) => {
  //   setTasks(tasks.filter((_, i) => i !== index));
  // };
