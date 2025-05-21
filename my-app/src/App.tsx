import { ReactNode, useState, useEffect, useContext, createContext } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/electron-vite.animate.svg'

import {User} from './types/user';
import {Admin} from './types/admin';
import {Item} from './types/item';

declare global {
  interface Window {
    electronAPI: {
      verifyAccount: (email: string, password: string) => {isVerified: boolean, isAdmin: boolean};
      addUser: (email: string, password: string) => void;
      addAdmin: (email: string, password: string) => void;
      getUser: (email:string) => User[]; // no argument gonna show all user
      getAdmin: (email:string) => Admin[]; // no argument gonna show all user

      addItem: (name:string, description: string, price: number, img: {mime: string, data: string}, category:string, available: boolean, popularity: number) => void;
      chooseImage: () => {mime:string, data:string};

      getItem: (category:string, search: string) => Item[];
    };
  }

  type PageName = 'userPage' | 'adminPage' | 'loginPage';
}



import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';


function App() {
  const [page, setPage] = useState<PageName>('loginPage');
  function handleChangePage(pageName: PageName){
    console.log('Page changed to ', pageName);
    setPage(pageName);
  }

  return (
    <div className='justify-center text-center flex-col'>
      {page == 'loginPage' && <LoginPage onChangePage={handleChangePage}/>}
      {page == 'adminPage' && <AdminPage onChangePage={handleChangePage} />}
      {page == 'userPage' && <UserPage onChangePage={handleChangePage} />}
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
