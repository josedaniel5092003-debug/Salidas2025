<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// mes actual desde la URL
	$: mes = $page.params.mes;

	// preguntas base (reutilizables)
	let preguntas = [
		{ id: 'lugar', texto: '📍 ¿Qué tal fue el lugar?', valor: 3 },
		{ id: 'puntualidad', texto: '⏰ Puntualidad del anfitrión', valor: 3 },
		{ id: 'creatividad', texto: '🎨 Creatividad del plan', valor: 3 },
		{ id: 'ambiente', texto: '🎉 Ambiente general', valor: 3 },
		{ id: 'repetir', texto: '🔁 ¿Repetirías esta salida?', valor: 3 }
	];

	let usuario = '';
	let mesesVotados = [];

	// cálculo del score
	$: total = preguntas.reduce((acc, p) => acc + p.valor, 0);

	function volver() {
		goto('/');
	}

	async function guardarSalida() {
		const usuarioId = localStorage.getItem('usuario_id');
		if (!usuarioId) {
			alert("No se ha encontrado el usuario. Recarga la página e ingresa tu nombre de nuevo.");
			return;
		}

		try {
			const res = await fetch('http://127.0.0.1:8000/api/salidas/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					usuario: usuarioId,
					mes,
					lugar: preguntas[0].valor,
					puntualidad: preguntas[1].valor,
					creatividad: preguntas[2].valor,
					ambiente: preguntas[3].valor,
					repetir: preguntas[4].valor,
					puntaje_total: preguntas.reduce((acc, p) => acc + p.valor, 0)
				})
			});

			if (res.ok) {
				// ✅ Agregar mes a mesesVotados para bloquearlo
				mesesVotados.push(mes.toLowerCase());
				localStorage.setItem('meses_votados', JSON.stringify(mesesVotados));

				// Regresar al carrusel
				goto('/');
			} else {
				const errorData = await res.json();
				console.error("Error guardando salida:", errorData);
				alert("Ocurrió un error al guardar la salida.");
			}
		} catch (err) {
			console.error("Error al guardar salida", err);
			alert("Ocurrió un error al guardar la salida.");
		}
	}

	onMount(() => {
		// Cargar usuario y meses votados del localStorage
		usuario = localStorage.getItem('usuario_nombre') || '';
		mesesVotados = JSON.parse(localStorage.getItem('meses_votados') || '[]');
	});
</script>

<div class="min-h-screen w-full flex flex-col items-center px-4 py-6 
	bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white">

	<!-- TÍTULO -->
	<h1 class="text-3xl sm:text-4xl font-extrabold capitalize mb-2 text-center drop-shadow-lg">
		{mes}
	</h1>

	<p class="text-sm sm:text-base opacity-90 mb-6 text-center drop-shadow">
		Puntúa esta salida y ve qué tan legendaria fue 🚀
	</p>

	<!-- IMAGEN PRINCIPAL -->
	<img
		src={`/lib/assets/meses/${mes}.jpg`}
		alt={mes}
		class="w-full max-w-sm h-48 sm:h-60 object-cover rounded-2xl shadow-2xl mb-6"
	/>

	<!-- TARJETA DE PREGUNTAS -->
	<div class="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl p-5 text-gray-900 shadow-xl space-y-5">

		{#each preguntas as pregunta}
			<div>
				<p class="font-semibold mb-2 text-gray-800">
					{pregunta.texto}
				</p>

				<input
					type="range"
					min="1"
					max="5"
					step="1"
					bind:value={pregunta.valor}
					class="w-full accent-purple-600"
				/>

				<div class="flex justify-between text-xs mt-1 opacity-70 text-gray-600">
					<span>meh</span>
					<span>🔥 increíble</span>
				</div>
			</div>
		{/each}
	</div>

	<!-- BOTÓN GUARDAR (afuera de la tarjeta de preguntas) -->
	<button
		class="w-full max-w-md mt-6 py-3 rounded-xl bg-purple-600 text-white font-bold shadow-lg hover:bg-purple-700 active:scale-95 transition"
		on:click={guardarSalida}
	>
		Guardar puntuación
	</button>

	<!-- VOLVER -->
	<button
		class="mt-6 text-sm underline opacity-80 text-white hover:opacity-100"
		on:click={volver}
	>
		← Volver al carrusel
	</button>
</div>
