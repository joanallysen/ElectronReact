import {useState} from "react"

export default function AdminPage({onChangePage}: {onChangePage:(p: PageName) => void}){
    const [imgSrc, setImgSrc] = useState<string>('');
    const [imgData, setImgData] = useState<{mime: string; data: string}>({mime: '', data: ''});
    // Buffer is undefined on frontend
    const [imgBuffer, setImgBuffer] = useState<string>('');
    const chooseImage = async () =>{
        const result = await window.electronAPI.chooseImage();
        if (result){
            console.log('Image selected', result.mime, result.data);
            setImgSrc(`data:${result.mime};base64,${result.data}`);
            setImgData({mime: result.mime, data: result.data});
        }
    }

    const handleAddItem = async () =>{
        console.log(`adding`);
        await window.electronAPI.addItem(
            'default name',
            'default description',
            0.00,
            imgData,
            'default category',
            true,
            5,
        );
    }

    return (
        <>
        <h1>Current: Admin Page</h1>
        <div style={{'display':'flex', 'justifyContent':'center', 'textAlign':'center', 'flexDirection':'column'}}>
            <button onClick={chooseImage}>Choose Image</button>
            <img src={imgSrc} alt="Uploaded" style={{'width': '50%', 'maxHeight':'55rem', 'margin':'auto'}}/>
            <button onClick={handleAddItem}>Add Item</button>
        </div>

        </>
    )
}