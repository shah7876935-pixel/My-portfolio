// ===============================================================
// AHMAD SHAH — PORTFOLIO
// Client-side behaviour
// ---------------------------------------------------------------
// Global functions used by index.html inline handlers:
//   showMessage(), openChat(), closeChat(), sendMessage()
// All other behaviour is initialised from init() on DOM ready.
// ===============================================================


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

function initActiveNavLink() {

    const sections = document.querySelectorAll("section[id]");

    if (!sections.length) {
        return;
    }

    const links = document.querySelectorAll("#primaryNav a");

    const setActive = (id) => {
        links.forEach((link) => {
            const isMatch = link.getAttribute("href") === "#" + id;
            link.classList.toggle("is-active", isMatch);

            if (isMatch) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
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

}


// ===============================
// SCROLL REVEAL
// ===============================

function initScrollReveal() {

    const groups = [
        { selector: ".about-grid > *", step: true },
        { selector: ".skills-container > *", step: true },
        { selector: ".projects-container > *", step: true },
        { selector: ".contact-box", step: false },
        { selector: ".section-head", step: false }
    ];

    const targets = [];

    groups.forEach((group) => {

        document.querySelectorAll(group.selector).forEach((element, index) => {
            element.classList.add("reveal");

            if (group.step) {
                element.dataset.delay = String((index % 6) + 1);
            }

            targets.push(element);
        });

    });

    if (!targets.length) {
        return;
    }

    // Users who prefer reduced motion see content immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
// CARD POINTER GLOW
// ===============================

function initCardGlow() {

    if (window.matchMedia("(hover: none)").matches) {
        return;
    }

    document.querySelectorAll(".glass-card").forEach((card) => {

        card.addEventListener("pointermove", (event) => {

            const rect = card.getBoundingClientRect();

            card.style.setProperty("--glow-x", (event.clientX - rect.left) + "px");
            card.style.setProperty("--glow-y", (event.clientY - rect.top) + "px");

        });

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
    initCardGlow();
    initKeyboardShortcuts();
    initCurrentYear();

}

document.addEventListener("DOMContentLoaded", init);
