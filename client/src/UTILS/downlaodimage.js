import FileSaver from 'file-saver'
export const  downloadImage = async(_id,photo)=>{    
    FileSaver.saveAs(photo,`download-${_id}.jpg`)
}