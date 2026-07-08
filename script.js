class AdvancedParticleSystem {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = window.innerWidth < 768 ? 40 : 80;
        this.time = 0;
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.init();
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('mousemove', (e) => this.updateMouse(e));
    }

    init() {
        this.setupCanvas();
        this.createParticles();
        this.animate();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1;
            pointer-events: none;
        `;
        this.container.appendChild(this.canvas);
    }

    updateMouse(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        const newCount = window.innerWidth < 768 ? 40 : 80;
        if (newCount !== this.particleCount) {
            this.particleCount = newCount;
            this.particles = [];
            this.createParticles();
        }
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const angle = (Math.PI * 2 * i) / this.particleCount;
            const distance = 100 + Math.random() * 300;
            
            const particle = {
                x: window.innerWidth / 2 + Math.cos(angle) * distance,
                y: window.innerHeight / 2 + Math.sin(angle) * distance,
                baseX: window.innerWidth / 2 + Math.cos(angle) * distance,
                baseY: window.innerHeight / 2 + Math.sin(angle) * distance,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.6 + 0.3,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                velocityX: 0,
                velocityY: 0,
                angle: angle,
                index: i
            };
            
            this.particles.push(particle);
        }
    }

    updateParticles() {
        this.time += 0.005;

        this.particles.forEach((particle, i) => {
            // Wave motion
            const wave = Math.sin(this.time + particle.angle * 2) * 30;
            const waveDistance = 150 + wave;

            // Target position based on wave
            const targetX = window.innerWidth / 2 + Math.cos(particle.angle) * waveDistance;
            const targetY = window.innerHeight / 2 + Math.sin(particle.angle) * waveDistance;

            // Smooth movement towards target
            particle.velocityX += (targetX - particle.x) * 0.02;
            particle.velocityY += (targetY - particle.y) * 0.02;

            // Apply damping
            particle.velocityX *= 0.95;
            particle.velocityY *= 0.95;

            // Update position
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;

            // Mouse attraction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 200;

            if (distance < maxDistance) {
                const force = (1 - distance / maxDistance) * 0.1;
                particle.x += dx * force;
                particle.y += dy * force;
            }

            // Pulsing opacity
            const pulse = Math.sin(this.time * 2 + i) * 0.3 + 0.5;
            particle.opacity = Math.min(0.8, (Math.random() * 0.6 + 0.3) * pulse);
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connecting lines
        this.ctx.strokeStyle = `rgba(0, 191, 255, 0.15)`;
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = (1 - distance / 150) * 0.2;
                    this.ctx.strokeStyle = `rgba(0, 191, 255, ${opacity})`;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw particles with glow
        this.particles.forEach(particle => {
            // Glow effect
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            
            gradient.addColorStop(0, `rgba(0, 191, 255, ${particle.opacity * 0.8})`);
            gradient.addColorStop(0.5, `rgba(0, 191, 255, ${particle.opacity * 0.3})`);
            gradient.addColorStop(1, `rgba(0, 191, 255, 0)`);

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                particle.x - particle.size * 3,
                particle.y - particle.size * 3,
                particle.size * 6,
                particle.size * 6
            );

            // Core particle
            this.ctx.fillStyle = `rgba(0, 191, 255, ${particle.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize advanced particle system
new AdvancedParticleSystem('#particlesContainer');

// ===================================
// 2. CUSTOM CURSOR
// ===================================

class CustomCursor {
    constructor() {
        this.cursor = document.getElementById('cursor');
        this.follower = document.getElementById('cursorFollower');
        this.mouseX = 0;
        this.mouseY = 0;
        this.followerX = 0;
        this.followerY = 0;
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseenter', () => this.show());
        document.addEventListener('mouseleave', () => this.hide());
    }

    onMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        // Move main cursor
        this.cursor.style.transform = `translate(${this.mouseX - 4}px, ${this.mouseY - 4}px)`;

        // Smooth follower movement
        this.followerX += (this.mouseX - this.followerX) * 0.2;
        this.followerY += (this.mouseY - this.followerY) * 0.2;
        this.follower.style.transform = `translate(${this.followerX - 16}px, ${this.followerY - 16}px)`;

        // Add hover effect on interactive elements
        const target = e.target;
        if (target.matches('a, button, input, textarea, .magnetic-btn')) {
            this.cursor.style.transform = `translate(${this.mouseX - 8}px, ${this.mouseY - 8}px)`;
            this.follower.style.transform = `translate(${this.followerX - 10}px, ${this.followerY - 10}px)`;
        }
    }

    show() {
        this.cursor.style.opacity = '1';
        this.follower.style.opacity = '1';
    }

    hide() {
        this.cursor.style.opacity = '0';
        this.follower.style.opacity = '0';
    }
}

new CustomCursor();

// ===================================
// 3. SCROLL PROGRESS INDICATOR
// ===================================

class ScrollProgress {
    constructor(elementSelector) {
        this.progressBar = document.querySelector(elementSelector);
        window.addEventListener('scroll', () => this.update());
    }

    update() {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        this.progressBar.style.width = scrolled + '%';
    }
}

new ScrollProgress('.scroll-progress');

// ===================================
// 4. REVEAL ANIMATION (INTERSECTION OBSERVER)
// ===================================

class RevealOnScroll {
    constructor() {
        this.revealElements = document.querySelectorAll('.reveal');
        this.observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -100px 0px'
        };
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.revealElements.forEach(el => observer.observe(el));
    }
}

new RevealOnScroll();

// ===================================
// 5. TYPING ANIMATION
// ===================================

class TypingAnimation {
    constructor(elementSelector, texts, speed = 100, deleteSpeed = 50) {
        this.element = document.querySelector(elementSelector);
        this.texts = texts;
        this.speed = speed;
        this.deleteSpeed = deleteSpeed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.start();
    }

    start() {
        this.type();
    }

    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let typeSpeed = this.isDeleting ? this.deleteSpeed : this.speed;

        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = 1500; // Pause at end
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500; // Pause before next text
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

new TypingAnimation('#typingText', [
    '3rd Year B.Tech Student',
    'Aspiring Full-Stack Developer',
    'Problem Solver',
    'Tech Enthusiast'
], 80, 50);

// ===================================
// 6. COUNTER ANIMATION
// ===================================

class CounterAnimation {
    constructor(elementSelector) {
        this.elements = document.querySelectorAll(elementSelector);
        this.duration = 2000;
        this.init();
    }

    init() {
        const options = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.elements.forEach(el => observer.observe(el));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const startTime = Date.now();
        const startValue = 0;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / this.duration, 1);
            const value = Math.floor(startValue + (target - startValue) * progress);
            element.textContent = value.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }
}

new CounterAnimation('.counter');

// ===================================
// 7. SCROLL PARALLAX
// ===================================

class Parallax {
    constructor() {
        this.parallaxElements = document.querySelectorAll('.parallax');
        window.addEventListener('scroll', () => this.update());
    }

    update() {
        this.parallaxElements.forEach(el => {
            const offset = window.scrollY * 0.5;
            el.style.setProperty('--parallax-offset', offset + 'px');
        });
    }
}

new Parallax();

// ===================================
// 8. MAGNETIC BUTTON EFFECT
// ===================================

class MagneticButton {
    constructor() {
        this.buttons = document.querySelectorAll('.magnetic-btn');
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => this.magnetize(e, button));
            button.addEventListener('mouseleave', () => this.release(button));
        });
    }

    magnetize(e, button) {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distance = 40;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;

        button.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    release(button) {
        button.style.transform = 'translate(0, 0)';
    }
}

new MagneticButton();

// ===================================
// 9. 3D TILT EFFECT
// ===================================

class TiltEffect {
    constructor() {
        this.tiltElements = document.querySelectorAll('.tilt');
        this.init();
    }

    init() {
        this.tiltElements.forEach(element => {
            element.addEventListener('mousemove', (e) => this.tilt(e, element));
            element.addEventListener('mouseleave', () => this.reset(element));
        });
    }

    tilt(e, element) {
        const rect = element.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const centerX = rect.left + width / 2;
        const centerY = rect.top + height / 2;

        const angleX = ((e.clientY - centerY) / height) * 20;
        const angleY = ((e.clientX - centerX) / width) * -20;

        element.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.05)`;
    }

    reset(element) {
        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    }
}

new TiltEffect();

// ===================================
// 10. NAVIGATION (STICKY & ACTIVE)
// ===================================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navMenu = document.getElementById('navMenu');
        this.hamburger = document.getElementById('hamburger');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section');
        this.init();
    }

    init() {
        // Hamburger menu
        this.hamburger.addEventListener('click', () => this.toggleMenu());
        
        // Close menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.toggleMenu());
        });

        // Sticky navbar
        window.addEventListener('scroll', () => this.updateStickyNav());

        // Active section highlighting
        window.addEventListener('scroll', () => this.updateActiveLink());
    }

    toggleMenu() {
        this.navMenu.classList.toggle('active');
        this.hamburger.classList.toggle('active');
    }

    updateStickyNav() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    updateActiveLink() {
        let currentSection = '';

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.scrollY >= sectionTop - 200) {
                currentSection = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === currentSection) {
                link.classList.add('active');
            }
        });
    }
}

new Navigation();

// ===================================
// 11. BACK TO TOP BUTTON
// ===================================

class BackToTop {
    constructor() {
        this.button = document.getElementById('backToTop');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.checkScroll());
        this.button.addEventListener('click', () => this.scrollToTop());
    }

    checkScroll() {
        if (window.scrollY > 500) {
            this.button.classList.add('show');
        } else {
            this.button.classList.remove('show');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

new BackToTop();

// ===================================
// 12. CONTACT FORM VALIDATION & SUBMISSION
// ===================================

class ContactForm {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.formMessage = document.getElementById('formMessage');
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateForm() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        let isValid = true;

        // Name validation
        if (name.length < 2) {
            this.showError('nameError', 'Name must be at least 2 characters');
            isValid = false;
        } else {
            this.clearError('nameError');
        }

        // Email validation
        if (!this.validateEmail(email)) {
            this.showError('emailError', 'Please enter a valid email address');
            isValid = false;
        } else {
            this.clearError('emailError');
        }

        // Subject validation
        if (subject.length < 3) {
            this.showError('subjectError', 'Subject must be at least 3 characters');
            isValid = false;
        } else {
            this.clearError('subjectError');
        }

        // Message validation
        if (message.length < 10) {
            this.showError('messageError', 'Message must be at least 10 characters');
            isValid = false;
        } else {
            this.clearError('messageError');
        }

        return isValid;
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        // Show success message (in a real application, this would send to a server)
        this.formMessage.textContent = 'Message sent successfully! I\'ll get back to you soon.';
        this.formMessage.classList.add('success');
        this.formMessage.classList.remove('error');

        // Reset form
        this.form.reset();

        // Clear message after 5 seconds
        setTimeout(() => {
            this.formMessage.textContent = '';
            this.formMessage.classList.remove('success', 'error');
        }, 5000);

        // Optional: Send data to a backend
        // this.sendToBackend(formData);
    }

    sendToBackend(formData) {
        // This would typically send data to a backend service
        // Example: emailjs, formspree, or custom backend
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.formMessage.textContent = 'Message sent successfully!';
                this.formMessage.classList.add('success');
            }
        })
        .catch(error => {
            this.formMessage.textContent = 'Error sending message. Please try again.';
            this.formMessage.classList.add('error');
        });
    }
}

new ContactForm('#contactForm');

// ===================================
// 13. SMOOTH SCROLLING
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// 14. LAZY LOADING FOR IMAGES
// ===================================

class LazyLoadImages {
    constructor() {
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

new LazyLoadImages();

// ===================================
// 15. PAGE LOAD COMPLETION
// ===================================

window.addEventListener('load', () => {
    // Hide loading screen after page loads
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.animation = 'fadeOut 0.6s ease forwards';
        }, 1500);
    }

    // Trigger initial animations
    document.body.style.opacity = '1';
});

// ===================================
// 16. MICRO-INTERACTIONS
// ===================================

// Button ripple effect
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===================================
// 17. PERFORMANCE OPTIMIZATION
// ===================================

// Debounce function for resize and scroll events
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Optimize scroll handler
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            ticking = false;
        });
        ticking = true;
    }
});

// ===================================
// 18. ACCESSIBILITY
// ===================================

// Handle reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('*').forEach(el => {
        el.style.animation = 'none !important';
        el.style.transition = 'none !important';
    });
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('navMenu').classList.remove('active');
        document.getElementById('hamburger').classList.remove('active');
    }
});

// ===================================
// 19. PERFORMANCE MONITORING (Optional)
// ===================================

// Log performance metrics
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page loaded in ${pageLoadTime}ms`);
    });
}

// ===================================
// 20. INITIALIZATION COMPLETE
// ===================================

console.log('%c✨ Premium Portfolio Loaded', 'color: #00BFFF; font-size: 16px; font-weight: bold;');
