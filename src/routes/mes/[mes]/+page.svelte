<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	$: mes = $page.params.mes;

	let preguntas = [
		{ id: 'lugar', texto: '📍 ¿Qué tal fue el lugar?', valor: 3 },
		{ id: 'puntualidad', texto: '⏰ Puntualidad del anfitrión', valor: 3 },
		{ id: 'creatividad', texto: '🎨 Creatividad del plan', valor: 3 },
		{ id: 'ambiente', texto: '🎉 Ambiente general', valor: 3 },
		{ id: 'repetir', texto: '🔁 ¿Repetirías esta salida?', valor: 3 }
	];

	$: total = preguntas.reduce((acc, p) => acc + p.valor, 0);

	function volver() {
		goto('/');
	}

	function guardar() {
		console.log('Mes:', mes, 'Preguntas:', preguntas, 'Total:', total);
		alert(`Puntuación de ${mes} guardada: ${total}`);
	}
</script>

<div class="w-full min-h-screen flex flex-col items-center px-4 py-6 
            bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 
            text-white">

	<h1 class="text-3xl sm:text-4xl font-extrabold capitalize mb-2 text-center drop-shadow-lg">
		{mes}
	</h1>

	<p class="text-sm sm:text-base opacity-90 mb-6 text-center drop-shadow">
		Puntúa esta salida y ve qué tan legendaria fue 🚀
	</p>

	<img
		src={`/meses/${mes}.jpg`}
		alt={mes}
		class="w-full max-w-sm h-48 sm:h-60 object-cover rounded-2xl shadow-2xl mb-6"
	/>

	<!-- Tarjeta de preguntas con scroll interno -->
	<div class="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl p-6 text-gray-900 shadow-xl 
	            max-h-[60vh] overflow-y-auto space-y-6">

		{#each preguntas as pregunta}
			<div class="space-y-2">
				<p class="font-semibold text-gray-800">{pregunta.texto}</p>
				<input
					type="range"
					min="1"
					max="5"
					step="1"
					bind:value={pregunta.valor}
					class="w-full accent-purple-600"
				/>
				<div class="flex justify-between text-xs opacity-70 text-gray-600">
					<span>meh</span>
					<span>🔥 increíble</span>
				</div>
			</div>
		{/each}

	</div>

	<!-- Score y botón fuera de la tarjeta de scroll -->
	<div class="w-full max-w-md mt-4 text-center">
		<p class="text-sm opacity-70 mb-2">Puntuación total</p>
		<p class="text-3xl font-extrabold text-purple-600 mb-4">{total}</p>

		<button
			class="w-full py-3 rounded-xl bg-purple-600 text-white font-bold shadow-lg hover:bg-purple-700 active:scale-95 transition"
			on:click={guardar}
		>
			Guardar puntuación
		</button>
	</div>

	<!-- Volver -->
	<button
		class="mt-6 text-sm underline opacity-80 text-white hover:opacity-100"
		on:click={volver}
	>
		← Volver al carrusel
	</button>
</div>
