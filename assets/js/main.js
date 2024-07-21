(function() {
  "use strict";

  // Fetch project data
  const fetchProjectData = async () => {
    try {
      const response = await fetch('project.json');
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      return {};
    }
  };

  // Helper Functions
  const select = (el, all = false) => all ? [...document.querySelectorAll(el)] : document.querySelector(el);
  const on = (type, el, listener, all = false) => {
    const elements = select(el, all);
    if (elements) {
      if (all) elements.forEach(e => e.addEventListener(type, listener));
      else elements.addEventListener(type, listener);
    }
  };
  const onscroll = (el, listener) => el.addEventListener('scroll', listener);

  // Navbar links active state on scroll
  const updateNavbarLinks = () => {
    const position = window.scrollY + 200;
    select('#navbar .scrollto', true).forEach(link => {
      const section = select(link.hash);
      if (section && position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };
  window.addEventListener('load', updateNavbarLinks);
  onscroll(document, updateNavbarLinks);

  // Smooth Scrolling
  const scrollto = (el) => {
    const header = select('#header');
    const offset = header.classList.contains('header-scrolled') ? header.offsetHeight : header.offsetHeight - 16;
    window.scrollTo({
      top: select(el).offsetTop - offset,
      behavior: 'smooth'
    });
  };

  // Header Scroll Effect
  const handleHeaderScrolled = () => {
    select('#header').classList.toggle('header-scrolled', window.scrollY > 100);
  };
  window.addEventListener('load', handleHeaderScrolled);
  onscroll(document, handleHeaderScrolled);

  // Back to Top Button
  const backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () => backtotop.classList.toggle('active', window.scrollY > 100);
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  // Mobile Nav Toggle
  on('click', '.mobile-nav-toggle', function() {
    const navbar = select('#navbar');
    navbar.classList.toggle('navbar-mobile');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  });

  // Mobile Nav Dropdowns
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault();
      this.nextElementSibling.classList.toggle('dropdown-active');
    }
  }, true);

  // Smooth Scroll on .scrollto Click
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault();
      const navbar = select('#navbar');
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile');
        const navbarToggle = select('.mobile-nav-toggle');
        navbarToggle.classList.toggle('bi-list');
        navbarToggle.classList.toggle('bi-x');
      }
      scrollto(this.hash);
    }
  }, true);

  // Scroll with offset on Page Load
  window.addEventListener('load', () => {
    if (window.location.hash) {
      scrollto(window.location.hash);
    }
  });

  // Intro Type Effect
  const typed = select('.typed');
  if (typed) {
    const typedStrings = typed.getAttribute('data-typed-items').split(',');
    new Typed('.typed', {
      strings: typedStrings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  // Lightbox and Sliders Initialization
  GLightbox({ selector: '.portfolio-lightbox' });

  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    slidesPerView: 'auto',
    pagination: { el: '.swiper-pagination', type: 'bullets', clickable: true }
  });

  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', type: 'bullets', clickable: true }
  });

  // Preloader
  const preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => preloader.remove());
  }

  // Pure Counter Initialization
  new PureCounter();

  // Project Modal Logic
  const modal = select('#project-modal');

  const renderProjectModal = (data, color) => {
    modal.children[0].innerHTML = data.title;
    modal.children[1].innerHTML = data.description;
    const githubLink = modal.children[2];
    githubLink.style.display = data.github ? 'block' : 'none';
    if (data.github) githubLink.firstElementChild.href = data.github;
    const youtubeLink = modal.children[3];
    youtubeLink.style.display = data.youtube ? 'block' : 'none';
    if (data.youtube) youtubeLink.firstElementChild.href = data.youtube;
    modal.classList.add('shown', color);
    modal.openingElement = p;
    const pattern = Trianglify({
      width: modal.clientWidth,
      height: modal.clientHeight,
      x_colors: ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#333333', '#1a1a1a', '#000000']
    });
    modal.style.background = `url(${pattern.png()})`;
  };

  fetchProjectData().then(projectData => {
    const sortedProjects = Object.entries(projectData)
      .sort((a, b) => a[1].priority - b[1].priority)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    selectAll('.proj').forEach(p => {
      p.addEventListener('click', () => {
        const data = sortedProjects[p.getAttribute('data-proj')];
        const color = p.parentElement.getAttribute('data-cat');
        renderProjectModal(data, color);
      });
    });

    select('#project-modal .close').addEventListener('click', () => {
      modal.classList.remove('shown');
    });
  });

  // Update Project Div Heights
  const projectDivs = selectAll('.projects');
  const updateProjectDivHeights = () => {
    projectDivs.forEach(div => {
      div.style.height = `${window.innerHeight - div.getBoundingClientRect().y - 30}px`;
    });
    selectAll('.scrollbar').forEach(bar => bar.update());
  };
  window.addEventListener('resize', updateProjectDivHeights);
  updateProjectDivHeights();

  // Project Filtering
  const filterProjects = () => {
    const techstackFilter = select('#techstack-filter').value;
    const categoryFilter = select('#category-filter').value;

    selectAll('.proj').forEach(proj => {
      const techstack = proj.getAttribute('data-techstack').split(',');
      const category = proj.getAttribute('data-category');
      const show = (!techstackFilter || techstack.includes(techstackFilter)) &&
                   (!categoryFilter || category === categoryFilter);
      proj.style.display = show ? 'block' : 'none';
    });
  };

  on('change', '#techstack-filter', filterProjects);
  on('change', '#category-filter', filterProjects);
})();
