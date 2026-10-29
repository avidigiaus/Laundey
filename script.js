/* FreshNest front-end interactions.
   Forms validate locally. Connect a backend or form endpoint before launch to receive submissions. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('#toast');
  let toastTimer;

  $('#year').textContent = new Date().getFullYear();

  const menuToggle = $('.menu-toggle');
  const navLinks = $('.nav-links');
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('menu-open', isOpen);
  });
  $$('.nav-link, .nav-cta').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }));

  // Do not allow selecting a booking date in the past.
  const dateInput = $('#book-date');
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = localToday;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
  }

  function validateForm(form) {
    let firstInvalid = null;
    const required = $$('[required]', form);
    required.forEach(field => {
      field.removeAttribute('aria-invalid');
      const value = field.value.trim();
      let valid = value.length > 0;
      if (valid && field.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      if (valid && field.type === 'tel') valid = /^[+()\d\s.-]{8,}$/.test(value);
      if (valid && field.type === 'date') valid = value >= localToday;
      if (!valid) {
        field.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = field;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }
    return true;
  }

  function setStatus(form, message, isError = false) {
    const status = $('.form-status', form);
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('error', isError);
  }

  // Demo behaviour: validates and confirms on-screen, but does not send data anywhere.
  // Replace the demo handler with fetch() to your secure API/form provider.
  const bookingForm = $('#booking');
  bookingForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateForm(bookingForm)) {
      setStatus(bookingForm, 'Please complete the required fields and check your date.', true);
      return;
    }
    setStatus(bookingForm, 'Your request is ready. This demo does not send bookings yet; connect a booking service before launch.');
    showToast('Booking form validated — connect a booking service to receive requests.');
  });

  const careerForm = $('#career-form');
  careerForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateForm(careerForm)) {
      setStatus(careerForm, 'Please check the required fields and enter a valid email and phone number.', true);
      return;
    }
    setStatus(careerForm, 'Thanks for your interest. This demo does not send applications yet; connect an application endpoint before launch.');
    showToast('Application form validated — no application has been sent.');
  });

  const contactForm = $('#contact-form');
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateForm(contactForm)) {
      setStatus(contactForm, 'Please complete the required fields and enter a valid email.', true);
      return;
    }
    setStatus(contactForm, 'Thanks for your message. This demo does not send messages yet; connect a contact endpoint before launch.');
    showToast('Contact form validated — connect an email or CRM service to receive messages.');
  });

  // Clear invalid styling as users correct their answers.
  $$('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => field.removeAttribute('aria-invalid'));
    field.addEventListener('change', () => field.removeAttribute('aria-invalid'));
  });

  // Update active navigation link as sections enter the viewport.
  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$('.nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-25% 0px -60% 0px' });
    sections.forEach(section => observer.observe(section));
  }
})();
