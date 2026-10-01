// ===============================================================
// AHMAD SHAH — PORTFOLIO
// Client-side behaviour
// ---------------------------------------------------------------
// Global functions used by index.html inline handlers:
//   showMessage(), openChat(), closeChat(), sendMessage()
// All other behaviour is initialised from init() on DOM ready.
// ===============================================================


// ===============================
// PRELOADER
// ===============================

// Shortest and longest the intro is allowed to last. The minimum stops
// the loader from flashing past on a warm cache; the maximum guarantees
// the page is never left hidden, whatever happens to the load event.
const PRELOADER_MIN_MS = 620;
const PRELOADER_MAX_MS = 2200;

function prefersReducedMotion() {

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;

}

function initPreloader() {

    const root = document.documentElement;
    const loader = document.getElementById("siteLoader");
    const started = performance.now();

    const reduceMotion = prefersReducedMotion();

    let finished = false;
    let safety = null;
    let release = null;

    // Reveal the site and drop the overlay
    function finish() {

        if (finished) {
            return;
        }

        finished = true;

        clearTimeout(safety);
        clearTimeout(release);

        root.classList.remove("is-preloading");

        if (!loader || reduceMotion) {

            if (loader) {
                loader.remove();
            }

            return;
        }

        loader.classList.add("is-done");

        // transitionend is the normal path; the timeout is a safety net
        loader.addEventListener("transitionend", () => loader.remove(), { once: true });
        setTimeout(() => loader.remove(), 900);

    }

    // Wait out the minimum intro, then dismiss
    function finishAfterMinimum() {

        release = setTimeout(finish, Math.max(0, PRELOADER_MIN_MS - (performance.now() - started)));

    }

    // Nothing here may hold the page hostage
    safety = setTimeout(finish, PRELOADER_MAX_MS);

    if (reduceMotion) {
        finish();
        return;
    }

    if (document.readyState === "complete") {
        finishAfterMinimum();
    } else {
        window.addEventListener("load", finishAfterMinimum, { once: true });
    }

}


// ===============================
// CONTACT
// ===============================

function showMessage() {

    const status = document.getElementById("contactStatus");

    if (!status) {
        return;
    }

    status.textContent = "Thank you for contacting me! I'll get back to you soon.";
    status.classList.add("is-visible");

    clearTimeout(status.dataset.timer);

    status.dataset.timer = setTimeout(() => {
        status.classList.remove("is-visible");
    }, 6000);

}


// ===============================
// AI CHATBOT
// ===============================

const chat = {
    window: null,
    messages: null,
    input: null,
    sendButton: null,
    launcher: null,
    isBusy: false
};


// OPEN CHATBOT
// ===============================

function openChat() {

    if (!chat.window) {
        return;
    }

    chat.window.classList.add("is-open");

    // Hide the launcher while the panel is open
    if (chat.launcher) {
        chat.launcher.classList.add("is-hidden");
        chat.launcher.setAttribute("aria-expanded", "true");
    }

    if (chat.input) {
        chat.input.focus();
    }

}


// CLOSE CHATBOT
// ===============================

function closeChat() {

    if (!chat.window) {
        return;
    }

    chat.window.classList.remove("is-open");

    if (chat.launcher) {
        chat.launcher.classList.remove("is-hidden");
        chat.launcher.setAttribute("aria-expanded", "false");
        chat.launcher.focus();
    }

}


// SCROLL CHAT TO LATEST MESSAGE
// ===============================

function scrollChatToBottom() {

    if (!chat.messages) {
        return;
    }

    chat.messages.scrollTop = chat.messages.scrollHeight;

}


// CREATE A MESSAGE BUBBLE
// ===============================

function addMessage(text, role, isError) {

    const bubble = document.createElement("div");

    bubble.className = role === "user" ? "user-message" : "bot-message";

    if (isError) {
        bubble.classList.add("is-error");
    }

    bubble.textContent = text;

    chat.messages.appendChild(bubble);

    scrollChatToBottom();

    return bubble;

}


// SHOW A TYPING INDICATOR
// ===============================

function showTypingIndicator() {

    const bubble = document.createElement("div");

    bubble.className = "bot-message";
    bubble.id = "chatTypingIndicator";

    const dots = document.createElement("span");

    dots.className = "typing-dots";
    dots.setAttribute("role", "status");
    dots.setAttribute("aria-label", "AI is thinking");

    for (let i = 0; i < 3; i++) {
        dots.appendChild(document.createElement("span"));
    }

    bubble.appendChild(dots);

    chat.messages.appendChild(bubble);

    scrollChatToBottom();

    return bubble;

}


// SET INPUT DISABLED STATE WHILE WAITING
// ===============================

function setChatBusy(isBusy) {

    chat.isBusy = isBusy;

    if (chat.input) {
        chat.input.disabled = isBusy;
    }

    if (chat.sendButton) {
        chat.sendButton.disabled = isBusy;
    }

}


// SEND MESSAGE TO AI
// ===============================

async function sendMessage() {

    if (!chat.input || !chat.messages || chat.isBusy) {
        return;
    }

    const message = chat.input.value.trim();

    if (message === "") {
        return;
    }

    // USER MESSAGE
    addMessage(message, "user");

    chat.input.value = "";

    // THINKING INDICATOR
    const typingBubble = showTypingIndicator();

    setChatBusy(true);

    try {

        // CONNECT TO SERVER.JS
        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });

        const data = await response.json();

        typingBubble.remove();

        // AI RESPONSE
        if (response.ok && data.reply) {

            addMessage(data.reply, "bot");

        } else {

            addMessage(
                data.error || "The AI did not return an answer. Please try again.",
                "bot",
                true
            );

        }

    } catch (error) {

        console.error("Chatbot Error:", error);

        typingBubble.remove();

        addMessage(
            "Could not connect to the AI. Please check that the server is running.",
            "bot",
            true
        );

    } finally {

        setChatBusy(false);

        scrollChatToBottom();

        if (chat.input) {
            chat.input.focus();
        }

    }

}


// ===============================
// MOBILE NAVIGATION
// ===============================

function toggleMobileNav() {

    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("primaryNav");

    if (!toggle || !nav) {
        return;
    }

    const isOpen = nav.classList.toggle("is-open");

    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );

    updateNavScrim(isOpen);

}

function updateNavScrim(isOpen) {

    let scrim = document.querySelector(".nav-scrim");

    if (isOpen && !scrim) {
        scrim = document.createElement("div");
        scrim.className = "nav-scrim";
        scrim.addEventListener("click", closeMobileNav);
        document.body.appendChild(scrim);
    }

    if (scrim) {
        scrim.classList.toggle("is-visible", isOpen);
    }

}

function closeMobileNav() {

    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("primaryNav");

    if (nav) {
        nav.classList.remove("is-open");
    }

    if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation menu");
    }

    updateNavScrim(false);

}


// ===============================
// HEADER SCROLL STATE
// ===============================

function initHeaderScroll() {

    const header = document.getElementById("siteHeader");

    if (!header) {
        return;
    }

    const onScroll = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

}


// ===============================
// ACTIVE NAVIGATION LINK
// ===============================

// Slides the pill indicator under whichever link is active
function moveNavIndicator(link) {

    const nav = document.getElementById("primaryNav");
    const indicator = nav ? nav.querySelector(".nav-indicator") : null;

    if (!nav || !indicator) {
        return;
    }

    // Dropped on mobile, where the nav is a vertical dropdown
    if (window.innerWidth <= 860 || !link) {
        indicator.classList.remove("is-visible");
        return;
    }

    indicator.style.width = link.offsetWidth + "px";
    indicator.style.transform = "translateX(" + link.offsetLeft + "px)";
    indicator.classList.add("is-visible");

}

function initActiveNavLink() {

    const sections = document.querySelectorAll("section[id]");

    if (!sections.length) {
        return;
    }

    const links = document.querySelectorAll("#primaryNav a");

    const setActive = (id) => {

        let activeLink = null;

        links.forEach((link) => {

            const isMatch = link.getAttribute("href") === "#" + id;

            link.classList.toggle("is-active", isMatch);

            if (isMatch) {
                link.setAttribute("aria-current", "true");
                activeLink = link;
            } else {
                link.removeAttribute("aria-current");
            }

        });

        moveNavIndicator(activeLink);

    };

    const observer = new IntersectionObserver((entries) => {

        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length) {
            setActive(visible[0].target.id);
        }

    }, {
        rootMargin: "-40% 0px -50% 0px",
        threshold: [0, 0.2, 0.5]
    });

    sections.forEach((section) => observer.observe(section));

    // Keep the pill lined up when the layout or the fonts change
    let resizeTimer = 0;

    const reposition = () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
            const current = document.querySelector("#primaryNav a.is-active");
            moveNavIndicator(current);
        }, 150);

    };

    window.addEventListener("resize", reposition, { passive: true });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(reposition);
    }

}


// ===============================
// SCROLL REVEAL
// ===============================

// Effects cycle through the cards of a group so a row does not repeat
// the same entrance three times in a row.
const REVEAL_CYCLE = ["left", "scale", "right"];

function initScrollReveal() {

    const groups = [
        { selector: ".section-head", variant: "up", step: false },
        { selector: ".about-grid > *", variant: "cycle", step: true },
        { selector: ".skills-container > *", variant: "scale", step: true },
        { selector: ".projects-container > *", variant: "cycle", step: true },
        { selector: ".contact-box", variant: "scale", step: false }
    ];

    const targets = [];

    groups.forEach((group) => {

        document.querySelectorAll(group.selector).forEach((element, index) => {

            element.classList.add("reveal");

            element.dataset.reveal = group.variant === "cycle"
                ? REVEAL_CYCLE[index % REVEAL_CYCLE.length]
                : group.variant;

            if (group.step) {
                element.dataset.delay = String((index % 8) + 1);
            }

            targets.push(element);

        });

    });

    if (!targets.length) {
        return;
    }

    // Users who prefer reduced motion see content immediately
    if (prefersReducedMotion()) {
        targets.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }

        });

    }, {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12
    });

    targets.forEach((element) => observer.observe(element));

}


// ===============================
// CARD POINTER GLOW + 3D TILT
// ===============================
// One listener per card handles both effects. Tilt is deliberately
// shallow (see MAX_TILT) so cards feel responsive rather than wobbly.
// The card's glow and shadow both lean towards the pointer, so the
// whole surface reads as lit from a single direction.

const MAX_TILT = 5;

function initCardGlow() {

    if (window.matchMedia("(hover: none)").matches) {
        return;
    }

    const canTilt = !prefersReducedMotion();
    const cards = document.querySelectorAll(".glass-card");

    cards.forEach((card) => {

        card.addEventListener("pointermove", (event) => {

            const rect = card.getBoundingClientRect();

            card.style.setProperty("--glow-x", (event.clientX - rect.left) + "px");
            card.style.setProperty("--glow-y", (event.clientY - rect.top) + "px");

            // -0.5 .. 0.5 across the card
            const acrossX = (event.clientX - rect.left) / rect.width - 0.5;
            const acrossY = (event.clientY - rect.top) / rect.height - 0.5;

            // Drives the directional shadow in style.css section 16.4
            card.style.setProperty("--shadow-x", acrossX.toFixed(3));
            card.style.setProperty("--shadow-y", acrossY.toFixed(3));

            if (!canTilt) {
                return;
            }

            card.style.setProperty("--tilt-y", (acrossX * MAX_TILT).toFixed(2) + "deg");
            card.style.setProperty("--tilt-x", (-acrossY * MAX_TILT).toFixed(2) + "deg");

        });

        // Settle back to flat once the pointer leaves
        card.addEventListener("pointerleave", () => {

            card.style.setProperty("--tilt-x", "0deg");
            card.style.setProperty("--tilt-y", "0deg");
            card.style.setProperty("--shadow-x", "0");
            card.style.setProperty("--shadow-y", "0");

        });

    });

}


// ===============================
// POINTER GLOW
// ===============================
// Desktop, fine-pointer devices only. The real cursor is never hidden,
// so clicking and text selection are completely unaffected. The small
// dot tracks exactly; the large soft aura follows with a light lag
// driven by requestAnimationFrame, which stops as soon as the pointer
// leaves the window or the tab is hidden.

function initPointerGlow() {

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!finePointer || prefersReducedMotion()) {
        return;
    }

    const dot = document.getElementById("cursorDot");
    const aura = document.getElementById("cursorAura");

    if (!dot || !aura) {
        return;
    }

    const root = document.documentElement;
    const interactive = "a, button, input, .glass-card";

    let targetX = 0;
    let targetY = 0;
    let auraX = 0;
    let auraY = 0;
    let frame = 0;
    let tracking = false;

    // Clamp to the viewport so neither layer can ever reach the
    // horizontal scrollbar
    const clampX = (value, width) => Math.min(Math.max(value, width / 2), window.innerWidth - width / 2);

    function follow() {

        // Eased chase, which is what makes the aura feel weighty
        auraX += (targetX - auraX) * 0.18;
        auraY += (targetY - auraY) * 0.18;

        aura.style.transform =
            "translate3d(" + clampX(auraX, 320).toFixed(1) + "px," + clampX(auraY, 320).toFixed(1) + "px,0)";

        frame = requestAnimationFrame(follow);

    }

    function start() {

        if (!frame) {
            frame = requestAnimationFrame(follow);
        }

    }

    function stop() {

        if (frame) {
            cancelAnimationFrame(frame);
            frame = 0;
        }

        tracking = false;
        root.classList.remove("cursor-ready");

    }

    document.addEventListener("pointermove", (event) => {

        targetX = event.clientX;
        targetY = event.clientY;

        dot.style.transform =
            "translate3d(" + clampX(targetX, 8).toFixed(1) + "px," + clampX(targetY, 8).toFixed(1) + "px,0)";

        if (!tracking) {
            tracking = true;
            root.classList.add("cursor-ready");
            auraX = targetX;
            auraY = targetY;
        }

        const over = event.target instanceof Element && event.target.closest(interactive);
        dot.classList.toggle("is-hot", Boolean(over));

        // The soft aura leans in as well, so the two layers read as
        // one cursor instead of a dot being followed by a glow
        aura.classList.toggle("is-hot", Boolean(over));

        start();

    }, { passive: true });

    document.addEventListener("pointerleave", stop, { passive: true });

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {
            stop();
        }

    });

}


// ===============================
// KEYBOARD SHORTCUTS
// ===============================

function initKeyboardShortcuts() {

    document.addEventListener("keydown", (event) => {

        // Enter sends, Shift+Enter is ignored so multi-line input is possible
        if (event.target === chat.input && event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
            return;
        }

        // Escape closes the chat window
        if (event.key === "Escape" && chat.window && chat.window.classList.contains("is-open")) {
            closeChat();
            return;
        }

        // Escape closes the mobile menu
        const nav = document.getElementById("primaryNav");

        if (event.key === "Escape" && nav && nav.classList.contains("is-open")) {
            closeMobileNav();
        }

    });

}


// ===============================
// CURRENT YEAR
// ===============================

function initCurrentYear() {

    const element = document.getElementById("currentYear");

    if (element) {
        element.textContent = String(new Date().getFullYear());
    }

}


// ===============================
// HERO PORTRAIT
// ===============================
// Two small jobs: a shallow 3D tilt that follows the pointer across
// the photo, and a safety net that removes the frame entirely if the
// image is ever missing, so a bad file can never break the hero.
// The tilt is desktop-only and off under reduced motion; the rest of
// the frame (float, light border, scan, sheen) is pure CSS.

const PORTRAIT_TILT = 6;

function initHeroPortrait() {

    const portrait = document.querySelector("[data-portrait]");

    if (!portrait) {
        return;
    }

    const img = portrait.querySelector("img");

    // Missing or broken image: drop the whole frame, the rings and the
    // console card stay exactly as they are.
    if (img) {
        img.addEventListener("error", () => {
            portrait.remove();
        });
    }

    const canTilt =
        !prefersReducedMotion() &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!canTilt) {
        return;
    }

    // Listens on the whole visual, not the frame: the console card sits
    // over the lower edge of the photo and would otherwise swallow the
    // events there. The frame is still what gets measured and moved.
    const area = portrait.closest(".hero-visual") || portrait;

    area.addEventListener("pointermove", (event) => {

        const rect = portrait.getBoundingClientRect();

        const acrossX = (event.clientX - rect.left) / rect.width - 0.5;
        const acrossY = (event.clientY - rect.top) / rect.height - 0.5;

        portrait.style.setProperty("--tilt-y", (acrossX * PORTRAIT_TILT).toFixed(2) + "deg");
        portrait.style.setProperty("--tilt-x", (-acrossY * PORTRAIT_TILT).toFixed(2) + "deg");

    });

    area.addEventListener("pointerleave", () => {

        portrait.style.setProperty("--tilt-x", "0deg");
        portrait.style.setProperty("--tilt-y", "0deg");

    });

}


// ===============================
// READING PROGRESS BAR
// ===============================
// A hairline under the header showing how far down the page the
// visitor is. The only thing that changes is --progress, which
// scales a fixed bar, so scrolling never triggers a reflow.

function initScrollProgress() {

    const bar = document.getElementById("scrollProgress");

    if (!bar) {
        return;
    }

    let frame = 0;

    const update = () => {

        frame = 0;

        const scrollable = document.documentElement.scrollHeight - window.innerHeight;

        // A page no taller than the viewport has nothing to report
        if (scrollable <= 0) {
            bar.style.setProperty("--progress", "0");
            return;
        }

        const ratio = Math.min(Math.max(window.scrollY / scrollable, 0), 1);

        bar.style.setProperty("--progress", ratio.toFixed(4));

    };

    // Coalesce bursts of scroll events into a single frame
    const schedule = () => {

        if (!frame) {
            frame = requestAnimationFrame(update);
        }

    };

    update();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

}


// ===============================
// MAGNETIC BUTTONS
// ===============================
// A button leans towards the pointer once it comes within range,
// and grows very slightly while it is engaged. The pull falls off
// to zero at the edge of the range, so the button settles exactly
// where it looks like it is rather than chasing the cursor.
// Values are eased in one frame loop that stops as soon as the
// button has settled, so nothing runs at idle.

const MAGNET_RANGE = 26;
const MAGNET_PULL = 0.28;
const MAGNET_SCALE = 1.03;
const MAGNET_EASE = 0.18;

function initMagneticButtons() {

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!finePointer || prefersReducedMotion()) {
        return;
    }

    document.querySelectorAll(".btn:not(:disabled)").forEach((button) => {

        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let currentScale = 1;
        let engaged = false;
        let frame = 0;

        function follow() {

            const targetScale = engaged ? MAGNET_SCALE : 1;

            currentX += (targetX - currentX) * MAGNET_EASE;
            currentY += (targetY - currentY) * MAGNET_EASE;
            currentScale += (targetScale - currentScale) * MAGNET_EASE;

            button.style.setProperty("--mag-x", currentX.toFixed(2) + "px");
            button.style.setProperty("--mag-y", currentY.toFixed(2) + "px");
            button.style.setProperty("--mag-scale", currentScale.toFixed(3));

            const settled =
                Math.abs(targetX - currentX) < 0.1 &&
                Math.abs(targetY - currentY) < 0.1 &&
                Math.abs(targetScale - currentScale) < 0.002;

            frame = settled ? 0 : requestAnimationFrame(follow);

        }

        function schedule() {

            if (!frame) {
                frame = requestAnimationFrame(follow);
            }

        }

        button.addEventListener("pointermove", (event) => {

            const rect = button.getBoundingClientRect();

            const offsetX = event.clientX - (rect.left + rect.width / 2);
            const offsetY = event.clientY - (rect.top + rect.height / 2);

            // How far outside the button the pointer is, per axis
            const gapX = Math.abs(offsetX) - rect.width / 2;
            const gapY = Math.abs(offsetY) - rect.height / 2;

            const distance = Math.hypot(Math.max(gapX, 0), Math.max(gapY, 0));

            engaged = distance < MAGNET_RANGE;

            if (!engaged) {
                targetX = 0;
                targetY = 0;
                return;
            }

            // Strongest on the button itself, fading to nothing at
            // the outer edge of the range
            const falloff = 1 - Math.min(distance / MAGNET_RANGE, 1);

            targetX = offsetX * MAGNET_PULL * falloff;
            targetY = offsetY * MAGNET_PULL * falloff;

            schedule();

        });

        button.addEventListener("pointerleave", () => {

            engaged = false;
            targetX = 0;
            targetY = 0;

            schedule();

        });

    });

}


// ===============================
// SPLIT-TEXT HEADING REVEAL
// ===============================
// Each section title is broken into per-word masks so the words
// can rise into view one after another. The plain sentence is
// kept as aria-label and the generated spans are hidden from
// assistive tech, so the heading is still announced as one line.
// Nothing is split when motion is reduced, and the split only
// ever touches the DOM, so the page is complete without JS.

function initSplitText() {

    if (prefersReducedMotion()) {
        return;
    }

    const headings = Array.from(document.querySelectorAll(".section-title"));
    const targets = [];

    headings.forEach((heading) => {

        const text = heading.textContent.trim();

        if (!text) {
            return;
        }

        const words = text.split(/\s+/);

        heading.setAttribute("aria-label", text);
        heading.textContent = "";

        words.forEach((word, index) => {

            const mask = document.createElement("span");

            mask.className = "word-mask";
            mask.setAttribute("aria-hidden", "true");

            const inner = document.createElement("span");

            inner.className = "word-in";
            inner.style.setProperty("--i", String(index));
            inner.textContent = word;

            mask.appendChild(inner);
            heading.appendChild(mask);

            if (index < words.length - 1) {
                heading.appendChild(document.createTextNode(" "));
            }

        });

        targets.push(heading);

    });

    if (!targets.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }

        });

    }, {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.2
    });

    targets.forEach((heading) => observer.observe(heading));

}


// ===============================
// SECTION TRANSITION SWEEP
// ===============================
// A single hairline of light crosses the top of the page whenever
// an in-page section link is followed. It is purely decorative:
// the click is never intercepted, so native smooth scrolling
// still performs the navigation, and the overlay holds no
// pointer events while it plays.

function initSectionTransitions() {

    const veil = document.getElementById("pageVeil");

    if (!veil) {
        return;
    }

    const links = document.querySelectorAll(
        "#primaryNav a[href^='#'], .hero-scroll[href^='#'], .btn[href^='#']"
    );

    if (!links.length) {
        return;
    }

    const reduceMotion = prefersReducedMotion();

    let timer = 0;

    const sweep = () => {

        if (reduceMotion) {
            return;
        }

        // Restart the one-shot animation even on back-to-back clicks
        veil.classList.remove("is-flash");
        void veil.offsetWidth;
        veil.classList.add("is-flash");

        clearTimeout(timer);
        timer = setTimeout(() => {
            veil.classList.remove("is-flash");
        }, 800);

    };

    links.forEach((link) => link.addEventListener("click", sweep));

}


// ===============================
// INIT
// ===============================

function init() {

    // Cache chatbot elements
    chat.window = document.getElementById("chatWindow");
    chat.messages = document.getElementById("chatMessages");
    chat.input = document.getElementById("userInput");
    chat.launcher = document.getElementById("chatButton");
    chat.sendButton = document.querySelector(".chat-send");

    // Mobile navigation
    const navToggle = document.getElementById("navToggle");

    if (navToggle) {
        navToggle.addEventListener("click", toggleMobileNav);
    }

    // Close the mobile menu after choosing a link
    document.querySelectorAll("#primaryNav a").forEach((link) => {
        link.addEventListener("click", closeMobileNav);
    });

    // Close the mobile menu when resizing up to desktop
    window.addEventListener("resize", () => {

        if (window.innerWidth > 860) {
            closeMobileNav();
        }

    });

    initHeaderScroll();
    initActiveNavLink();
    initScrollReveal();
    initSplitText();
    initCardGlow();
    initHeroPortrait();
    initPointerGlow();
    initMagneticButtons();
    initScrollProgress();
    initSectionTransitions();
    initKeyboardShortcuts();
    initCurrentYear();

    // Always last, and never skipped: an error above must not leave the
    // page stuck behind the preloader.
    initPreloader();

}

document.addEventListener("DOMContentLoaded", init);
