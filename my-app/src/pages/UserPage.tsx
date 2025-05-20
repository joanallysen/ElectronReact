import React from "react"

type PageName = 'userPage' | 'adminPage' | 'loginPage';

export default function UserPage({onChangePage}:{onChangePage: (p: PageName) => void}){
    
    
    return (
        <>
        <h1>Current: User Page</h1>
        <button onClick={() => onChangePage('loginPage')}>Go to User Page</button>
        <div className="item-container">

        </div>
        </>
    )
}

