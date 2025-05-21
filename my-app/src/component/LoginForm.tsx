import {useEffect, useState} from "react";

type PageName = 'userPage' | 'adminPage' | 'loginPage';


export default function LoginForm({onChangePage} : {onChangePage: (p: PageName) => void}){
  const [email, setEmail] = useState('');
  const [password, setPassword]= useState('');
  const [status, setStatus] = useState({success: false, isAdmin: false,  attempted: false});

  const handleVerifyAccount = async () => {
    if (email.trim() === '' || password.trim() === '') return;
    const result = await window.electronAPI.verifyAccount(email.trim(), password.trim());
    console.log(result.isVerified, result.isAdmin);
    setStatus({success: result.isVerified, isAdmin: result.isAdmin, attempted:true});
    setEmail('');
    setPassword('');
  };

  useEffect(() => {
    if (status.attempted && status.success) {
      if (status.isAdmin) {
        onChangePage('adminPage');
      } else {
        onChangePage('userPage');
      }
    }
  }, [status, onChangePage]); // runs whenever status or onChangePage changes



  return (
    <div className="flex flex-col justify-center text-center gap-5.5 m-auto w-80">
      <h1 className="text-black"> Login. </h1>
      <div className="flex flex-col gap-1.5">
        <div>
          <p className="text-left">Email</p>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email..."
            className="border-2 rounded-2xl p-2 w-full"
          />
        </div>
          
        <div>
          <p className="text-left">Password</p>
          <input 
            type="text" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Enter password...'
            className="border-2 rounded-2xl p-2 w-full"
          />

          <button className="p-1.5 border-amber-950 .text-white" onClick={handleVerifyAccount}>
            Log in
          </button>
        </div>
          

        </div>

        {
          status.attempted && (
            status.success ? (
                status.isAdmin ? (
                    <h3>Admin account found and verified</h3>
                ) : (
                    <h3>User account found and verified</h3>
                )
            ) : (
                <h3>Account Verification failed</h3>
            )
          )
        }
    </div>
  );
}
