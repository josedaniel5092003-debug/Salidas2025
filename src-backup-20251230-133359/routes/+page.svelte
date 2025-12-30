<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    // ✅ VARIABLE DINÁMICA PARA API (IMPORTANTE)
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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
        goto('/resultados');
    }

    async function cargarMesesVotados(usuarioId) {
        try {
            // ✅ USANDO API_URL DINÁMICA
            const res = await fetch(`${API_URL}/api/meses-votados/?usuario_id=${usuarioId}`);
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
                // ✅ USANDO API_URL DINÁMICA
                const res = await fetch(`${API_URL}/api/usuarios/`, {
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