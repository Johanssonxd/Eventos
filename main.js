const cards = document.querySelectorAll('.card');
const btnReset = document.getElementById('btn-reset');

let draggedCard = null; // Las manos estarán libres mientras no se arrastre un elemento
let shiftX = 0, shiftY = 0; // Anclaje del cursor 
let lastMouseX = 0; // Ultimo punto en X para efecto de movimiento al arrastrar

cards.forEach(card => {
    card.addEventListener('mousedown', iniciarArrastre);
});

function iniciarArrastre(e) {
    e.preventDefault(); 
    
    draggedCard = this;
    lastMouseX = e.clientX;
    const rect = draggedCard.getBoundingClientRect();
    shiftX = e.clientX - rect.left;
    shiftY = e.clientY - rect.top;
    
    // Fijar ancho y alto antes de sacarla del contenedor
    draggedCard.style.width = rect.width + 'px';
    draggedCard.style.height = rect.height + 'px';
    draggedCard.classList.add('drag');
    
    document.body.appendChild(draggedCard);
    
    moverTarjeta(e.clientX, e.clientY);
    document.addEventListener('mousemove', arrastrar);
    document.addEventListener('mouseup', soltarTarjeta);
}

function moverTarjeta(clientX, clientY) {
    // Valores relativos a la ventana
    draggedCard.style.left = (clientX - shiftX) + 'px';
    draggedCard.style.top = (clientY - shiftY) + 'px';
}

function arrastrar(e) {
    if (!draggedCard) return; // Si se mueve el ratón pero con manos "vacías" se evita la función.
    
    moverTarjeta(e.clientX, e.clientY);
    let deltaX = e.clientX - lastMouseX;
    let inclinacion = deltaX * 0.5;
    
    // Limite de 20°
    if (inclinacion > 20) inclinacion = 20;
    if (inclinacion < -20) inclinacion = -20;
    draggedCard.style.transform = `rotate(${inclinacion}deg) scale(1.05)`;
    lastMouseX = e.clientX;
}

function soltarTarjeta(e) {
    document.removeEventListener('mousemove', arrastrar); // Se "apagan" los eventos anteriores
    document.removeEventListener('mouseup', soltarTarjeta);
    if (!draggedCard) return;
    
    draggedCard.style.display = 'none';
    let elementoDebajo = document.elementFromPoint(e.clientX, e.clientY);
    draggedCard.style.display = 'block';
    
    let zonaDestino = elementoDebajo ? elementoDebajo.closest('.zone') : null;
    procesarMovimiento(draggedCard, zonaDestino, actualizarContadores); // Especifíca que tarjeta se "soltó", en donde y se actualiza el contador de cada columna.
}

function procesarMovimiento(tarjeta, zonaDestino, callback) {
    tarjeta.classList.remove('drag');
    
    // Limpiar todas las propiedades de arrastre
    tarjeta.style.position = '';
    tarjeta.style.left = '';
    tarjeta.style.top = '';
    tarjeta.style.transform = '';
    tarjeta.style.width = '';  
    tarjeta.style.height = ''; 
    
    if (zonaDestino) {
        const contenidoZona = zonaDestino.querySelector('.zone-content');
        contenidoZona.appendChild(tarjeta);
    } else {
        document.querySelector('#zone-list .zone-content').appendChild(tarjeta);
    }
    
    tarjeta.classList.add('rebote');
    
    tarjeta.addEventListener('animationend', () => {
        tarjeta.classList.remove('rebote'); // se quita la clase "rebote" para que otro evento la aproveche 
    }, { once: true });
    
    draggedCard = null; 
    
    if (typeof callback === 'function') {
        callback();
    }
}

// CALLBACK -> Actualización de contenedores
function actualizarContadores() {

    // Cuántos elementos '.card' existen dentro de cada columna
    const totalList = document.querySelectorAll('#zone-list .card').length;
    const totalHacer = document.querySelectorAll('#zone-hacer .card').length;
    const totalDone = document.querySelectorAll('#zone-done .card').length;
    
    // Sobrescribimos el texto en el HTML
    document.getElementById('contador-list').innerText = totalList;
    document.getElementById('contador-hacer').innerText = totalHacer;
    document.getElementById('contador-done').innerText = totalDone;
}

// BOTÓN DE REINICIO
btnReset.addEventListener('click', () => {
    const zonaLista = document.querySelector('#zone-list .zone-content');
    const todasLasTarjetas = document.querySelectorAll('.card');
    
    todasLasTarjetas.forEach((tarjeta, index) => { //Devuelve todas las tarjetas al inicio
        setTimeout(() => {
            zonaLista.appendChild(tarjeta);
            tarjeta.classList.add('rebote');
            
            tarjeta.addEventListener('animationend', () => {
                tarjeta.classList.remove('rebote');
            }, { once: true });
            
        }, index * 300); 
    });
    
    // Actualiza contadores después de que todo se haya movido
    setTimeout(actualizarContadores, todasLasTarjetas.length * 100);
});