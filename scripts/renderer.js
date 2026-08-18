const listaHTML = document.getElementById('lista');
const audioElement = document.getElementById('audio')
const btnNext = document.getElementById('btnNext')
const btnStop = document.getElementById('btnStop')
const btnBack = document.getElementById('btnBack')
const imgReproductor = document.getElementById('caratula')


let postMusicSelected = 0
let circularList = null
let listRutaMusic = []
let lengthCircularList = 0
let stop = false


const reproducirMusic = (ruta) =>{
    try{
        const safePath = `file:///${ruta.replace(/\\/g, '/')}`;
        const encodedPath = encodeURI(safePath)

        audioElement.src = encodedPath
        audioElement.play()
    }catch(error){
      console.error(error)
      console.log("ruta fallida: ", ruta)
    }
}

const changeMusic = (post = 0, click = false) =>{
    circularList[postMusicSelected].classList.remove("active")
    circularList[post].classList.add('active')
    postMusicSelected = post
    
    if(click) {
      btnStop.innerText = "stop"
      stop = true
    }
}

const nextMusic = (event) =>{
    post = lengthCircularList == (postMusicSelected + 1) ? 0 : postMusicSelected + 1;
    changeMusic(post)
    reproducirMusic(listRutaMusic[post])
}

const backMusic = (event) =>{
    post = postMusicSelected == 0 ? lengthCircularList - 1: postMusicSelected - 1
    changeMusic(post)
    reproducirMusic(listRutaMusic[post])
}

const togleMusicAudio = (event) =>{
    stop = !stop
    if(stop){
       event.target.innerText = "stop"
       audioElement.play()
    }
    else {
      event.target.innerText = "play"
      audioElement.pause()
    }
}

const createTarget = (targetName = '', value = '', classList = []) => {
    const target = document.createElement(targetName)
    target.innerText = value
    classList.forEach(classAdd => {
        target.classList.add(classAdd)
    });

    return target
}


const loadMusic = async () =>{
    const {archivos, ruta} = await window.api.listarArchivos();
    const archivosAudio = archivos.filter(archivo => archivo.endsWith(".mp3"))

    listaHTML.innerHTML = ''; // Limpiamos la lista previa
    
    for(let i=0; i<archivosAudio.length; i++){
        let archivo = archivosAudio[i];

        const {title, album, duration, image} = await window.api.readMetadata(`${ruta}/${archivo}`);
        const li = document.createElement('li');
        li.id = `${i}`


        if(title == "Título Desconocido"){
            li.appendChild(createTarget('p', archivo, ["target-music-title"]))
            li.appendChild(createTarget('p', archivo, ["target-music"]))
        }else{
            li.appendChild(createTarget('p', title, ["target-music-title"]))
            li.appendChild(createTarget('p', album, ["target-music"]))
        }
        li.appendChild(createTarget('p', duration, ["target-music"]))

        li.classList.add("item-lista")
        if(i%2 == 0) li.classList.add('item-par')


        li.addEventListener('click',(event)=>{
            // window.location = "reproductor.html"
            // window.sessionStorage.setItem("music-title", `${ruta}/${archivo}`)
            changeMusic(i, true)
            reproducirMusic(`${ruta}/${archivo}`)
          })
        listRutaMusic.push(`${ruta}/${archivo}`)
        listaHTML.appendChild(li);
    }

    circularList = document.getElementById("lista").getElementsByTagName("li")
    lengthCircularList = circularList.length
}


loadMusic()

btnNext.addEventListener("click", nextMusic)
btnStop.addEventListener('click',togleMusicAudio)
btnBack.addEventListener('click', backMusic)
