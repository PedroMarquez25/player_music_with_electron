const musicTitleElement = document.getElementById("title-music")
const musicImg = document.getElementById("caratula")
const musicAudio = document.getElementById("audio")

const musicRuta = window.sessionStorage.getItem("music-title")

const safePath = `file:///${musicRuta.replace(/\\/g, '/')}`;
const encodedPath = encodeURI(safePath)


musicAudio.src = encodedPath
musicAudio.play()

const readMeta = async () =>{
    try{  
        const {title, dutarion, image, album} = await window.api.readMetadata(musicRuta)
        console.log("title: ", title)
        console.log("album: ", album)
    
        musicTitleElement.innerText = title
    
        if(image){
            musicImg.src = image
        }else{
            musicImg.src = "C:/Users/PC/Pictures/Fondos de pantalla/house.jpg"
        }
    
    
    }catch(error){
        console.log(error)
    }

  
}

readMeta()