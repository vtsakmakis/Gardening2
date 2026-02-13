// Navbar Section-Based Color Change
(function() {
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
      setTimeout(initNavbar, 100);
      return;
    }

    const toggle = navbar.querySelector('.navbar__toggle');
    const menu = navbar.querySelector('.navbar__menu');

    // Sections with white/light backgrounds that need dark navbar text
    // Based on user requirements:
    // Home page: hero(transparent), services(white), projects(transparent), testimonials(white), cta-final(transparent)
    // Services page: hero(transparent), services-premium(white), services-process(white), services-cta(transparent)
    // About page: hero-split(white), quote(transparent), timeline(white), mission(transparent), values(transparent), stats(white), cta(transparent)
    // Contact page: contact-split__right(white)
    const lightSections = document.querySelectorAll(
      // Home page - only services and testimonials
      '.services, .testimonials, ' +
      // Services page - services-premium and services-process
      '.services-premium, .services-process, ' +
      // About page - story intro, timeline, stats-minimal
      '.about-story-intro, .about-timeline, .about-stats-minimal, ' +
      // Contact page
      '.contact-split__right'
    );
    
    // Get navbar height for precise detection
    const navbarHeight = navbar.offsetHeight || 80;
    
    // Function to check what's directly under the navbar (at top of viewport)
    function checkNavbarPosition() {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      
      // Check all light sections - use getBoundingClientRect which gives viewport-relative positions
      let isOverLightSection = false;
      
      lightSections.forEach(section => {
        if (!section) return;
        
        const rect = section.getBoundingClientRect();
        
        // Navbar is at top of viewport (0 to navbarHeight)
        // Section overlaps navbar if:
        // - Section top is above or at navbar bottom AND
        // - Section bottom is below or at navbar top
        // This works for both scrolling up and down
        if (rect.top <= navbarHeight && rect.bottom >= 0) {
          isOverLightSection = true;
        }
      });

      // Special handling for split sections (check specific side)
      const contactSplit = document.querySelector('.contact-split');
      if (contactSplit && !isOverLightSection) {
        const contactRight = document.querySelector('.contact-split__right');
        if (contactRight) {
          const rect = contactRight.getBoundingClientRect();
          if (rect.top <= navbarHeight && rect.bottom >= 0) {
            isOverLightSection = true;
          }
        }
      }
      
      // Apply class
      if (isOverLightSection) {
        navbar.classList.add('on-light-section');
    } else {
        navbar.classList.remove('on-light-section');
    }
  }

    // Intersection Observer for better performance - triggers when sections enter/exit viewport
    const observerOptions = {
      root: null,
      rootMargin: `-${navbarHeight}px 0px -${window.innerHeight - navbarHeight}px 0px`, // Trigger when section is at navbar level
      threshold: [0, 0.1, 0.5, 1]
    };

    const observer = new IntersectionObserver((entries) => {
      // Always check current position when observer triggers
      checkNavbarPosition();
    }, observerOptions);
    
    // Observe all light sections
    lightSections.forEach(section => {
      if (section) observer.observe(section);
    });
    
    // Also observe dark sections to ensure we remove the class when scrolling back
    const darkSections = document.querySelectorAll(
      '.hero, .projects, .cta-final, ' +
      '.services-hero-premium, .services-cta, ' +
      '.about-quote, .about-mission-new, .about-values-mosaic, .about-cta-minimal, ' +
      '.contact-split__left'
    );
    
    darkSections.forEach(section => {
      if (section) observer.observe(section);
    });

    let ticking = false;
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkNavbarPosition();
          ticking = false;
        });
        ticking = true;
      }
    }

    checkNavbarPosition();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Debounce resize handler for better performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        checkNavbarPosition();
      }, 150);
    }, { passive: true });

    // Mobile menu toggle (only if elements exist)
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('open');
        document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

      // Close menu when clicking a link (mobile)
      menu.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
            toggle.classList.remove('active');
            menu.classList.remove('open');
            document.body.style.overflow = '';
      }
    });
  });

      // Close menu when clicking outside (mobile)
  document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !toggle.contains(e.target) && 
            !menu.contains(e.target) && 
            menu.classList.contains('open')) {
          toggle.classList.remove('active');
          menu.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();

// ============================================
// SCROLL ANIMATIONS - Optimized for performance
// Animate once only, fewer targets, no blur
// ============================================

(function() {
  const isMobile = () => window.innerWidth <= 768;
  const animationObserverOptions = {
    threshold: isMobile() ? 0.02 : 0.05,
    rootMargin: isMobile() ? '0px 0px 80px 0px' : '0px 0px 60px 0px'
  };

  // Animate once - unobserve after first intersection (smoother, less lag)
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        animationObserver.unobserve(entry.target);
      }
    });
  }, animationObserverOptions);

  // Cache for already processed elements to avoid redundant work
  const processedElements = new WeakSet();
  
  // Mobile index: skip scroll animations for services & projects - they load slowly otherwise
  const skipIndexMobileAnimations = () => 
    document.body.classList.contains('index-page') && isMobile();
  
  // Function to add animation classes to elements
  function addScrollAnimations() {
    const skipServicesProjects = skipIndexMobileAnimations();
    
    // Sections - fade up (exclude hero sections - they should be visible immediately)
    const sections = document.querySelectorAll(
      'section:not(.hero):not(.entrance-animation):not(.services-hero-premium), ' +
      '.services, .projects, .testimonials, .cta-final, ' +
      '.weather-widget-section, ' +
      '.services-premium, .services-process, .services-cta, ' +
      '.about-story-intro, .about-quote, .about-timeline, .about-mission-new, ' +
      '.about-values-mosaic, .about-stats-minimal, .about-cta-minimal, ' +
      '.about-content, .about-story, .about-values-premium, ' +
      '.contact-split'
    );
    
    sections.forEach((section) => {
      if (skipServicesProjects && (section.classList.contains('services') || section.classList.contains('projects'))) return;
      if (!processedElements.has(section) && !section.classList.contains('scroll-animate-up')) {
        section.classList.add('scroll-animate-up');
        animationObserver.observe(section);
        processedElements.add(section);
      }
    });

    // Cards - scale in with stagger (per container)
    const cardContainers = document.querySelectorAll(
      '.services__grid, .projects__grid, .testimonials__grid, ' +
      '.services-premium__list, .services-process__steps, ' +
      '.about-values-mosaic__grid'
    );
    
    cardContainers.forEach(container => {
      const isServicesOrProjects = container.classList.contains('services__grid') || container.classList.contains('projects__grid');
      if (skipServicesProjects && isServicesOrProjects) return;
      
      const cards = container.querySelectorAll(
        '.service-card, .project-card, .testimonial-card, ' +
        '.service-premium-item, .process-step, .about-value-mosaic'
      );
      cards.forEach((card, index) => {
        if (!processedElements.has(card) && !card.classList.contains('scroll-animate-scale')) {
          card.classList.add('scroll-animate-scale');
          card.style.transitionDelay = `${Math.min(index * 0.04, 0.2)}s`;
          animationObserver.observe(card);
          processedElements.add(card);
        }
      });
    });
    
    // Timeline items separately
    const timelineItems = document.querySelectorAll('.about-timeline__item');
    timelineItems.forEach((item, index) => {
      if (!processedElements.has(item) && !item.classList.contains('scroll-animate-left')) {
        item.classList.add('scroll-animate-left');
        item.style.transitionDelay = `${Math.min(index * 0.06, 0.25)}s`;
        animationObserver.observe(item);
        processedElements.add(item);
      }
    });

    // Section headers only (not every h2/h3 - reduces observers)
    const headerSelectors = [
      '.services__header', '.projects__header', '.testimonials__header',
      '.services-premium__header', '.services-process__header',
      '.about-timeline__header', '.about-values-mosaic__header'
    ];
    
    headerSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((header) => {
        if (skipServicesProjects && (header.classList.contains('services__header') || header.classList.contains('projects__header'))) return;
        if (!processedElements.has(header) && !header.classList.contains('scroll-animate-up')) {
          header.classList.add('scroll-animate-up');
          animationObserver.observe(header);
          processedElements.add(header);
        }
      });
    });

    // Buttons and CTAs - scale in
    const buttons = document.querySelectorAll(
      'a[class*="button"], a[class*="cta"], button:not(.navbar__toggle):not(.entrance-animation__skip), ' +
      '.cta-final__button, .services-cta__button, .about-cta-minimal__button'
    );
    
    buttons.forEach((button, index) => {
      if (!processedElements.has(button) && !button.classList.contains('scroll-animate-scale')) {
        button.classList.add('scroll-animate-scale');
        button.style.transitionDelay = `${index * 0.05}s`;
        animationObserver.observe(button);
        processedElements.add(button);
      }
    });

    // Stats and numbers - scale in (per container)
    const statsContainers = document.querySelectorAll(
      '.about-stats-minimal__container, ' +
      '.services-hero-premium__stats'
    );
    
    statsContainers.forEach(container => {
      const stats = container.querySelectorAll(
        '.about-stats-minimal__stat, ' +
        '.services-hero-premium__stat, .about-stats-minimal__number'
      );
      stats.forEach((stat, index) => {
        if (!processedElements.has(stat) && !stat.classList.contains('scroll-animate-scale')) {
          stat.classList.add('scroll-animate-scale');
          stat.style.transitionDelay = `${index * 0.05}s`;
          animationObserver.observe(stat);
          processedElements.add(stat);
        }
      });
    });

    // Form elements - fade up
    const formElements = document.querySelectorAll(
      '.contact-split__form, .form-field, .contact-split__form-title'
    );
    
    formElements.forEach((element, index) => {
      if (!processedElements.has(element) && !element.classList.contains('scroll-animate-up')) {
        element.classList.add('scroll-animate-up');
        element.style.transitionDelay = `${index * 0.05}s`;
        animationObserver.observe(element);
        processedElements.add(element);
      }
    });
  }

  function initScrollAnimations() {
    addScrollAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }
})();

// Entrance Animation (only for index.html)
(function() {
  function initEntranceAnimation() {
    const entranceAnimation = document.getElementById('entranceAnimation');
    if (!entranceAnimation) {
      // If no entrance animation, reveal site immediately
      document.body.classList.add('site-revealed');
      return;
    }

    // Check if animation should be shown
    // Show only on: first visit OR page refresh (not on navigation from other pages)
    const shouldShowAnimation = (() => {
      // Check if animation was already shown in this session
      const animationShown = sessionStorage.getItem('entrance-animation-shown');
      
      // Detect navigation type using Navigation Timing API
      // 'reload' = page refresh, 'navigate' = navigation from another page
      const navType = performance.getEntriesByType('navigation')[0]?.type || 
                      (performance.navigation ? 
                        (performance.navigation.type === 1 ? 'reload' : 'navigate') : 
                        'navigate');
      
      // Show animation if:
      // 1. First visit (no sessionStorage flag) OR
      // 2. Page refresh (type === 'reload') - always show on refresh
      // Don't show if navigating from another page (already shown in this session)
      if (animationShown === 'true' && navType !== 'reload') {
        return false; // Already shown and not a refresh - skip animation
      }
      
      return true; // Show animation (first visit or refresh)
    })();

    if (!shouldShowAnimation) {
      // Skip animation - reveal site immediately
      entranceAnimation.style.display = 'none';
      document.body.classList.add('site-revealed');
      return;
    }

    // Mark animation as shown in this session
    sessionStorage.setItem('entrance-animation-shown', 'true');

    // Defer activation to next frame so browser can complete initial layout first
    requestAnimationFrame(() => {
      entranceAnimation.classList.add('entrance-animation--active');
    });
    
    // Allow clicking skip button to skip animation
    const skipButton = entranceAnimation.querySelector('.entrance-animation__skip');
    if (skipButton) {
      skipButton.addEventListener('click', skipAnimation);
    }
    
    // Remove overlay after animation completes (3.5 seconds)
    const removeAnimation = () => {
      entranceAnimation.classList.add('entrance-animation--complete');
      // Trigger staggered site content reveal
      document.body.classList.add('site-revealed');
      setTimeout(() => {
        if (entranceAnimation && entranceAnimation.parentNode) {
          entranceAnimation.style.display = 'none';
          entranceAnimation.remove();
        }
      }, 800);
    };
    
    setTimeout(removeAnimation, 3500);
    
    // Fallback: Force remove after 5 seconds no matter what
    setTimeout(() => {
      document.body.classList.add('site-revealed');
      if (entranceAnimation && entranceAnimation.parentNode) {
        entranceAnimation.style.display = 'none';
        entranceAnimation.remove();
      }
    }, 5000);

    function skipAnimation(e) {
      e.preventDefault();
      e.stopPropagation();
      // Trigger staggered site content reveal immediately
      document.body.classList.add('site-revealed');
      if (entranceAnimation && entranceAnimation.parentNode) {
        entranceAnimation.classList.add('entrance-animation--complete');
        setTimeout(() => {
          entranceAnimation.style.display = 'none';
          entranceAnimation.remove();
        }, 300);
      }
    }
  }

  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEntranceAnimation);
  } else {
    // Use setTimeout to ensure DOM is fully parsed
    setTimeout(initEntranceAnimation, 10);
  }
})();

// Animated counter for stats (for about.html)
const animateCounter = (element) => {
  const target = parseInt(element.getAttribute('data-count'));
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;

  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
      if (target === 100) {
        element.textContent = target + '%';
      } else {
        element.textContent = target + '+';
      }
    }
  };

  updateCounter();
};

// Intersection Observer for stats (for about.html)
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const number = entry.target.querySelector('.about-stats-minimal__number');
      if (number && !number.classList.contains('counted')) {
        number.classList.add('counted');
        animateCounter(number);
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.about-stats-minimal__stat').forEach(stat => {
  statsObserver.observe(stat);
});

// Timeline animation on scroll (for about.html)
const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('about-timeline__item--visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.about-timeline__item').forEach(item => {
  timelineObserver.observe(item);
});

// ============================================
// CONTACT FORM EMAIL FUNCTIONALITY
// ============================================

(function() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return; // Only run on contact page

  // Initialize EmailJS
  (function() {
    emailjs.init("YtDja-TMB6EksCFGg");
  })();

  const successMessage = document.getElementById('form-success');
  const errorMessage = document.getElementById('form-error');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.querySelector('span').textContent;

  // Hide messages initially
  function hideMessages() {
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
  }

  // Show success message
  function showSuccess() {
    hideMessages();
    if (successMessage) {
      successMessage.style.display = 'block';
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    contactForm.reset();
    // Reset form field states
    contactForm.querySelectorAll('.form-field__input').forEach(input => {
      input.classList.remove('form-field__input--filled', 'form-field__input--error');
    });
  }

  // Show error message
  function showError(message) {
    hideMessages();
    if (errorMessage) {
      errorMessage.textContent = message || errorMessage.textContent;
      errorMessage.style.display = 'block';
      errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Update button state
  function setButtonLoading(loading) {
    if (loading) {
      submitButton.disabled = true;
      submitButton.querySelector('span').textContent = 'Αποστολή...';
      submitButton.style.opacity = '0.7';
      submitButton.style.cursor = 'not-allowed';
    } else {
      submitButton.disabled = false;
      submitButton.querySelector('span').textContent = originalButtonText;
      submitButton.style.opacity = '1';
      submitButton.style.cursor = 'pointer';
    }
  }

  // Validate form
  function validateForm() {
    const name = contactForm.querySelector('#name').value.trim();
    const email = contactForm.querySelector('#email').value.trim();
    const subject = contactForm.querySelector('#subject').value.trim();
    const message = contactForm.querySelector('#message').value.trim();

    if (!name || name.length < 2) {
      showError('Παρακαλώ εισάγετε ένα έγκυρο όνομα (τουλάχιστον 2 χαρακτήρες)');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showError('Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email');
      return false;
    }

    if (!subject || subject.length < 3) {
      showError('Παρακαλώ εισάγετε ένα θέμα (τουλάχιστον 3 χαρακτήρες)');
      return false;
    }

    if (!message || message.length < 10) {
      showError('Παρακαλώ εισάγετε το μήνυμά σας (τουλάχιστον 10 χαρακτήρες)');
      return false;
    }

    return true;
  }

  // Handle form submission
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check if EmailJS is configured
    if (typeof emailjs === 'undefined') {
      showError('Το σύστημα email δεν έχει ρυθμιστεί ακόμα. Παρακαλώ επικοινωνήστε μαζί μας στο info@thegardeners.com');
      return;
    }

    setButtonLoading(true);

    // Get form data
    const formData = {
      from_name: contactForm.querySelector('#name').value.trim(),
      from_email: contactForm.querySelector('#email').value.trim(),
      from_phone: contactForm.querySelector('#phone').value.trim(),
      subject: contactForm.querySelector('#subject').value.trim(),
      message: contactForm.querySelector('#message').value.trim(),
      to_email: 'info@thegardeners.com' // Your email address
    };

    try {
      // Send email using EmailJS
      const response = await emailjs.send(
        'service_vvzds6i',
        'template_rlxwnyb',
        {
          from_name: formData.from_name,
          from_email: formData.from_email,
          from_phone: formData.from_phone,
          subject: formData.subject,
          message: formData.message,
          to_email: formData.to_email,
          reply_to: formData.from_email
        }
      );

      if (response.status === 200) {
        showSuccess();
        setButtonLoading(false);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      showError('Συγγνώμη, υπήρξε ένα σφάλμα κατά την αποστολή του μηνύματος. Παρακαλώ δοκιμάστε ξανά ή επικοινωνήστε μαζί μας απευθείας στο info@thegardeners.com');
      setButtonLoading(false);
    }
  });

  // Real-time validation feedback
  const inputs = contactForm.querySelectorAll('.form-field__input');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim()) {
        this.classList.add('form-field__input--filled');
        this.classList.remove('form-field__input--error');
      } else {
        this.classList.remove('form-field__input--filled');
      }
    });

    input.addEventListener('input', function() {
      if (this.classList.contains('form-field__input--error') && this.value.trim()) {
        // Remove error state when user starts typing
        this.classList.remove('form-field__input--error');
        const errorSpan = this.parentElement.querySelector('.form-field__error');
        if (errorSpan) errorSpan.style.display = 'none';
      }
    });
  });
})();

// ============================================
// WEATHER WIDGET WITH GARDENING TIPS
// ============================================

(function() {
  const weatherWidget = document.querySelector('.weather-widget');
  if (!weatherWidget) return; // Only run if widget exists

  // Configuration
  const API_KEY = '86786d082374e5f9594f63ab6fd01a06'; // OpenWeatherMap API key
  const CITY = 'Florina';
  const COUNTRY_CODE = 'GR';
  const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${API_KEY}&units=metric&lang=el`;

  // Debug: Log API key format (first 8 chars only for security)
  console.log('Weather Widget: API Key configured', API_KEY.substring(0, 8) + '...');
  console.log('Weather Widget: API URL', API_URL.replace(API_KEY, '***HIDDEN***'));

  // Cache weather data for 10 minutes
  const CACHE_DURATION = 10 * 60 * 1000;
  const CACHE_KEY = 'weather_cache_florina';

  // DOM elements
  const loadingEl = document.getElementById('weather-loading');
  const dataEl = document.getElementById('weather-data');
  const errorEl = document.getElementById('weather-error');
  const refreshBtn = document.querySelector('.weather-widget__refresh');

  // Gardening tips based on weather conditions
  const getGardeningTip = (weatherData) => {
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    const windSpeed = weatherData.wind?.speed || 0;
    const rain = weatherData.rain?.['1h'] || 0;

    let tip = '';

    // Temperature-based tips
    if (temp < 5) {
      tip = 'Ο καιρός είναι πολύ κρύος. Προστατέψτε τα ευαίσθητα φυτά σας με καλύμματα ή μεταφέρετέ τα σε προστατευμένο χώρο. Αποφύγετε το πότισμα κατά τη διάρκεια των παγετών.';
    } else if (temp >= 5 && temp < 15) {
      tip = 'Κρύος αλλά ανεκτός καιρός. Είναι ιδανική περίοδος για φύτευση δέντρων και θάμνων. Τοποθετήστε mulch γύρω από τα φυτά για προστασία από το κρύο.';
    } else if (temp >= 15 && temp < 25) {
      tip = 'Ιδανικός καιρός για κηπουρικές εργασίες! Είναι η τέλεια περίοδος για φύτευση, κλάδεμα και γενική συντήρηση του κήπου. Το πρωί είναι το καλύτερο χρονικό διάστημα για εργασίες.';
    } else if (temp >= 25 && temp < 30) {
      tip = 'Ζεστός καιρός. Πουλήστε τα φυτά σας πρωί ή αργά το απόγευμα για να αποφύγετε την υπερβολική εξάτμιση. Αυξήστε τη συχνότητα ποτίσματος, ειδικά για τα νεοφυτεμένα φυτά.';
    } else {
      tip = 'Πολύ ζεστός καιρός! Πουλήστε πρωί (πριν τις 10) ή αργά το απόγευμα (μετά τις 18). Χρησιμοποιήστε σκίαση για ευαίσθητα φυτά και αυξήστε σημαντικά το πότισμα.';
    }

    // Weather condition-based tips
    if (weatherMain.includes('rain') || rain > 0) {
      tip += ' Βροχή προβλέπεται! Αυτή είναι μια εξαιρετική ευκαιρία για να μειώσετε το πότισμα. Ελέγξτε ότι τα συστήματα αποχέτευσης λειτουργούν σωστά.';
    } else if (weatherMain.includes('snow')) {
      tip += ' Χιόνι προβλέπεται. Απομακρύνετε το χιόνι από τα κλαδιά των δέντρων για να αποφύγετε σπασίματα. Προστατέψτε τα ευαίσθητα φυτά.';
    } else if (weatherMain.includes('wind') || windSpeed > 15) {
      tip += ' Ισχυρός άνεμος! Στερεώστε τα νεοφυτεμένα φυτά και αποφύγετε το κλάδεμα. Ελέγξτε ότι τα δέντρα είναι σωστά στηριγμένα.';
    } else if (weatherMain.includes('clear') || weatherMain.includes('sun')) {
      if (temp > 25) {
        tip += ' Καθαρός ουρανός και πολύ ηλιακό φως. Χρησιμοποιήστε σκίαση για τα ευαίσθητα φυτά και αυξήστε το πότισμα.';
      }
    } else if (weatherMain.includes('cloud')) {
      tip += ' Νεφελώδης καιρός. Είναι καλή περίοδος για εργασίες στον κήπο χωρίς τον κίνδυνο υπερβολικής ηλιακής ακτινοβολίας.';
    }

    // Humidity-based tips
    if (humidity < 40) {
      tip += ' Χαμηλή υγρασία. Αυξήστε το πότισμα και σκεφτείτε να τοποθετήσετε δοχεία με νερό κοντά στα φυτά για να αυξήσετε την υγρασία.';
    } else if (humidity > 80) {
      tip += ' Υψηλή υγρασία. Προσέξτε για ασθένειες φυτών που προκαλούνται από υγρασία. Βεβαιωθείτε ότι υπάρχει καλή αερισμός γύρω από τα φυτά.';
    }

    return tip || 'Καλή μέρα για εργασίες στον κήπο! Να θυμάστε να ποτίζετε τα φυτά σας και να ελέγχετε την υγεία τους τακτικά.';
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Get weather icon emoji
  const getWeatherIcon = (weatherCode, isDay = true) => {
    const icons = {
      '01d': '☀️', // clear sky day
      '01n': '🌙', // clear sky night
      '02d': '⛅', // few clouds day
      '02n': '☁️', // few clouds night
      '03d': '☁️', // scattered clouds
      '03n': '☁️',
      '04d': '☁️', // broken clouds
      '04n': '☁️',
      '09d': '🌧️', // shower rain
      '09n': '🌧️',
      '10d': '🌦️', // rain day
      '10n': '🌧️', // rain night
      '11d': '⛈️', // thunderstorm
      '11n': '⛈️',
      '13d': '❄️', // snow
      '13n': '❄️',
      '50d': '🌫️', // mist
      '50n': '🌫️'
    };
    return icons[weatherCode] || '🌤️';
  };

  // Fetch weather data
  const fetchWeather = async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          const now = Date.now();
          if (now - cachedData.timestamp < CACHE_DURATION) {
            displayWeather(cachedData.data);
            return;
          }
        } catch (e) {
          console.error('Error reading cache:', e);
        }
      }
    }

    // Show loading state
    loadingEl.style.display = 'flex';
    dataEl.style.display = 'none';
    errorEl.style.display = 'none';

    try {
      // Check if API key is configured
      if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY' || !API_KEY || API_KEY.trim() === '') {
        showApiKeyNotConfigured();
        return;
      }

      const response = await fetch(API_URL);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP ${response.status}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}`;
        }
        
        if (response.status === 401) {
          showApiKeyError(`Invalid API key (${errorMessage}). The API key may need 10-60 minutes to activate after signup. Please check your OpenWeatherMap account and try again later.`);
        } else if (response.status === 404) {
          showApiKeyError(`City not found. Please check if "Florina, GR" is correct in the OpenWeatherMap database.`);
        } else {
          showApiKeyError(`Weather API error: ${errorMessage} (Status: ${response.status})`);
        }
        return;
      }

      const data = await response.json();
      
      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));

      displayWeather(data);
    } catch (error) {
      console.error('Weather fetch error:', error);
      console.error('API URL:', API_URL.replace(API_KEY, '***HIDDEN***'));
      
      // Check for network/CORS errors
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        showApiKeyError('Network error. Please check your internet connection and try again. If the problem persists, there may be a CORS issue.');
      } else if (error.message.includes('API key')) {
        showApiKeyNotConfigured();
      } else {
        showApiKeyError(`Error: ${error.message}. Please check the browser console for more details.`);
      }
    }
  };

  // Display weather data
  const displayWeather = (data) => {
    // Hide loading, show data
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    dataEl.style.display = 'grid';

    // Update temperature
    document.getElementById('weather-temp').textContent = Math.round(data.main.temp);
    document.getElementById('weather-feels-like').textContent = Math.round(data.main.feels_like);

    // Update description
    const description = data.weather[0].description;
    document.getElementById('weather-description').textContent = description.charAt(0).toUpperCase() + description.slice(1);

    // Update icon
    const iconCode = data.weather[0].icon;
    const iconEl = document.getElementById('weather-icon');
    iconEl.textContent = getWeatherIcon(iconCode);
    iconEl.style.fontSize = '4rem';

    // Update details
    document.getElementById('weather-humidity').textContent = `${data.main.humidity}%`;
    const windSpeed = data.wind?.speed || 0;
    document.getElementById('weather-wind').textContent = `${Math.round(windSpeed * 3.6)} km/h`; // Convert m/s to km/h
    document.getElementById('weather-updated').textContent = formatTime(Date.now());
    
    // Update pressure if element exists (for weather.html page)
    const pressureEl = document.getElementById('weather-pressure');
    if (pressureEl && data.main.pressure) {
      pressureEl.textContent = `${data.main.pressure} hPa`;
    }

    // Update gardening tip
    const tip = getGardeningTip(data);
    document.getElementById('weather-tip-text').textContent = tip;
  };

  // Show error state
  const showError = () => {
    loadingEl.style.display = 'none';
    dataEl.style.display = 'none';
    errorEl.style.display = 'flex';
    errorEl.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>Δεν ήταν δυνατή η φόρτωση των καιρικών δεδομένων. Παρακαλώ δοκιμάστε ξανά αργότερα.</p>
    `;
  };

  // Show API key not configured message
  const showApiKeyNotConfigured = () => {
    loadingEl.style.display = 'none';
    dataEl.style.display = 'none';
    errorEl.style.display = 'flex';
    errorEl.innerHTML = `
      <div style="text-align: center; max-width: 500px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 1rem; color: var(--accent-green, #6b8e6b);">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h3 style="font-size: 1.2rem; font-weight: 600; color: #1a2e1f; margin: 0 0 1rem 0;">Ρύθμιση Weather Widget</h3>
        <p style="margin: 0 0 1rem 0; line-height: 1.6; color: rgba(20, 35, 25, 0.8);">
          Για να λειτουργήσει το weather widget, χρειάζεται να προσθέσετε ένα API key από το OpenWeatherMap.
        </p>
        <div style="background: rgba(107, 142, 107, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: left;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #1a2e1f; font-size: 0.9rem;">Οδηγίες:</p>
          <ol style="margin: 0; padding-left: 1.5rem; color: rgba(20, 35, 25, 0.8); font-size: 0.9rem; line-height: 1.8;">
            <li>Επισκεφτείτε το <a href="https://openweathermap.org/api" target="_blank" style="color: var(--accent-green, #6b8e6b); text-decoration: underline;">openweathermap.org/api</a></li>
            <li>Δημιουργήστε δωρεάν λογαριασμό</li>
            <li>Αντιγράψτε το API key σας</li>
            <li>Ανοίξτε το <code style="background: rgba(20, 35, 25, 0.1); padding: 0.2rem 0.4rem; border-radius: 4px;">script.js</code></li>
            <li>Αντικαταστήστε το <code style="background: rgba(20, 35, 25, 0.1); padding: 0.2rem 0.4rem; border-radius: 4px;">YOUR_OPENWEATHERMAP_API_KEY</code> με το API key σας</li>
          </ol>
        </div>
        <p style="margin: 0; font-size: 0.85rem; color: rgba(20, 35, 25, 0.6);">
          Δείτε το <code style="background: rgba(20, 35, 25, 0.1); padding: 0.2rem 0.4rem; border-radius: 4px;">WEATHER-WIDGET-SETUP.md</code> για λεπτομερείς οδηγίες.
        </p>
      </div>
    `;
  };

  // Show API key error
  const showApiKeyError = (message) => {
    loadingEl.style.display = 'none';
    dataEl.style.display = 'none';
    errorEl.style.display = 'flex';
    errorEl.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>${message}</p>
    `;
  };

  // Refresh button handler
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        refreshBtn.style.transform = '';
      }, 500);
      fetchWeather(true);
    });
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fetchWeather();
    });
  } else {
    fetchWeather();
  }

  // Auto-refresh every 10 minutes
  setInterval(() => {
    fetchWeather(true);
  }, CACHE_DURATION);
})();



