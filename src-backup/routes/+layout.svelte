<script>
  import "../app.css";
</script>

<div class="app">
  <slot />
</div>

<style>
  .app {
    width: 100vw;
    height: 100vh;
    overflow-x: hidden;
    position: fixed; /* 🔥 evita desplazamientos */
    inset: 0;
    background: #ebebebff; /* fondo oscuro bonito */
  }
</style>
