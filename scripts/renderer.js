const listaHTML = document.getElementById('lista');
const audioElement = document.getElementById('audio')
const btnNext = document.getElementById('btnNext')
const btnStop = document.getElementById('btnStop')
const btnBack = document.getElementById('btnBack')

const imgReproductor = document.getElementById('caratula')
const titleReproductor = document.getElementById('title_reproductor_music')

const imgReproductorExpandida = document.getElementById('caratula-expandida')
const titleReproductorExpandido = document.getElementById('title-reproductor-music-expandido')


const barraReproductor  = document.getElementById('barra_reproductor')

const containerMain = document.getElementById("container")
const containerCaratula = document.getElementById("container-caratula")
const containerCaratulaExpandida = document.getElementById("container-caratula-expandida")
const containerBtnsBotton = document.getElementById("botton-btns")
const containerBtnsAdiccionales = document.getElementById("btns-adicionales")
const btnHideReproductor = document.getElementById("btn-hide-reproductor")

let postMusicSelected = 0
let lengthCircularList = 0
let stop = false
const listaMusic = []

const expandirReproductor = () => {
    containerMain.classList.toggle('container-hide')
    barraReproductor.classList.toggle("expandir-barra")

    containerCaratula.classList.toggle("container-hide")
    containerCaratulaExpandida.classList.toggle("container-hide")
    containerCaratulaExpandida.classList.toggle("container-caratula-expandida")

    containerBtnsAdiccionales.classList.toggle('container-hide')
    containerBtnsBotton.classList.toggle("botton-btns-expandidos")
}



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

    imgReproductor.src = listaMusic[pos].meta.image
    titleReproductor.innerText = listaMusic[pos].meta.title == "Título Desconocido"?listaMusic[pos].nameArchivo : listaMusic[pos].meta.title;
    imgReproductorExpandida.src = listaMusic[pos].meta.image
    titleReproductorExpandido.innerText = listaMusic[pos].meta.title == "Título Desconocido"?listaMusic[pos].nameArchivo : listaMusic[pos].meta.title;

    postMusicSelected = pos
    
    if(click) {
        expandirReproductor()
        btnStop.innerHTML = window.api.Icons.STOP
        stop = true
    }
}

const nextMusic = (event) =>{
    pos = lengthCircularList == (postMusicSelected + 1) ? 0 : postMusicSelected + 1;
    changeMusic(pos)
    reproducirMusic(listaMusic[pos].ruta)
}

const backMusic = (event) =>{
    pos = postMusicSelected == 0 ? lengthCircularList - 1: postMusicSelected - 1
    changeMusic(pos)
    reproducirMusic(listaMusic[pos].ruta)
}

const togleMusicAudio = (event) =>{
   
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
    const {archivos, ruta} = await window.api.listarArchivos();
    const archivosAudio = archivos.filter(archivo => archivo.endsWith(".mp3"))

    listaHTML.innerHTML = ''; // Limpiamos la lista previa
    
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






// NAVEGACION ENTRE PANTALLAS

const titleContainerSelected = document.getElementById("title-selected")
const menuContainer = {
    home: document.getElementById("container_home"),
    lista: document.getElementById("container_lista")
}
const btnsMenu = {
    home: document.getElementById('btnHome'),
    lista: document.getElementById("btnLista")
}
let btnMenuActive = btnsMenu.home
let containerVisible = menuContainer.home


btnsMenu.home.addEventListener('click',(event) => navigateMenu('home'));
btnsMenu.lista.addEventListener('click', (event) => navigateMenu('lista'))


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
    switch(ruta){
        case "home":
            showContainer(menuContainer.home, btnsMenu.home, "Home");
            break;
        case "lista":
            showContainer(menuContainer.lista, btnsMenu.lista, "Lista de canciones");
    }
}







