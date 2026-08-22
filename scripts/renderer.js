// Elementos principales
const containerMain = document.getElementById("container")

// Elementos de las lista de muscia
const listaHTML = document.getElementById('lista');
const audioElement = document.getElementById('audio')
const btnNext = document.getElementById('btnNext')
const btnStop = document.getElementById('btnStop')
const btnBack = document.getElementById('btnBack')

// Elementos de la barra del repoductor
const barraReproductor  = document.getElementById('barra_reproductor')
const imgReproductor = document.getElementById('caratula')
const titleReproductor = document.getElementById('title_reproductor_music')
const containerCaratula = document.getElementById("container-caratula")
const containerBtnsBotton = document.getElementById("botton-btns")
const containerBtnsAdiccionales = document.getElementById("btns-adicionales")

// Elementos del reproductor expandido
const imgReproductorExpandida = document.getElementById('caratula-expandida')
const titleReproductorExpandido = document.getElementById('title-reproductor-music-expandido')
const containerCaratulaExpandida = document.getElementById("container-caratula-expandida")
const btnHideReproductor = document.getElementById("btn-hide-reproductor")

// Elemento del Home
const containerArchivosRuta = document.getElementById("archivos_ruta")
const carpetaSelcted = document.getElementById("carpeta-selcted")
const btnCambiarImg = document.getElementById('btnCambiarImg')
const ImgUserDefault = document.getElementById("img-user")
const btnSelectDirectory = document.getElementById("selectCarpeta")

// Elementos de la navegacion entre pantallas (Menu lateral)
const titleContainerSelected = document.getElementById("title-selected")
const menuContainerHome = document.getElementById("container_home")
const menuContainerLista = document.getElementById("container_lista")
const btnsMenuHome = document.getElementById('btnHome')
const btnsMenuLista = document.getElementById("btnLista")


// CARGAR PREFERENCIAS DEL USUARIO
const preference = {imgUserPath: ""}

const loadPreference = async () =>{
    preference.imgUserPath = await window.api.storeMod("get", {key:"img-user"});
    
    if(preference.imgUserPath){
        imgReproductorExpandida.src = preference.imgUserPath
        imgReproductor.src = preference.imgUserPath
        ImgUserDefault.src = preference.imgUserPath
    } 
}
loadPreference()


// NAVEGACION ENTRE PANTALLAS
let btnMenuActive = btnsMenuHome
let containerVisible = menuContainerHome

const navigateMenu = (ruta = 'home') => {
    const showContainer = (containerNew, btnNew, title) =>{
        if(containerNew == containerVisible) return

        titleContainerSelected.innerText = title

        containerNew.classList.remove('container-hide');
        containerVisible.classList.add('container-hide');
        containerVisible = containerNew

        btnNew.classList.add('item-active');
        btnMenuActive.classList.remove('item-active')
        btnMenuActive = btnNew
    }

    if(ruta == "home") showContainer(menuContainerHome, btnsMenuHome, "Home");
    else if(ruta == "lista") showContainer(menuContainerLista, btnsMenuLista, "Lista de canciones");
  
}

const expandirReproductor = () => {
    containerMain.classList.toggle('container-hide')
    barraReproductor.classList.toggle("expandir-barra")

    containerCaratula.classList.toggle("container-hide")
    containerCaratulaExpandida.classList.toggle("container-hide")
    containerCaratulaExpandida.classList.toggle("container-caratula-expandida")

    containerBtnsAdiccionales.classList.toggle('container-hide')
    containerBtnsBotton.classList.toggle("botton-btns-expandidos")
    audioElement.classList.toggle("audio-expandido")
}

btnsMenuHome.addEventListener('click',(event) => navigateMenu('home'));
btnsMenuLista.addEventListener('click', (event) => navigateMenu('lista'));


// FUNCIONES DE CONTROL DE LAS MUSICAS Y EL AUDIO
const listaMusic = []

let postMusicSelected = 0
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

const changeMusic = (pos = 0, click = false) =>{
    listaMusic[postMusicSelected].element.classList.remove("active")
    listaMusic[pos].element.classList.add('active')

    imgReproductor.src = listaMusic[pos].meta.image || preference.imgUserPath
    titleReproductor.innerText = listaMusic[pos].meta.title == "Título Desconocido"?listaMusic[pos].nameArchivo : listaMusic[pos].meta.title;
    imgReproductorExpandida.src = listaMusic[pos].meta.image || preference.imgUserPath
    titleReproductorExpandido.innerText = listaMusic[pos].meta.title == "Título Desconocido"?listaMusic[pos].nameArchivo : listaMusic[pos].meta.title;

    postMusicSelected = pos
    
    if(click) {
        expandirReproductor()
        btnStop.innerHTML = window.api.Icons.STOP
        stop = true
    }
}

const nextMusic = (event = null) =>{
    pos = lengthCircularList == (postMusicSelected + 1) ? 0 : postMusicSelected + 1;
    changeMusic(pos)
    reproducirMusic(listaMusic[pos].ruta)
}

const backMusic = (event = null) =>{
    pos = postMusicSelected == 0 ? lengthCircularList - 1: postMusicSelected - 1
    changeMusic(pos)
    reproducirMusic(listaMusic[pos].ruta)
}

const togleMusicAudio = (event = null) =>{
   
    stop = !stop
    if(stop){
       btnStop.innerHTML = window.api.Icons.STOP
       audioElement.play()
    }
    else {
      
       btnStop.innerHTML =  window.api.Icons.PLAY
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
    const pathDirectory = await window.api.storeMod("get", {key:"path"});
    const {archivos, ruta} = await window.api.listarArchivos(pathDirectory);
    const archivosAudio = archivos.filter(archivo => archivo.endsWith(".mp3"))

    let firstFile = 0

    listaHTML.innerHTML = ''; // Limpiamos la lista previa
    containerArchivosRuta.innerHTML = ``
    carpetaSelcted.innerText = pathDirectory

    if(archivosAudio.length == 0){
        containerArchivosRuta.innerHTML = `<p class="text-warning">No hay archivos de audio en la ruta actual</p>`
        listaHTML.innerHTML = `<p class="text-warning">No hay archivos de audio en la ruta actual</p>`
        return
    }

    for(let i=0; i<archivosAudio.length; i++){
        const archivo = archivosAudio[i];
        const meta = await window.api.readMetadata(`${ruta}/${archivo}`);
        const li = document.createElement('li');

        li.id = `${i}`

        if(meta.title == "Título Desconocido"){
            li.appendChild(createTarget('p', archivo, ["target-music-title"]))
            li.appendChild(createTarget('p', archivo, ["target-music"]))
        }else{
            li.appendChild(createTarget('p', meta.title, ["target-music-title"]))
            li.appendChild(createTarget('p', meta.album, ["target-music"]))
        }
        li.appendChild(createTarget('p', meta.duration, ["target-music"]))
        li.classList.add("item-lista")
        if(i%2 == 0) li.classList.add('item-par')

        li.addEventListener('click',(event)=>{
            changeMusic(i, true)
            reproducirMusic(`${ruta}/${archivo}`)
          })
        listaHTML.appendChild(li);

        listaMusic.push({
            element:li,
            ruta:`${ruta}/${archivo}`,
            meta:meta,
            nameArchivo:archivo
        })
        if(firstFile < 7){
            const liRuta = document.createElement('li')
            liRuta.innerText = archivo
            liRuta.classList.add("ruta-home-archivos")
            containerArchivosRuta.appendChild(liRuta);
            firstFile += 1;
        }
    }
    lengthCircularList = listaMusic.length
}

loadMusic()

btnNext.addEventListener("click", nextMusic)
btnStop.addEventListener('click',togleMusicAudio)
btnBack.addEventListener('click', backMusic)
audioElement.addEventListener("ended", nextMusic)
btnHideReproductor.addEventListener("click", expandirReproductor)
containerCaratula.addEventListener("click", expandirReproductor)


// FUNCIONES DEL HOME
btnCambiarImg.addEventListener('click', async () =>{
    const pathImage = await window.api.selectDirectory(
        window.api.propOpenFile,
        window.api.filters
    )
    if(pathImage != null){
        preference.imgUserPath = pathImage

        imgReproductorExpandida.src = preference.imgUserPath
        imgReproductor.src = preference.imgUserPath
        ImgUserDefault.src = preference.imgUserPath

        let resposnse = window.api.storeMod("set", {key:"img-user", value:pathImage})
    }
})

btnSelectDirectory.addEventListener("click", async () =>{
    const pathDirectory = await window.api.selectDirectory()
    if(pathDirectory != null){
        console.log(pathDirectory)
        const response = await window.api.storeMod("set", {key:"path", value:pathDirectory})
        if(response != null) await loadMusic()
    }
})


// EVENTOS DE LA VENTANA
document.addEventListener('keydown', (evento) => {
    switch (evento.key) {
        case 'ArrowLeft':
            backMusic()
            break;
        case 'ArrowRight':
            nextMusic()
            break;
        case " ":
            togleMusicAudio()
            break;
        case "Escape":
            if(containerMain.classList.contains("container-hide"))
                expandirReproductor() 
            break;  
    }  
});

