import {useState} from 'react';
import {User} from '../types/user'
import {Admin} from '../types/admin'

import LoginForm from '../component/LoginForm'

type PageName = 'userPage' | 'adminPage' | 'loginPage';
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
        window.electronAPI.addAdmin(email, password);
    } else if(!isAdmin){
        console.log('Adding new user...');
        window.electronAPI.addUser(email, password);
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

export default function LoginPage({onChangePage} : {onChangePage: (p:PageName) => void}){

    const [users, setUsers] = useState<User[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);

    const handleGetUser = async () => {
        console.log("Getting users...");
        const users = await window.electronAPI.getUser('');
        console.log('Received users in UI: ', users);
        setUsers(users);
    }

    const handleGetAdmin = async () => {
        console.log("Getting users...");
        const admins = await window.electronAPI.getAdmin('');
        console.log('Received admins in UI: ', admins);
        setAdmins(admins);
    }


    return(
        <>
            <div>
                <LoginForm onChangePage={onChangePage}></LoginForm>
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
            </div>
        </>
    )
}