<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	$: mes = $page.params.mes;

	let preguntas = [
		{ id: 'lugar', texto: '📍 ¿Qué tal fue el lugar?', valor: 3 },
		{ id: 'puntualidad', texto: '⏰ Puntualidad del anfitrión', valor: 3 },
		{ id: 'creatividad', texto: '🎨 Creatividad del plan', valor: 3 },
		{ id: 'ambiente', texto: '🎉 Ambiente general', valor: 3 },
		{ id: 'repetir', texto: '🔁 ¿Repetirías esta salida?', valor: 3 }
	];

	let usuario = '';
	let mesesVotados = [];

	$: total = preguntas.reduce((acc, p) => acc + p.valor, 0);

	function volver() { goto('/'); }

	async function guardarSalida() {
		const usuarioId = localStorage.getItem('usuario_id');
		if (!usuarioId) {
			alert("No se ha encontrado el usuario. Recarga la página e ingresa tu nombre de nuevo.");
			return;
		}

		try {
			const res = await fetch('https://backenddddd-ws89.onrender.com/api/salidas/', {
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
					puntaje_total: total
				})
			});

			if (res.ok) {
				mesesVotados.push(mes.toLowerCase());
				localStorage.setItem('meses_votados', JSON.stringify(mesesVotados));
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
		usuario = localStorage.getItem('usuario_nombre') || '';
		mesesVotados = JSON.parse(localStorage.getItem('meses_votados') || '[]');
	});
</script>

<!-- FONDO FIJO QUE CUBRE LA CLASE PROBLEMÁTICA -->
<div class="fixed inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 -z-20"></div>

<!-- CONTENIDO PRINCIPAL -->
<div class="min-h-screen text-white p-4">
	<div class="max-w-md mx-auto relative z-10">
		
		<!-- HEADER -->
		<div class="text-center pt-4 pb-6">
			<h1 class="text-3xl font-bold capitalize mb-2">{mes}</h1>
			<p class="text-white/90">Puntúa esta salida y ve qué tan legendaria fue 🚀</p>
		</div>

		<!-- IMAGEN -->
		<div class="mb-6 flex justify-center">
			<img
				src={`/meses/${mes}.jpg`}
				alt={mes}
				class="w-full max-w-xs h-56 object-cover rounded-2xl shadow-xl"
			/>
		</div>

		<!-- TARJETA DE PREGUNTAS -->
		<div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
			{#each preguntas as pregunta}
				<div class="mb-5 last:mb-0">
					<p class="font-semibold text-gray-800 mb-3 text-center">
						{pregunta.texto}
					</p>

					<input
						type="range"
						min="1"
						max="5"
						step="1"
						bind:value={pregunta.valor}
						class="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
					/>

					<div class="flex justify-between items-center text-xs text-gray-600 px-1 mt-2">
						<span class="whitespace-nowrap">😕 meh</span>
						<span class="font-bold text-purple-600 text-sm">{pregunta.valor}/5</span>
						<span class="whitespace-nowrap">🔥 increíble</span>
					</div>
				</div>
			{/each}

			<div class="pt-4 mt-4 border-t border-gray-300">
				<div class="flex justify-between items-center">
					<span class="font-bold text-gray-800">Puntaje total:</span>
					<span class="text-2xl font-bold text-purple-700">{total}/25</span>
				</div>
			</div>
		</div>

		<!-- BOTONES -->
		<div class="space-y-3">
			<button
				on:click={guardarSalida}
				class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
			>
				💾 Guardar puntuación
			</button>

			<button
				on:click={volver}
				class="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl transition text-center"
			>
				← Volver al carrusel
			</button>
		</div>

	</div>
</div>

<style>
	/* SOLUCIÓN DEFINITIVA - Sobrescribe la clase problemática */
	:global(.app.s-7IPF32Wcq3s8),
	:global(html),
	:global(body) {
		background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #4f46e5 100%) !important;
		margin: 0 !important;
		padding: 0 !important;
		position: relative !important;
	}
	
	/* Si la clase tiene position: fixed, la cambiamos */
	:global(.app.s-7IPF32Wcq3s8) {
		position: relative !important;
		inset: auto !important;
		width: auto !important;
		height: auto !important;
		overflow-x: visible !important;
	}
</style>