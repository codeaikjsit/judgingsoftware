document.addEventListener("DOMContentLoaded", () => {
    // =========================================================================
    // 1. TIME-BASED THEME CONTROLLER
    // =========================================================================
    const root = document.documentElement;
    const timeDisplay = document.getElementById("vibeTimeDisplay");
    
    const themes = {
        dawn: { bg: '#1a1829', accent: '#ff7b54', text: '#ffe6cc', ambient: 'rgba(255, 123, 84, 0.1)' },
        day: { bg: '#0f1018', accent: '#d4af37', text: '#f1f5f9', ambient: 'rgba(212, 175, 55, 0.05)' },
        goldenHour: { bg: '#2b1a10', accent: '#ffb347', text: '#fff3e0', ambient: 'rgba(255, 179, 71, 0.1)' },
        twilight: { bg: '#0a0a2a', accent: '#a262cc', text: '#e6e6fa', ambient: 'rgba(162, 98, 204, 0.1)' },
        midnight: { bg: '#05060b', accent: '#3b82f6', text: '#bfdbfe', ambient: 'rgba(59, 130, 246, 0.1)' }
    };

    function updateThemeAndClock() {
        const now = new Date();
        const hours = now.getHours();
        const mins = now.getMinutes();
        const secs = now.getSeconds();

        // Update Text Clock
        if (timeDisplay) {
            timeDisplay.innerText = 
                String(hours).padStart(2, '0') + ":" + 
                String(mins).padStart(2, '0') + ":" + 
                String(secs).padStart(2, '0');
        }

        // Determine Theme based on hours
        let currentTheme = themes.day;
        if (hours >= 5 && hours < 8) currentTheme = themes.dawn;
        else if (hours >= 8 && hours < 17) currentTheme = themes.day;
        else if (hours >= 17 && hours < 19) currentTheme = themes.goldenHour;
        else if (hours >= 19 && hours < 21) currentTheme = themes.twilight;
        else currentTheme = themes.midnight;

        // Apply Theme variables smoothly via CSS transition
        root.style.setProperty('--vibe-bg', currentTheme.bg);
        root.style.setProperty('--vibe-accent', currentTheme.accent);
        root.style.setProperty('--vibe-text', currentTheme.text);
        root.style.setProperty('--vibe-ambient', currentTheme.ambient);
        
        // Return time data for 3D clock
        return { hours, mins, secs, ms: now.getMilliseconds() };
    }

    // Init first time update
    updateThemeAndClock();

    // =========================================================================
    // 3. GSAP INITIAL ANIMATIONS & TRANSITIONS
    // =========================================================================
    
    // Intro sequence
    try {
        const tl = gsap.timeline();
        tl.to(".vibe-time-display", { opacity: 1, duration: 2, ease: "power2.out", delay: 0.5 })
          .to(".vibe-title", { opacity: 1, y: -20, duration: 1.5, ease: "power3.out" }, "-=1")
          .to(".vibe-subtitle", { opacity: 1, duration: 1, ease: "power2.out" }, "-=1")
          .to(".vibe-btn", { opacity: 1, y: -10, duration: 1, ease: "back.out(1.7)" }, "-=0.5");
    } catch (err) {
        console.warn("GSAP intro sequence failed:", err);
        // Fallback if GSAP is blocked: force visibility
        const els = document.querySelectorAll(".vibe-time-display, .vibe-title, .vibe-subtitle, .vibe-btn");
        els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    }

    // =========================================================================
    // 2. THREE.JS KINETIC CLOCK
    // =========================================================================
    const canvasContainer = document.getElementById("threeClockCanvas");
    let camera, composer, renderer, scene, particlesMesh, pointLight, particlesMat;
    
    if (canvasContainer) {
        try {
            scene = new THREE.Scene();
            
            // Add Fog matching background
            scene.fog = new THREE.FogExp2(0x000000, 0.02);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 15;

            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            canvasContainer.appendChild(renderer.domElement);

            const renderScene = new THREE.RenderPass(scene, camera);
            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.8, // strength
                0.5, // radius
                0.2 // threshold
            );
            
            composer = new THREE.EffectComposer(renderer);
            composer.addPass(renderScene);
            composer.addPass(bloomPass);

            // Dynamic Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
            scene.add(ambientLight);

            pointLight = new THREE.PointLight(0xffffff, 2, 50);
            pointLight.position.set(0, 0, 5);
            scene.add(pointLight);

            // Particles for aesthetic dust
            const particlesGeo = new THREE.BufferGeometry();
            const particlesCount = 3000;
            const posArray = new Float32Array(particlesCount * 3);
            for(let i = 0; i < particlesCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 60;
            }
            particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            particlesMat = new THREE.PointsMaterial({
                size: 0.03,
                color: 0xffffff,
                transparent: true,
                opacity: 0.5,
                blending: THREE.AdditiveBlending
            });
            particlesMesh = new THREE.Points(particlesGeo, particlesMat);
            scene.add(particlesMesh);

            let mouseX = 0;
            let mouseY = 0;
            document.addEventListener('mousemove', (e) => {
                mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                mouseY = (e.clientY / window.innerHeight) * 2 - 1;
            });

            window.addEventListener('resize', () => {
                if (camera && renderer && composer) {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    composer.setSize(window.innerWidth, window.innerHeight);
                }
            });

            animate();
        } catch (e) {
            console.warn("Three.js initialization failed, rendering fallback text instead:", e);
        }
    }

    // Update colors dynamically based on CSS var
    function updateThreeColors() {
        if (!pointLight || !particlesMat || !scene) return;
        const computedStyle = getComputedStyle(document.documentElement);
        const accent = computedStyle.getPropertyValue('--vibe-accent').trim();
        const bg = computedStyle.getPropertyValue('--vibe-bg').trim();
        if(accent) {
            pointLight.color.set(accent);
            particlesMat.color.set(accent);
        }
        if(bg) {
            scene.fog.color.set(bg);
        }
    }

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        
        const timeData = updateThemeAndClock();
        updateThreeColors();

        if (particlesMesh && camera && composer) {
            const time = Date.now() * 0.001;

            // Rotate particles slowly
            particlesMesh.rotation.y += 0.001;

            // Camera gentle movement based on mouse (parallax 0.01 max)
            // Note: assuming mouseX/Y are in closure or global, they were moved up
            camera.lookAt(scene.position);

            composer.render();
        }
    }

    // Enter Button Logic
    const enterBtn = document.getElementById("vibeEnterBtn");
    if (enterBtn) {
        enterBtn.addEventListener("click", () => {
            // Epic exit animation
            try {
                const exitTl = gsap.timeline();
                
                exitTl.to(".vibe-overlay-content > *", {
                    y: -50,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.in"
                });
                
                if (camera) {
                    exitTl.to(camera.position, {
                        z: 2,
                        duration: 1.5,
                        ease: "power4.in"
                    }, "-=0.5");
                }
                
                exitTl.to(canvasContainer, {
                    opacity: 0,
                    duration: 1
                }, "-=0.5")
                .to(".vibe-landing-container", {
                    opacity: 0,
                    duration: 1,
                    onComplete: () => {
                        document.getElementById("vibeLandingContainer").style.display = "none";
                        const loginView = document.getElementById("loginView");
                        if (loginView) {
                            gsap.fromTo(loginView, 
                                { opacity: 0, scale: 0.95 },
                                { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
                            );
                        }
                    }
                });
            } catch (err) {
                // Fallback exit if GSAP fails
                document.getElementById("vibeLandingContainer").style.display = "none";
                const loginView = document.getElementById("loginView");
                if (loginView) {
                    loginView.style.opacity = '1';
                }
            }
        });
    }

    // =========================================================================
    // 4. GSAP BUTTON HOVER EFFECTS (Replaced Magnetic)
    // =========================================================================
    document.addEventListener('mouseover', (e) => {
        const btn = e.target.closest('.btn');
        if (btn && !btn.dataset.hoverInit) {
            btn.dataset.hoverInit = 'true';
            
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    scale: 1.05,
                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    scale: 1,
                    boxShadow: 'none',
                    duration: 0.4,
                    ease: "power2.out"
                });
            });
        }
    });
});
