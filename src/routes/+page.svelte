<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    const meses = [
        "enero","febrero","marzo","abril","mayo","junio",
        "julio","agosto","septiembre","octubre","noviembre","diciembre"
    ];

    let mesesVotados = [];
    let startX = 0;
    let endX = 0;
    const SWIPE_THRESHOLD = 40;
    let currentIndex = 0;
    let autoPlay = true;
    let inactivityTimer = null;
    const AUTO_PLAY_DELAY = 1400;
    const INACTIVITY_RESET = 3500;

    let usuario = '';
    let mostrarResultados = false;

    // Manejo de touch / swipe
    function handleTouchStart(event) {
        autoPlay = false;
        clearTimeout(inactivityTimer);
        startX = event.touches[0].clientX;
    }

    function handleTouchEnd(event) {
        endX = event.changedTouches[0].clientX;
        handleSwipe();
        inactivityTimer = setTimeout(() => {
            autoPlay = true;
        }, INACTIVITY_RESET);
    }

    function handleSwipe() {
        const diff = startX - endX;
        if (Math.abs(diff) < SWIPE_THRESHOLD) return;
        if (diff > 0) {
            currentIndex = (currentIndex + 1) % meses.length;
        } else {
            currentIndex = (currentIndex - 1 + meses.length) % meses.length;
        }
    }

    function goToMonth(mes) {
        if (mesesVotados.includes(mes.toLowerCase())) return;
        goto(`/mes/${mes}`);
    }

    function stopAutoPlay() {
        autoPlay = false;
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            autoPlay = true;
        }, INACTIVITY_RESET);
    }

    function iniciarLoopCarrusel() {
        const loop = () => {
            if (autoPlay) currentIndex = (currentIndex + 1) % meses.length;
            setTimeout(loop, AUTO_PLAY_DELAY);
        };
        loop();
    }

    function checkTodosVotados() {
        mostrarResultados = mesesVotados.length === meses.length;
    }

    function irResultados() {
        goto('/resultados'); // página de resultados
    }

    async function cargarMesesVotados(usuarioId) {
        try {
            const res = await fetch(`https://backenddddd-ws89.onrender.com/api/meses-votados/?usuario_id=${usuarioId}`);
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data)) {
                mesesVotados = data.map(m => m.toLowerCase().trim());
            } else {
                mesesVotados = [];
            }
            // Combinar con localStorage
            const mesesGuardados = JSON.parse(localStorage.getItem('meses_votados') || '[]');
            mesesVotados = Array.from(new Set([...mesesVotados, ...mesesGuardados.map(m => m.toLowerCase().trim())]));
            checkTodosVotados();
        } catch(e) {
            console.error('Error cargando meses votados', e);
        }
    }

    onMount(async () => {
        // Solicitar nombre obligatorio
        let nombreGuardado = localStorage.getItem('usuario_nombre');
        while (!nombreGuardado) {
            nombreGuardado = prompt('¡Hola! Debes ingresar tu nombre para continuar:')?.trim();
        }
        localStorage.setItem('usuario_nombre', nombreGuardado);
        usuario = nombreGuardado;

        // Iniciar loop del carrusel
        iniciarLoopCarrusel();

        // Crear usuario en backend si no existe
        let usuarioIdGuardado = localStorage.getItem('usuario_id');
        if (!usuarioIdGuardado) {
            try {
                const res = await fetch('https://backenddddd-ws89.onrender.com/api/usuarios/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: nombreGuardado })
                });
                const data = await res.json();
                usuarioIdGuardado = data.id;
                localStorage.setItem('usuario_id', usuarioIdGuardado);
            } catch (e) {
                console.error('Error creando usuario en backend', e);
                alert('No se pudo crear tu usuario. Recarga la página.');
                return;
            }
        }

        // Cargar meses votados
        if (usuarioIdGuardado) {
            await cargarMesesVotados(usuarioIdGuardado);
        }
    });
</script>

<style>
    /* 🎨 Fondo estilo Spotify Wrapped */
    .screen {
        min-height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
            135deg,
            #6a00ff,
            #1125d8ff,
            #03ffffff
        );
        background-size: 400% 400%;
        animation: gradientMove 12s ease infinite;
        overflow: hidden;
        color: white;
        text-align: center;
        font-family: 'Inter', system-ui, sans-serif;
    }

    @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    /* 🧠 Texto */
    .title {
        font-size: 1.6rem;
        font-weight: 900;
        margin-bottom: 0.3rem;
        letter-spacing: -0.02em;
    }

    .subtitle {
        font-size: 0.9rem;
        opacity: 0.85;
        margin-bottom: 1.2rem;
    }

    /* 🎠 Carrusel */
    .carousel {
        perspective: 1200px;
        width: 100%;
        height: 420px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .card {
        width: min(75vw, 280px);
        height: min(105vw, 380px);
        position: absolute;
        top: 50%;
        left: 50%;
        transform-style: preserve-3d;
        transition: transform 0.9s cubic-bezier(.2,.8,.2,1), opacity 0.9s;
        cursor: pointer;
    }

    .card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 18px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.35);
    }

    .bloqueado {
        pointer-events: none;
        filter: grayscale(1) brightness(0.6);
    }

    .check {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #22c55e;
        color: white;
        font-weight: 900;
        border-radius: 50%;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 16px rgba(0,0,0,0.4);
    }

    .hint {
        font-size: 0.75rem;
        opacity: 0.7;
        margin-top: 1rem;
    }
</style>

<div class="screen">
    <div class="title">Nuestras salidas del año ✨</div>
    <div class="subtitle">
        {usuario ? `¡Hola ${usuario}! Revivamos cada mes como un recuerdo épico` : 'Revivamos cada mes como un recuerdo épico'}
    </div>

    <div 
        class="carousel"
        on:touchstart={handleTouchStart}
        on:touchend={handleTouchEnd}
        on:mousedown={stopAutoPlay}
    >
        {#each meses as mes, i}
            {#if Math.abs(i - currentIndex) <= 2 || Math.abs(i - currentIndex) >= meses.length - 2}
                <div
                    class="card"
                    on:click={() => goToMonth(mes)}
                    class:bloqueado={mesesVotados.includes(mes.toLowerCase())}
                    style="
                        transform:
                            translate(-50%, -50%)
                            translateX({(i - currentIndex) * 130}px)
                            scale({1 - Math.abs(i - currentIndex) * 0.15})
                            rotateY({(i - currentIndex) * -28}deg);
                        opacity: {1 - Math.abs(i - currentIndex) * 0.3};
                        z-index: {100 - Math.abs(i - currentIndex)};
                    "
                >
                    <img src={`/meses/${mes}.jpg`} alt={mes} />
                    {#if mesesVotados.includes(mes.toLowerCase())}
                        <div class="check">✔</div>
                    {/if}
                </div>
            {/if}
        {/each}

        {#if mostrarResultados}
            <div
                class="card"
                on:click={() => goto('/resultados')}
                style="
                    transform: translate(-50%, -50%) translateX(0px) scale(1) rotateY(0deg);
                    opacity: 1;
                    z-index: 200;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 1.3rem;
                    background: #ff9900;
                    border-radius: 18px;
                    cursor: pointer;
                "
            >
                🎉 Ver resultados
            </div>
        {/if}
    </div>

    <div class="hint">
        Toca una tarjeta para abrir el mes 🎉
    </div>
</div>