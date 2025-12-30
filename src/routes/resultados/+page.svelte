<!-- src/routes/resultados/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  // Si no tienes svelte-confetti instalado, comenta esta línea o instálalo
//import Confetti from 'svelte-confetti';

  let mesesStats = [];
  let mesGanador = null;
  let showConfetti = false;
  let confettiKey = 0;

  const meses = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre"
  ];

  function toNumberSafe(value) {
    if (value == null) return 0;
    const n = Number(String(value).trim());
    return isNaN(n) ? 0 : n;
  }

  onMount(async () => {
    try {
      const res = await fetch('https://backenddddd-ws89.onrender.com/api/resultados/');
      if (!res.ok) throw new Error("Error cargando resultados");
      const data = await res.json();
      
      const stats = {};
      for (const item of data) {
        const mes = item.mes.toLowerCase();
        if (!stats[mes]) {
          stats[mes] = { totalPuntos: 0, totalVotos: 0 };
        }
        stats[mes].totalPuntos += toNumberSafe(item.total_puntos);
        stats[mes].totalVotos += toNumberSafe(item.total_votos);
      }

      mesesStats = Object.entries(stats).map(([mes, { totalPuntos, totalVotos }]) => ({
        mes,
        totalPuntos,
        totalVotos,
        promedio: totalVotos ? totalPuntos / totalVotos : 0
      }));

      mesesStats.sort((a, b) => b.promedio - a.promedio);
      
      mesesStats = meses.map(mes => {
        const stat = mesesStats.find(s => s.mes === mes);
        return stat || {
          mes,
          totalPuntos: 0,
          totalVotos: 0,
          promedio: 0
        };
      });

      mesesStats.sort((a, b) => {
        if (b.totalVotos === 0 && a.totalVotos === 0) {
          return meses.indexOf(a.mes) - meses.indexOf(b.mes);
        }
        return b.promedio - a.promedio;
      });

      mesGanador = mesesStats[0]?.totalVotos > 0 ? mesesStats[0] : null;

      // Activar confeti si hay un ganador
      if (mesGanador && mesGanador.totalVotos > 0) {
        showConfetti = true;
        confettiKey += 1;
        
        setTimeout(() => {
          showConfetti = false;
        }, 5000);
      }

    } catch (err) {
      console.error(err);
      alert("Error cargando los resultados");
    }
  });

  function getRankColor(rank) {
    if (rank === 0) return 'bg-gradient-to-r from-yellow-500/25 to-yellow-600/25 border border-yellow-400/30';
    if (rank === 1) return 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 border border-gray-300/30';
    if (rank === 2) return 'bg-gradient-to-r from-amber-700/20 to-amber-800/20 border border-amber-700/30';
    return 'bg-white/10 border border-white/10';
  }

  function getRankEmoji(rank) {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return (rank + 1) + '.';
  }

  function volver() {
    goto('/');
  }

  function handleImageError(e) {
    const img = e.target;
    img.src = '/meses/default.jpg';
    img.onerror = null;
  }
</script>

<style>
  .card-bg {
    position: relative;
    overflow: hidden;
    border-radius: 18px;
    backdrop-filter: blur(8px);
    min-height: 120px;
  }

  .card-bg-image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.18;
    z-index: 0;
    transition: opacity 0.3s ease;
  }

  .card-bg:hover .card-bg-image {
    opacity: 0.22;
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  @keyframes subtle-pulse {
    0%, 100% { 
      box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2),
                  0 0 0 2px rgba(255, 215, 0, 0.3); 
    }
    50% { 
      box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3),
                  0 0 0 3px rgba(255, 215, 0, 0.4); 
    }
  }

  .golden-card {
    animation: subtle-pulse 3s ease-in-out infinite;
    border: 2px solid rgba(255, 215, 0, 0.5);
    backdrop-filter: blur(12px);
  }

  .btn-volver {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 50;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .btn-volver:hover {
    background: rgba(255, 255, 255, 0.35);
    transform: scale(1.1) translateX(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  .header-container {
    padding-left: 70px;
    padding-right: 20px;
  }

  @keyframes cardSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card-animation {
    animation: cardSlideIn 0.5s ease-out forwards;
    opacity: 0;
  }

  .winner-glow {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, 
      rgba(255,215,0,0.3), 
      rgba(255,140,0,0.3), 
      rgba(255,215,0,0.3));
    border-radius: 20px;
    z-index: -1;
    filter: blur(8px);
  }
</style>

<!-- Confeti simplificado si no quieres instalar la dependencia -->
{#if showConfetti}
  <div class="fixed inset-0 pointer-events-none z-1000">
    {#each Array(20) as _, i}
      <div 
        class="absolute w-2 h-2 rounded-full"
  style="
    top: {Math.random() * 100}%;
    left: {Math.random() * 100}%;
    background: {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)]};
    animation: confettiFall {1 + Math.random() * 2}s linear forwards;
    animation-delay: {Math.random() * 0.5}s;
  ">
</div>
    {/each}
  </div>
  
  <style>
    @keyframes confettiFall {
      0% {
        transform: translateY(-100px) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
  </style>
{/if}

<!-- CAMBIO PRINCIPAL: Contenedor centrado con max-width -->
<div class="min-h-screen w-full 
  bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white
  overflow-x-hidden relative flex flex-col items-center">

  <!-- Botón para volver - CORREGIDO: usando onclick en lugar de on:click -->
  <button class="btn-volver" onclick={volver} aria-label="Volver">
    ←
  </button>

  <!-- CONTENEDOR PRINCIPAL CENTRADO -->
  <div class="w-full max-w-4xl px-4 py-5">

    <!-- Header -->
    <div class="header-container sticky top-0 z-10 pt-5 pb-4 bg-gradient-to-b from-pink-500/95 via-purple-500/95 to-transparent backdrop-blur-lg rounded-b-2xl">
      <h1 class="text-3xl font-black text-center mb-2 drop-shadow-lg">
        🏆 Resultados Globales
      </h1>
      <p class="text-sm text-center opacity-90">
        {mesesStats.filter(m => m.totalVotos > 0).length} meses votados
        {#if mesGanador && mesGanador.totalVotos > 0}
          <span class="block text-xs mt-1">¡Tenemos un ganador! 🎉</span>
        {/if}
      </p>
    </div>

    <!-- Mes ganador destacado -->
    {#if mesGanador && mesGanador.totalVotos > 0}
      <div class="golden-card mb-8 p-6 rounded-2xl relative overflow-hidden card-animation" 
           style="animation-delay: 0.1s">
        <div class="winner-glow"></div>
        <div 
          class="card-bg-image"
          style="background-image: url('/meses/{mesGanador.mes}.jpg');"
        ></div>
        
        <div class="relative z-10">
          <div class="flex flex-col sm:flex-row items-center justify-center mb-4">
            <div class="text-5xl mb-3 sm:mb-0 sm:mr-4">🏆</div>
            <div class="text-center sm:text-left">
              <div class="text-sm opacity-90 uppercase tracking-wider">Mes Ganador</div>
              <div class="text-2xl font-black capitalize mt-1">{mesGanador.mes}</div>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 mt-6">
            <div class="bg-black/40 backdrop-blur-sm p-4 rounded-xl text-center">
              <div class="text-xs opacity-90 mb-2 uppercase">Puntos</div>
              <div class="text-2xl font-black text-yellow-300">{mesGanador.totalPuntos}</div>
            </div>
            <div class="bg-black/40 backdrop-blur-sm p-4 rounded-xl text-center">
              <div class="text-xs opacity-90 mb-2 uppercase">Votos</div>
              <div class="text-2xl font-black text-blue-300">{mesGanador.totalVotos}</div>
            </div>
            <div class="bg-black/40 backdrop-blur-sm p-4 rounded-xl text-center">
              <div class="text-xs opacity-90 mb-2 uppercase">Promedio</div>
              <div class="text-2xl font-black text-green-300">{mesGanador.promedio.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="mb-8 p-6 bg-white/20 backdrop-blur-sm rounded-2xl text-center card-animation">
        <div class="text-4xl mb-3">📊</div>
        <div class="font-bold text-lg">Esperando votos</div>
        <div class="text-sm opacity-90 mt-2">Ningún mes ha sido votado aún</div>
      </div>
    {/if}

    <!-- Lista de meses -->
    <div class="space-y-4 pb-28">
      {#each mesesStats as stat, index}
        <div 
          class="card-bg {getRankColor(index)} card-animation"
          style="animation-delay: {0.2 + (index * 0.05)}s"
        >
          <div 
            class="card-bg-image"
            style="background-image: url('/meses/{stat.mes}.jpg');"
            onerror={handleImageError}
          ></div>
          
          <div class="card-content p-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center flex-1">
                <div class="text-2xl font-black mr-4 min-w-[44px]">
                  {getRankEmoji(index)}
                </div>
                <div class="flex-1">
                  <div class="text-lg font-black capitalize">{stat.mes}</div>
                  {#if stat.totalVotos === 0}
                    <div class="text-xs opacity-80 mt-1 flex items-center">
                      <span class="inline-block w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                      Sin votos
                    </div>
                  {:else}
                    <div class="text-xs opacity-80 mt-1 flex items-center">
                      <span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                      {stat.totalVotos} {stat.totalVotos === 1 ? 'voto' : 'votos'}
                    </div>
                  {/if}
                </div>
              </div>
              
              <div class="text-right ml-4">
                <div class="text-xs opacity-90 uppercase mb-1">Promedio</div>
                <div class="text-2xl font-black">
                  {stat.promedio.toFixed(1)}
                  {#if stat.totalVotos > 0}
                    <span class="text-xs font-normal ml-1 opacity-70"></span>
                  {/if}
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div class="bg-black/30 backdrop-blur-sm p-3 rounded-lg">
                <div class="text-xs opacity-90 mb-1">Puntos totales</div>
                <div class="text-lg font-bold">{stat.totalPuntos}</div>
              </div>
              <div class="bg-black/30 backdrop-blur-sm p-3 rounded-lg">
                <div class="text-xs opacity-90 mb-1">Total votos</div>
                <div class="text-lg font-bold">{stat.totalVotos}</div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

  </div> <!-- Cierre del contenedor centrado max-w-4xl -->

  <!-- Footer con botón para volver -->
  <div class="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent backdrop-blur-lg">
    <div class="max-w-4xl mx-auto">
      <div class="flex flex-col items-center">
        <button 
          class="bg-purple-600 hover:bg-purple-700 
                 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 
                 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          on:click={volver}
        >
          <span class="text-xl">←</span>
          <span>Volver al Carrusel</span>
        </button>
        
        <div class="text-center text-xs opacity-80 mt-4 space-y-1">
          <p>✨ El promedio se calcula: Puntos totales ÷ Total de votos</p>
          {#if mesGanador && mesGanador.totalVotos > 0}
            <p class="text-yellow-300 animate-pulse">🎊 ¡{mesGanador.mes} es el mes favorito!</p>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>