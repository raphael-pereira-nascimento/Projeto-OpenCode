// ============================================================
// A MESA DO MESTRE - Main JavaScript
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

  // ============================================================
  // 1. NAVBAR SCROLL EFFECT
  // ============================================================
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // ============================================================
  // 2. WELCOME MODAL (once per session)
  // ============================================================
  function initWelcomeModal() {
    const welcomeShown = sessionStorage.getItem('welcomeShown');
    if (!welcomeShown) {
      const welcomeModal = new bootstrap.Modal('#welcomeModal', {
        backdrop: 'static',
        keyboard: false
      });
      welcomeModal.show();
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }

  // ============================================================
  // 3. D20 DICE ROLLER
  // ============================================================
  function initDiceRoller() {
    const diceBtn = document.getElementById('diceButton');
    const diceResult = document.getElementById('diceResult');
    if (!diceBtn) return;

    const critiques = [
      'Crítico! 🎉 Que os deuses te abençoem!',
      'Natural 20! A sorte está ao seu lado!',
      'Sucesso absoluto! O mestre se curva!'
    ];
    const failures = [
      'Natural 1... Você tropeça na própria espada.',
      'Falha crítica! O dragão ri de você.',
      'Desastre! Role novamente... se tiver coragem.'
    ];
    const normals = [
      'Um resultado mediano. O mestre anota.',
      'Você consegue... por pouco.',
      'Sucesso! Mas sem grandes glórias.'
    ];

    diceBtn.addEventListener('click', function () {
      if (diceBtn.classList.contains('rolling')) return;

      diceBtn.classList.add('rolling');
      diceResult.classList.remove('show');

      setTimeout(function () {
        const roll = Math.floor(Math.random() * 20) + 1;
        diceBtn.textContent = '?';
        diceResult.textContent = roll;

        let msg = '';
        if (roll === 20) msg = critiques[Math.floor(Math.random() * critiques.length)];
        else if (roll === 1) msg = failures[Math.floor(Math.random() * failures.length)];
        else msg = normals[Math.floor(Math.random() * normals.length)];

        diceResult.title = msg;
        diceResult.classList.add('show');
        diceBtn.classList.remove('rolling');
        diceBtn.textContent = 'D20';

        addXP(5);

        setTimeout(function () {
          diceResult.classList.remove('show');
        }, 2500);
      }, 600);
    });
  }

  // ============================================================
  // 4. SHOPPING CART SYSTEM
  // ============================================================
  let cart = JSON.parse(localStorage.getItem('mesaDoMestreCart')) || [];

  function saveCart() {
    localStorage.setItem('mesaDoMestreCart', JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(item) {
    const existing = cart.find(function (i) { return i.id === item.id; });
    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty || 1,
        icon: item.icon || 'bi-box-seam'
      });
    }
    saveCart();
    showCartToast(item.name + ' adicionado ao inventário!');

    const btn = document.querySelector('[data-item-id="' + item.id + '"]');
    if (btn) {
      btn.classList.add('added');
      btn.textContent = '✓ Adicionado';
      setTimeout(function () {
        btn.classList.remove('added');
        btn.innerHTML = '<i class="bi bi-cart-plus"></i> Adicionar';
      }, 2000);
    }
  }

  function removeFromCart(id) {
    cart = cart.filter(function (item) { return item.id !== id; });
    saveCart();
  }

  function updateQty(id, delta) {
    const item = cart.find(function (i) { return i.id === id; });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(id);
    } else {
      saveCart();
    }
  }

  function getCartTotal() {
    return cart.reduce(function (total, item) { return total + item.price * item.qty; }, 0);
  }

  function getCartCount() {
    return cart.reduce(function (count, item) { return count + item.qty; }, 0);
  }

  function updateCartUI() {
    const countEl = document.getElementById('cartCount');
    const itemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const emptyEl = document.getElementById('cartEmpty');

    if (countEl) countEl.textContent = getCartCount();
    if (countEl) countEl.style.display = getCartCount() > 0 ? 'flex' : 'none';

    if (itemsEl) {
      if (cart.length === 0) {
        itemsEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
      } else {
        if (emptyEl) emptyEl.style.display = 'none';
        itemsEl.innerHTML = cart.map(function (item) {
          return '<div class="cart-item">' +
            '<div class="cart-item-img"><i class="bi ' + item.icon + '"></i></div>' +
            '<div class="cart-item-details">' +
            '<div class="cart-item-name">' + item.name + '</div>' +
            '<div class="cart-item-price">' + item.price + ' PO</div>' +
            '<div class="cart-item-qty">' +
            '<button onclick="window.updateQtyFromCart(\'' + item.id + '\', -1)"><i class="bi bi-dash"></i></button>' +
            '<span>' + item.qty + '</span>' +
            '<button onclick="window.updateQtyFromCart(\'' + item.id + '\', 1)"><i class="bi bi-plus"></i></button>' +
            '<button class="cart-item-remove" onclick="window.removeFromCart(\'' + item.id + '\')"><i class="bi bi-trash3"></i></button>' +
            '</div></div></div>';
        }).join('');
      }
    }

    if (totalEl) totalEl.textContent = getCartTotal() + ' PO';
  }

  window.addToCart = addToCart;
  window.removeFromCart = function (id) { removeFromCart(id); };
  window.updateQtyFromCart = function (id, delta) { updateQty(id, delta); };

  function initCartButtons() {
    document.querySelectorAll('.btn-add-cart').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        addToCart({
          id: btn.dataset.itemId,
          name: btn.dataset.itemName,
          price: parseFloat(btn.dataset.itemPrice),
          icon: btn.dataset.itemIcon || 'bi-box-seam',
          qty: 1
        });
      });
    });
  }

  function showCartToast(msg) {
    const toastEl = document.getElementById('cartToast');
    if (!toastEl) return;
    const toastBody = toastEl.querySelector('.toast-body');
    if (toastBody) toastBody.textContent = msg;
    const toast = new bootstrap.Toast(toastEl, { delay: 2000 });
    toast.show();
  }

  // ============================================================
  // 5. QUIZ SYSTEM
  // ============================================================
  const quizData = [
    {
      question: 'Como você resolve um conflito?',
      options: [
        { text: 'Com força bruta e coragem', class: 'Guerreiro', icon: 'bi-shield' },
        { text: 'Com inteligência e estratégia', class: 'Mago', icon: 'bi-magic' },
        { text: 'Com astúcia e furtividade', class: 'Ladino', icon: 'bi-eye-slash' },
        { text: 'Com fé e proteção divina', class: 'Clérigo', icon: 'bi-brightness-alt-high' }
      ]
    },
    {
      question: 'Qual ambiente você prefere?',
      options: [
        { text: 'O campo de batalha', class: 'Guerreiro', icon: 'bi-shield' },
        { text: 'Uma biblioteca arcana', class: 'Mago', icon: 'bi-magic' },
        { text: 'As sombras da cidade', class: 'Ladino', icon: 'bi-eye-slash' },
        { text: 'Um templo sagrado', class: 'Clérigo', icon: 'bi-brightness-alt-high' }
      ]
    },
    {
      question: 'Qual seu tipo de magia favorita?',
      options: [
        { text: 'Magia de aprimoramento físico', class: 'Guerreiro', icon: 'bi-shield' },
        { text: 'Magia elemental', class: 'Mago', icon: 'bi-magic' },
        { text: 'Ilusões e truques', class: 'Ladino', icon: 'bi-eye-slash' },
        { text: 'Magia de cura', class: 'Clérigo', icon: 'bi-brightness-alt-high' }
      ]
    }
  ];

  const classResults = {
    Guerreiro: { icon: 'bi-shield', desc: 'Você é a linha de frente! Corajoso e forte, sempre pronto para uma boa batalha... ou uma boa cerveja.' },
    Mago: { icon: 'bi-magic', desc: 'Sábio e misterioso, você prefere os livros às espadas. Seu conhecimento é sua maior arma.' },
    Ladino: { icon: 'bi-eye-slash', desc: 'Ágil e sorrateiro, você encontra soluções onde ninguém mais vê. Cuidado com sua bolsa!' },
    Clérigo: { icon: 'bi-brightness-alt-high', desc: 'Protetor e generoso, você sempre cura os feridos e ilumina o caminho dos companheiros.' }
  };

  let currentQuiz = 0;
  let quizAnswers = [];

  function initQuiz() {
    const quizModal = document.getElementById('quizModal');
    if (!quizModal) return;

    document.querySelectorAll('[data-quiz-trigger]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentQuiz = 0;
        quizAnswers = [];
        showQuizQuestion();
        var modal = new bootstrap.Modal('#quizModal');
        modal.show();
      });
    });
  }

  function showQuizQuestion() {
    var container = document.getElementById('quizQuestions');
    var resultContainer = document.getElementById('quizResult');
    var startContainer = document.getElementById('quizStart');
    if (!container) return;

    if (startContainer) startContainer.style.display = 'none';
    if (resultContainer) resultContainer.style.display = 'none';
    container.style.display = 'block';

    if (currentQuiz >= quizData.length) {
      showQuizResult();
      return;
    }

    var q = quizData[currentQuiz];
    container.innerHTML =
      '<div class="quiz-question">' +
      '<h5><i class="bi bi-quest"></i> Pergunta ' + (currentQuiz + 1) + ' de ' + quizData.length + '</h5>' +
      '<p>' + q.question + '</p>' +
      q.options.map(function (opt, idx) {
        return '<button class="quiz-option" data-class="' + opt.class + '" data-index="' + idx + '">' +
          '<i class="bi ' + opt.icon + ' me-2"></i>' + opt.text + '</button>';
      }).join('') +
      '</div>';

    container.querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        quizAnswers.push(btn.dataset.class);
        currentQuiz++;
        showQuizQuestion();
        btn.classList.add('selected');
        setTimeout(function () {
          showQuizQuestion();
        }, 300);
      });
    });
  }

  function showQuizResult() {
    var container = document.getElementById('quizQuestions');
    var resultContainer = document.getElementById('quizResult');
    if (!container || !resultContainer) return;

    container.style.display = 'none';
    resultContainer.style.display = 'block';

    var counts = {};
    quizAnswers.forEach(function (c) { counts[c] = (counts[c] || 0) + 1; });
    var winner = Object.keys(counts).reduce(function (a, b) {
      return counts[a] > counts[b] ? a : b;
    });

    var result = classResults[winner] || classResults.Guerreiro;
    resultContainer.innerHTML =
      '<div class="quiz-result">' +
      '<div class="result-icon"><i class="bi ' + result.icon + '"></i></div>' +
      '<div class="result-class">' + winner + '</div>' +
      '<div class="result-desc">' + result.desc + '</div>' +
      '<button class="btn-medieval btn-medieval-gold mt-3" onclick="location.reload()">' +
      '<i class="bi bi-arrow-repeat"></i> Jogar Novamente</button>' +
      '</div>';

    localStorage.setItem('mesaDoMestreClasse', winner);
    addXP(20);
  }

  // ============================================================
  // 6. XP / GAMIFICATION SYSTEM
  // ============================================================
  function initXP() {
    var xp = parseInt(localStorage.getItem('mesaDoMestreXP')) || 0;
    var level = parseInt(localStorage.getItem('mesaDoMestreLevel')) || 1;
    var nextLevelXP = level * 100;
    var playerClass = localStorage.getItem('mesaDoMestreClasse') || 'Aventureiro';

    updateXPDB(xp, level, nextLevelXP, playerClass);
  }

  function addXP(amount) {
    var xp = parseInt(localStorage.getItem('mesaDoMestreXP')) || 0;
    var level = parseInt(localStorage.getItem('mesaDoMestreLevel')) || 1;
    var nextLevelXP = level * 100;
    var playerClass = localStorage.getItem('mesaDoMestreClasse') || 'Aventureiro';

    xp += amount;

    if (xp >= nextLevelXP) {
      xp -= nextLevelXP;
      level++;
      nextLevelXP = level * 100;
      showLevelUp(level);
    }

    localStorage.setItem('mesaDoMestreXP', xp);
    localStorage.setItem('mesaDoMestreLevel', level);
    updateXPDB(xp, level, nextLevelXP, playerClass);
  }

  function updateXPDB(xp, level, nextLevel, playerClass) {
    var container = document.getElementById('xpContainer');
    if (!container) return;

    container.classList.add('show');
    var pct = Math.min(Math.floor((xp / nextLevel) * 100), 100);

    document.getElementById('xpLevel').textContent = 'Nv. ' + level;
    document.getElementById('xpClass').textContent = playerClass;
    document.getElementById('xpBarFill').style.width = pct + '%';
    document.getElementById('xpBarText').textContent = xp + ' / ' + nextLevel + ' XP';
  }

  function showLevelUp(level) {
    var toast = document.createElement('div');
    toast.className = 'xp-toast show';
    toast.innerHTML =
      '<i class="bi bi-star-fill"></i>' +
      '<h3>LEVEL UP!</h3>' +
      '<p>Você alcançou o Nível ' + level + '!</p>' +
      '<p class="text-muted small">Que sua jornada continue gloriosa!</p>';
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 500);
    }, 3000);
  }

  window.addXP = addXP;

  // ============================================================
  // 7. GALLERY LIGHTBOX
  // ============================================================
  function initGallery() {
    var lightbox = document.getElementById('galleryLightbox');
    var lightboxImg = document.getElementById('lightboxImage');
    if (!lightbox) return;

    document.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var img = item.querySelector('img');
        if (img && img.src) {
          lightboxImg.src = img.src;
          lightbox.classList.add('show');
        }
      });
    });

    var closeBtn = lightbox.querySelector('.lightbox-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        lightbox.classList.remove('show');
      });
    }

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        lightbox.classList.remove('show');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('show')) {
        lightbox.classList.remove('show');
      }
    });
  }

  // ============================================================
  // 8. SCROLL ANIMATIONS (Intersection Observer)
  // ============================================================
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ============================================================
  // 9. FORM VALIDATION
  // ============================================================
  function initFormValidation() {
    var forms = document.querySelectorAll('.needs-validation');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          event.preventDefault();
          showFormSuccess(form);
        }
        form.classList.add('was-validated');
      });
    });
  }

  function showFormSuccess(form) {
    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      var original = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check-lg"></i> Enviado!';
      btn.disabled = true;

      setTimeout(function () {
        form.reset();
        form.classList.remove('was-validated');
        btn.innerHTML = original;
        btn.disabled = false;
      }, 3000);
    }

    var toastEl = document.getElementById('formSuccessToast');
    if (toastEl) {
      var toast = new bootstrap.Toast(toastEl, { delay: 3000 });
      toast.show();
    }
  }

  // ============================================================
  // 10. EASTER EGG (Logo click x3)
  // ============================================================
  function initEasterEgg() {
    var logo = document.querySelector('.navbar-brand');
    if (!logo) return;

    var clickCount = 0;

    logo.addEventListener('click', function (e) {
      clickCount++;
      if (clickCount >= 3) {
        clickCount = 0;
        var modal = new bootstrap.Modal('#easterEggModal');
        modal.show();
        addXP(10);
      }
    });
  }

  // ============================================================
  // 11. MUSIC PLAYER
  // ============================================================
  function initMusicPlayer() {
    var toggle = document.getElementById('musicToggle');
    if (!toggle) return;

    var audio = new Audio();
    var isPlaying = false;

    var tavernSongs = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    ];

    toggle.addEventListener('click', function () {
      if (isPlaying) {
        audio.pause();
        toggle.classList.remove('playing');
        toggle.innerHTML = '<i class="bi bi-music-note"></i>';
        isPlaying = false;
      } else {
        audio.src = tavernSongs[Math.floor(Math.random() * tavernSongs.length)];
        audio.volume = 0.3;
        audio.loop = true;
        audio.play().then(function () {
          toggle.classList.add('playing');
          toggle.innerHTML = '<i class="bi bi-pause-fill"></i>';
          isPlaying = true;
        }).catch(function () {
          toggle.innerHTML = '<i class="bi bi-music-note-slash"></i>';
          setTimeout(function () {
            toggle.innerHTML = '<i class="bi bi-music-note"></i>';
          }, 2000);
        });
      }
    });
  }

  // ============================================================
  // 12. NEWSLETTER SUBSCRIPTION
  // ============================================================
  function initNewsletter() {
    var form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        var toastEl = document.getElementById('newsletterToast');
        if (toastEl) {
          toastEl.querySelector('.toast-body').textContent =
            '&#x1F3B6; Bem-vindo à guilda, ' + input.value.split('@')[0] + '! Você receberá novidades e runas de desconto.';
          var toast = new bootstrap.Toast(toastEl, { delay: 4000 });
          toast.show();
        }
        input.value = '';
        addXP(5);
      }
    });
  }

  // ============================================================
  // 13. BLOG POST MODAL
  // ============================================================
  function initBlogPosts() {
    document.querySelectorAll('[data-blog-post]').forEach(function (card) {
      card.addEventListener('click', function () {
        var postId = card.dataset.blogPost;
        var title = card.dataset.postTitle || 'Post';
        var content = card.dataset.postContent || '';
        var date = card.dataset.postDate || '';
        var author = card.dataset.postAuthor || 'Mestre';

        var modalEl = document.getElementById('blogPostModal');
        if (!modalEl) return;

        modalEl.querySelector('.modal-title').textContent = title;
        modalEl.querySelector('.modal-body').innerHTML =
          '<p class="text-muted small">Por <strong>' + author + '</strong> | ' + date + '</p>' +
          '<hr class="section-divider-full">' +
          '<div>' + content + '</div>';

        var modal = new bootstrap.Modal(modalEl);
        modal.show();
      });
    });
  }

  // ============================================================
  // 14. HERO PARTICLES
  // ============================================================
  function initHeroParticles() {
    var container = document.querySelector('.hero-particles');
    if (!container) return;

    for (var i = 0; i < 30; i++) {
      var span = document.createElement('span');
      var size = Math.random() * 4 + 1;
      span.style.width = size + 'px';
      span.style.height = size + 'px';
      span.style.left = Math.random() * 100 + '%';
      span.style.animationDuration = (Math.random() * 20 + 10) + 's';
      span.style.animationDelay = (Math.random() * 20) + 's';
      span.style.opacity = Math.random() * 0.5 + 0.1;
      container.appendChild(span);
    }
  }

  // ============================================================
  // 15. PARALLAX ON SCROLL
  // ============================================================
  function initParallax() {
    var sections = document.querySelectorAll('.parallax-section');
    if (sections.length === 0) return;

    window.addEventListener('scroll', function () {
      sections.forEach(function (section) {
        var rect = section.getBoundingClientRect();
        var speed = 0.3;
        var yPos = -(rect.top * speed);
        section.style.backgroundPosition = 'center ' + (yPos * 0.5) + 'px';
      });
    });
  }

  // ============================================================
  // 16. STORE QUANTITY INPUTS
  // ============================================================
  function initStoreQty() {
    document.querySelectorAll('.store-qty-minus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = btn.parentElement.querySelector('.store-qty-input');
        var val = parseInt(input.value) || 1;
        if (val > 1) input.value = val - 1;
      });
    });

    document.querySelectorAll('.store-qty-plus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = btn.parentElement.querySelector('.store-qty-input');
        var val = parseInt(input.value) || 1;
        if (val < 99) input.value = val + 1;
      });
    });
  }

  // ============================================================
  // 17. PHONE MASK
  // ============================================================
  function initPhoneMask() {
    document.querySelectorAll('.phone-mask').forEach(function (input) {
      input.addEventListener('input', function () {
        var val = input.value.replace(/\D/g, '');
        if (val.length <= 11) {
          val = val.replace(/^(\d{2})(\d)/, '($1) $2');
          val = val.replace(/(\d{5})(\d)/, '$1-$2');
          input.value = val;
        }
      });
    });
  }

  // ============================================================
  // 18. CHECKOUT
  // ============================================================
  function initCheckout() {
    var btn = document.getElementById('checkoutBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      if (cart.length === 0) {
        showCartToast('Seu inventário está vazio, aventureiro!');
        return;
      }

      var modal = new bootstrap.Modal('#checkoutModal');
      modal.show();
    });

    var confirmBtn = document.getElementById('confirmCheckout');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function () {
        var cartTotal = getCartTotal();

        var toastEl = document.getElementById('formSuccessToast');
        if (toastEl) {
          toastEl.querySelector('.toast-body').innerHTML =
            '<i class="bi bi-check-circle-fill text-success"></i> Pedido realizado! Total: ' + cartTotal +
            ' PO. Em breve enviaremos um corvo mensageiro com os detalhes.';
          var toast = new bootstrap.Toast(toastEl, { delay: 5000 });
          toast.show();
        }

        cart = [];
        saveCart();

        var modalEl = document.getElementById('checkoutModal');
        var modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
      });
    }
  }

  // ============================================================
  // 19. RESERVATION DATE MIN
  // ============================================================
  function initReservationDate() {
    var dateInput = document.getElementById('reservaData');
    if (dateInput) {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      dateInput.min = yyyy + '-' + mm + '-' + dd;
    }
  }

  // ============================================================
  // INITIALIZE ALL
  // ============================================================
  initNavbarScroll();
  initWelcomeModal();
  initDiceRoller();
  initQuiz();
  initXP();
  initGallery();
  initScrollAnimations();
  initFormValidation();
  initEasterEgg();
  initMusicPlayer();
  initNewsletter();
  initBlogPosts();
  initHeroParticles();
  initParallax();
  initStoreQty();
  initPhoneMask();
  initCheckout();
  initReservationDate();

  updateCartUI();

  document.querySelectorAll('.btn-add-cart').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      addToCart({
        id: btn.dataset.itemId,
        name: btn.dataset.itemName,
        price: parseFloat(btn.dataset.itemPrice),
        icon: btn.dataset.itemIcon || 'bi-box-seam',
        qty: 1
      });
    });
  });
});
