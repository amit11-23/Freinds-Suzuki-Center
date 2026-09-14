/**
 * FRIENDS SUZUKI CENTER — MAIN APPLICATION LOGIC
 * Address: 35F Block, Sri Ganganagar, Rajasthan - 335001
 * Phone: 98875-98016, 98873-20149
 * Hours: Monday to Saturday (Sunday Closed)
 * Trust: 25 Years of Trust
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    setupBookingModal();
    setupMobileDrawer();
    setupSmoothScrollNav();
    setupEngineSoundButton();
    createAmbientWorkshopSparks();
    setupReviewSystem();
  });

  // ========================================================================
  // 1. BOOKING MODAL & WHATSAPP TICKET GENERATOR
  // ========================================================================
  function setupBookingModal() {
    const modal = document.getElementById('booking-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const bookingForm = document.getElementById('booking-form');
    const openBtns = document.querySelectorAll('.open-booking-btn');
    const serviceTypeSelect = document.getElementById('service-type');
    const dateInput = document.getElementById('service-date');

    if (!modal) return;

    // Set minimum date to today, default to tomorrow (skip Sunday if tomorrow is Sunday)
    if (dateInput) {
      const today = new Date();
      const nextAvailable = new Date();
      nextAvailable.setDate(today.getDate() + 1);

      // If tomorrow is Sunday (day 0), advance to Monday
      if (nextAvailable.getDay() === 0) {
        nextAvailable.setDate(nextAvailable.getDate() + 1);
      }

      const toISO = (d) => d.toISOString().split('T')[0];
      dateInput.min = toISO(today);
      dateInput.value = toISO(nextAvailable);

      // Check if user selects Sunday
      dateInput.addEventListener('change', () => {
        if (!dateInput.value) return;
        const picked = new Date(dateInput.value + 'T00:00:00');
        if (picked.getDay() === 0) {
          alert('Note: Friends Suzuki Center is CLOSED on Sunday. Please select Monday to Saturday.');
          // Advance to Monday
          picked.setDate(picked.getDate() + 1);
          dateInput.value = toISO(picked);
        }
      });
    }

    // Open Modal
    function openModal(preSelectedService = '') {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Pre-select service in dropdown if provided
      if (preSelectedService && serviceTypeSelect) {
        for (let i = 0; i < serviceTypeSelect.options.length; i++) {
          const opt = serviceTypeSelect.options[i];
          if (opt.value.toLowerCase().includes(preSelectedService.toLowerCase()) ||
              preSelectedService.toLowerCase().includes(opt.value.toLowerCase())) {
            serviceTypeSelect.selectedIndex = i;
            break;
          }
        }
      }
    }

    // Close Modal
    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Attach open triggers
    openBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const service = btn.dataset.service || '';
        openModal(service);
      });
    });

    // Close triggers
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    // Form Submit ➔ WhatsApp Ticket Generation
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('cust-name');
        const phoneInput = document.getElementById('cust-phone');
        const bikeSelect = document.getElementById('bike-model');
        const serviceSelect = document.getElementById('service-type');
        const dateVal = document.getElementById('service-date').value;
        const timeSelect = document.getElementById('service-time');
        const notesInput = document.getElementById('service-notes');
        const needPickup = document.getElementById('need-pickup').checked;

        const name = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const bike = bikeSelect ? bikeSelect.value : '';
        const service = serviceSelect ? serviceSelect.value : '';
        const time = timeSelect ? timeSelect.value : '';
        const notes = notesInput ? notesInput.value.trim() : '';

        // Generate Ticket ID
        const ticketId = 'FS-' + Math.floor(1000 + Math.random() * 9000);

        // Format message for Sri Ganganagar Workshop WhatsApp
        let waText = `*🏍️ SERVICE BOOKING — FRIENDS SUZUKI CENTER*\n`;
        waText += `*Booking Ticket:* #${ticketId}\n`;
        waText += `-------------------------------------\n`;
        waText += `👤 *Customer Name:* ${name}\n`;
        waText += `📱 *Phone Number:* ${phone}\n`;
        waText += `🛵 *Bike / Scooter:* ${bike}\n`;
        waText += `🔧 *Requested Service:* ${service}\n`;
        waText += `📅 *Preferred Date:* ${dateVal}\n`;
        waText += `⏰ *Time Window:* ${time}\n`;
        waText += `🚚 *Doorstep Pick-up:* ${needPickup ? 'YES (Sri Ganganagar city limits)' : 'No (I will bring to workshop)'}\n`;
        if (notes) {
          waText += `💬 *Complaints / Issues:* ${notes}\n`;
        }
        waText += `-------------------------------------\n`;
        waText += `📍 *Workshop:* 35F Block, Sri Ganganagar, Rajasthan - 335001\n`;
        waText += `📞 *Contact:* 98875-98016 / 98873-20149 (Mon-Sat, Sun Closed)`;

        // Primary WhatsApp target: 98875-98016
        const waUrl = `https://wa.me/919887598016?text=${encodeURIComponent(waText)}`;

        // Open WhatsApp in new tab
        window.open(waUrl, '_blank');

        // Close modal and show feedback
        closeModal();
        bookingForm.reset();
        alert(`Booking Ticket #${ticketId} created! WhatsApp is opening to confirm with Friends Suzuki Center, 35F Block, Sri Ganganagar.`);
      });
    }
  }

  // ========================================================================
  // 2. MOBILE NAVIGATION DRAWER
  // ========================================================================
  function setupMobileDrawer() {
    const toggleBtn = document.getElementById('mobile-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const links = document.querySelectorAll('.mobile-link');

    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
      const isOpen = drawer.classList.contains('open');
      toggleBtn.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    links.forEach((link) => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  // ========================================================================
  // 3. SMOOTH SCROLL & ACTIVE HEADER HIGHLIGHT
  // ========================================================================
  function setupSmoothScrollNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollPos = window.scrollY + 120;

      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', href === currentSectionId);
      });
    }, { passive: true });
  }

  // ========================================================================
  // 4. ENGINE REV SOUND LISTENER
  // ========================================================================
  function setupEngineSoundButton() {
    const revBtn = document.getElementById('btn-sound-rev');
    if (!revBtn) return;

    revBtn.addEventListener('click', () => {
      if (window.workshopAudio && typeof window.workshopAudio.playEngineRev === 'function') {
        window.workshopAudio.playEngineRev();
        revBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Reving Suzuki Engine... 🔊</span>';
        setTimeout(() => {
          revBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Listen to Suzuki Engine Rev</span>';
        }, 1400);
      }
    });
  }

  // ========================================================================
  // 5. AMBIENT WORKSHOP SPARKS EMITTER
  // ========================================================================
  function createAmbientWorkshopSparks() {
    const container = document.getElementById('spark-container');
    if (!container) return;

    for (let i = 0; i < 16; i++) {
      const spark = document.createElement('div');
      spark.className = 'spark-particle';
      spark.style.left = Math.random() * 100 + '%';
      spark.style.animationDelay = Math.random() * 6 + 's';
      spark.style.animationDuration = 3 + Math.random() * 4 + 's';
      container.appendChild(spark);
    }
  }

  // ========================================================================
  // 6. STAR RATING & CUSTOMER REVIEWS (localStorage)
  // ========================================================================
  function setupReviewSystem() {
    const starBtns  = document.querySelectorAll('.star-btn');
    const starLabel = document.getElementById('star-label');
    const ratingInput = document.getElementById('selected-rating');
    const submitBtn   = document.getElementById('submit-review-btn');
    const feed        = document.getElementById('reviews-feed');
    const emptyState  = document.getElementById('reviews-empty');

    if (!submitBtn || !feed) return;

    const STORAGE_KEY = 'friends_suzuki_reviews';
    const STAR_TEXTS  = ['','⭐ Poor','⭐⭐ Below Average','⭐⭐⭐ Good','⭐⭐⭐⭐ Very Good','⭐⭐⭐⭐⭐ Excellent!'];

    // --- Star hover & click ---
    starBtns.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        const hoverVal = parseInt(btn.dataset.star);
        starBtns.forEach((b, idx) => {
          b.classList.toggle('hovered', idx < hoverVal);
          b.classList.remove('selected');
        });
      });

      btn.addEventListener('mouseleave', () => {
        const selected = parseInt(ratingInput.value) || 0;
        starBtns.forEach((b, idx) => {
          b.classList.remove('hovered');
          b.classList.toggle('selected', idx < selected);
        });
      });

      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.star);
        ratingInput.value = val;
        starBtns.forEach((b, idx) => {
          b.classList.remove('hovered');
          b.classList.toggle('selected', idx < val);
        });
        if (starLabel) starLabel.textContent = STAR_TEXTS[val] || '';
      });
    });

    // --- Load existing reviews ---
    function loadReviews() {
      const reviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      // Remove old dynamically added cards (not the empty-state)
      feed.querySelectorAll('.review-item-card').forEach(el => el.remove());

      if (reviews.length === 0) {
        if (emptyState) emptyState.style.display = '';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      reviews.forEach((r) => {
        feed.insertBefore(buildReviewCard(r), feed.firstChild);
      });
    }

    function buildReviewCard(r) {
      const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      const initials = (r.name || 'A').slice(0, 2).toUpperCase();
      const card = document.createElement('div');
      card.className = 'review-item-card';
      card.innerHTML = `
        <div class="review-item-header">
          <div class="review-item-left">
            <div class="review-avatar">${initials}</div>
            <div>
              <div class="review-name">${escapeHtml(r.name)}</div>
              ${r.bike ? `<div class="review-bike"><i class="fa-solid fa-motorcycle"></i> ${escapeHtml(r.bike)}</div>` : ''}
            </div>
          </div>
          <div style="text-align:right;">
            <div class="review-stars-display">${stars}</div>
            <span class="review-date">${r.date}</span>
          </div>
        </div>
        <p class="review-text">${escapeHtml(r.text)}</p>
      `;
      return card;
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode(str || ''));
      return div.innerHTML;
    }

    // --- Submit ---
    submitBtn.addEventListener('click', () => {
      const name   = (document.getElementById('reviewer-name')?.value || '').trim();
      const bike   = (document.getElementById('reviewer-bike')?.value || '').trim();
      const text   = (document.getElementById('reviewer-text')?.value || '').trim();
      const rating = parseInt(ratingInput?.value || '0');

      if (!name) { alert('Please enter your name.'); return; }
      if (!rating || rating < 1) { alert('Please select a star rating (1–5 stars).'); return; }
      if (!text)  { alert('Please write a short review before submitting.'); return; }

      const reviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      reviews.unshift({ name, bike, text, rating, date: dateStr });
      if (reviews.length > 50) reviews.length = 50; // cap at 50 reviews
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));

      // Reset form
      document.getElementById('reviewer-name').value = '';
      document.getElementById('reviewer-bike').value = '';
      document.getElementById('reviewer-text').value = '';
      ratingInput.value = 0;
      starBtns.forEach(b => { b.classList.remove('selected', 'hovered'); });
      if (starLabel) starLabel.textContent = 'Click to select a rating';

      loadReviews();
      alert(`Thank you, ${name}! Your review has been posted.`);
    });

    loadReviews();
  }

})();
