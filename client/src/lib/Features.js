const fileFormat = (url='') => {
    
    const fileExt = url.split('.').pop();
    
    // y tino supported h video ko browser p chalne p
    if(fileExt === 'mp4' || fileExt === 'webm' || fileExt === 'ogg')   
      return 'video'
      
      
    if(fileExt === 'mp4' || fileExt === 'wav') 
    return 'audio'
    
    
    if(fileExt === 'png' || fileExt === 'jpg' || fileExt === 'jpeg' || fileExt==='gif')
    return 'image'
    
    //  return file;
}
export {fileFormat}