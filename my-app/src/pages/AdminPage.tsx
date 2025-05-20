import {useState} from "react"

export default function AdminPage({onChangePage}: {onChangePage:(p: PageName) => void}){
    const [imgSrc, setImgSrc] = useState<string>('');
    let currentPicture : {mime: string, data: Buffer};
    const chooseImage = async () =>{
        const result = await window.electronAPI.chooseImage();
        if (result){
            console.log('Image selected', result.mime, result.data);
            currentPicture = {mime: result.mime, data: result.data};
            setImgSrc(`data:${result.mime};base64,${result.data}`);
        }
    }

    const handleAddItem = async () =>{
        await window.electronAPI.addItem(
            'default name',
            'default description',
            0.00,
            currentPicture, 
            'default category',
            true,
            5,        
        );
    }

    return (
        <>
        <h1>Current: Admin Page</h1>
        <button onClick={chooseImage}></button>
        <img src={imgSrc} alt="Uploaded" />
        <button onClick={handleAddItem}></button>
        </>
    )
}