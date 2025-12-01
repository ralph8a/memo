// Contact Template
export default `
<section class="page-header">
  <div class="container">
    <h1 class="page-title">Contáctanos</h1>
    <p class="page-subtitle">Estamos aquí para ayudarte</p>
  </div>
</section>
<section class="contact-section">
  <div class="container">
    <form class="contact-form-app" onsubmit="window.appHandlers.handleContactSubmit(event)">
      <input type="text" class="form-control" placeholder="Nombre" required>
      <input type="email" class="form-control" placeholder="Email" required>
      <textarea class="form-control" placeholder="Mensaje" required></textarea>
      <button type="submit" class="btn btn-primary btn-block">Enviar</button>
    </form>
  </div>
</section>
`;
