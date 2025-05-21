import {useState, useEffect} from "react"

type PageName = 'userPage' | 'adminPage' | 'loginPage';

import {Item} from '../types/item';

export default function UserPage({onChangePage}:{onChangePage: (p: PageName) => void}){
    // todo search
    const [items, setItems] = useState<Item[]>()
    const handleGetItems = async (category:string, search:string) => {
        setItems(await window.electronAPI.getItem(category, search));
    }
    
    useEffect(() =>{
        handleGetItems('default category', '');
    }, [])

    return (
        <>
        <h1>Current: User Page</h1>
        <button onClick={() => onChangePage('loginPage')}>Go to User Page</button>
        <div style={{'display':'grid'}}>
            <div sty></div>
        </div>
        </>
    )
}

