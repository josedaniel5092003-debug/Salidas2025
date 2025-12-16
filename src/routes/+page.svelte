<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    const meses = [
        "enero","febrero","marzo","abril","mayo","junio",
        "julio","agosto","septiembre","octubre","noviembre","diciembre"
    ];

    let startX = 0;
let endX = 0;

function handleTouchStart(event) {
    stopAutoPlay();
    startX = event.touches[0].clientX;
}

function handleTouchEnd(event) {
    endX = event.changedTouches[0].clientX;
    handleSwipe();
}

function handleSwipe() {
    const diff = startX - endX;

    if (Math.abs(diff) < SWIPE_THRESHOLD) return;

    if (diff > 0) {
        // swipe izquierda → siguiente
        currentIndex = (currentIndex + 1) % meses.length;
    } else {
        // swipe derecha → anterior
        currentIndex =
            (currentIndex - 1 + meses.length) % meses.length;
    }
}

const SWIPE_THRESHOLD = 40; // sensibilidad del swipe

    let currentIndex = 0;
    let autoPlay = true;
    let inactivityTimer = null;

    const AUTO_PLAY_DELAY = 1400;
    const INACTIVITY_RESET = 3500;

    function goToMonth(mes) {
        goto(`/mes/${mes}`);
    }

    function stopAutoPlay() {
        autoPlay = false;
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            autoPlay = true;
        }, INACTIVITY_RESET);
    }

    onMount(() => {
        const loop = () => {
            if (autoPlay) {
                currentIndex = (currentIndex + 1) % meses.length;
            }
            setTimeout(loop, AUTO_PLAY_DELAY);
        };
        loop();
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

    .hint {
        font-size: 0.75rem;
        opacity: 0.7;
        margin-top: 1rem;
    }
</style>

<div class="screen">

    <div class="title">Nuestras salidas del año ✨</div>
    <div class="subtitle">Revivamos cada mes como un recuerdo épico</div>

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
                </div>
            {/if}
        {/each}
    </div>

    <div class="hint">
        Toca una tarjeta para abrir el mes 🎉
    </div>
</div>
