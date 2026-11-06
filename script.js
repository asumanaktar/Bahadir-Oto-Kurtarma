const PHONE_NUMBER = "905078338331";

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const menuLinks = document.querySelectorAll(".main-nav a");

// 1. Telefon ve WhatsApp bağlantıları 

const validPhone = /^90\d{10}$/.test(PHONE_NUMBER);

if (validPhone) {
    document.querySelectorAll("[data-contact='phone']").forEach(link => {
        link.href = `tel:+${PHONE_NUMBER}`;
    });

    document.querySelectorAll("[data-contact='whatsapp']").forEach(link => {
        link.href = `https://wa.me/${PHONE_NUMBER}`;
    });
}

// 2. Mobil menü 

function closeMenu() {
    if (!menuToggle || !mainNav) return;

    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Menüyü aç");
    menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
}

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

        if (isOpen) {
            closeMenu();
        } else {
            mainNav.classList.add("is-open");
            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.setAttribute("aria-label", "Menüyü kapat");
            menuToggle.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
        }
    });

    menuLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
            menuToggle.focus();
        }
    });

    document.addEventListener("click", event => {
        if (
            header &&
            !header.contains(event.target) &&
            menuToggle.getAttribute("aria-expanded") === "true"
        ) {
            closeMenu();
        }
    });
}

// 3. Kaydırma sırasında aktif menü bağlantısı 

const sections = [
    ...document.querySelectorAll(
        "#anasayfa, #hizmetler, #bolgemiz, #iletisim"
    )
];

if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
        const visibleSections = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleSections.length) return;

        const currentId = visibleSections[0].target.id;

        menuLinks.forEach(link => {
            const isActive = link.getAttribute("href") === `#${currentId}`;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }, {
        rootMargin: "-15% 0px -60% 0px",
        threshold: [0, 0.25, 0.5]
    });

    sections.forEach(section => sectionObserver.observe(section));
}

// GALERİ - LIGHTBOX VE MOBİL KONTROL 

document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector(".services-gallery-grid");

    if (!gallery) return;

    const items = [...gallery.querySelectorAll(".services-gallery-item")];

    if (!items.length) return;

    let currentIndex = 0;

    // Mobil galeri kontrol butonları 

    const controls = document.createElement("div");
    controls.className = "gallery-controls";

    controls.innerHTML = `
        <button class="gallery-prev" aria-label="Önceki fotoğraf">
            <i class="fa-solid fa-chevron-left"></i>
        </button>

        <span class="gallery-counter">1 / ${items.length}</span>

        <button class="gallery-next" aria-label="Sonraki fotoğraf">
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    gallery.parentNode.insertBefore(controls, gallery);

    const prevButton = controls.querySelector(".gallery-prev");
    const nextButton = controls.querySelector(".gallery-next");
    const counter = controls.querySelector(".gallery-counter");

    function updateGallery(index) {
        currentIndex = Math.max(0, Math.min(index, items.length - 1));

        items[currentIndex].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center"
        });

        counter.textContent = `${currentIndex + 1} / ${items.length}`;
    }

let galleryScrollTimeout;

gallery.addEventListener("scroll", () => {
    clearTimeout(galleryScrollTimeout);

    galleryScrollTimeout = setTimeout(() => {
        const galleryCenter =
            gallery.getBoundingClientRect().left +
            gallery.clientWidth / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        items.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.left + rect.width / 2;

            const distance = Math.abs(galleryCenter - itemCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        currentIndex = closestIndex;

        counter.textContent =
            `${currentIndex + 1} / ${items.length}`;

    }, 100);

}, { passive: true });

    prevButton.addEventListener("click", () => {
        updateGallery(currentIndex - 1);
    });

    nextButton.addEventListener("click", () => {
        updateGallery(currentIndex + 1);
    });

    // Lightbox oluşturma 

    const lightbox = document.createElement("div");
    lightbox.className = "gallery-lightbox";

    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Galeriyi kapat">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <button class="lightbox-prev" aria-label="Önceki fotoğraf">
            <i class="fa-solid fa-chevron-left"></i>
        </button>

        <div class="lightbox-content">
            <img src="" alt="">
            <p class="lightbox-caption"></p>
            <span class="lightbox-counter"></span>
        </div>

        <button class="lightbox-next" aria-label="Sonraki fotoğraf">
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector("img");
    const lightboxCaption = lightbox.querySelector(".lightbox-caption");
    const lightboxCounter = lightbox.querySelector(".lightbox-counter");

    const closeButton = lightbox.querySelector(".lightbox-close");
    const lightboxPrev = lightbox.querySelector(".lightbox-prev");
    const lightboxNext = lightbox.querySelector(".lightbox-next");

    function showImage(index) {
        currentIndex = (index + items.length) % items.length;

        const image = items[currentIndex].querySelector("img");
        const caption = items[currentIndex].querySelector("figcaption");

        if (!image) return;

        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt || "Galeri fotoğrafı";

        lightboxCaption.textContent = caption
            ? caption.textContent
            : image.alt;

        lightboxCounter.textContent =
            `${currentIndex + 1} / ${items.length}`;

        counter.textContent =
            `${currentIndex + 1} / ${items.length}`;
    }

    function openLightbox(index) {
        showImage(index);

        lightbox.classList.add("is-open");
        document.body.classList.add("lightbox-active");

        closeButton.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove("is-open");
        document.body.classList.remove("lightbox-active");
    }

    items.forEach((item, index) => {
        const image = item.querySelector("img");

        if (!image) return;

        image.style.cursor = "zoom-in";

        image.addEventListener("click", () => {
            openLightbox(index);
        });
    });

    closeButton.addEventListener("click", closeLightbox);

    lightboxPrev.addEventListener("click", () => {
        showImage(currentIndex - 1);
    });

    lightboxNext.addEventListener("click", () => {
        showImage(currentIndex + 1);
    });

    lightbox.addEventListener("click", event => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // Klavye kontrolleri 

    document.addEventListener("keydown", event => {
        if (!lightbox.classList.contains("is-open")) return;

        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowRight") showImage(currentIndex + 1);
        if (event.key === "ArrowLeft") showImage(currentIndex - 1);
    });

    // Mobil dokunmatik geçiş 

    let touchStartX = 0;

    lightbox.addEventListener("touchstart", event => {
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener("touchend", event => {
        const touchEndX = event.changedTouches[0].screenX;
        const difference = touchStartX - touchEndX;

        if (Math.abs(difference) < 50) return;

        if (difference > 0) {
            showImage(currentIndex + 1);
        } else {
            showImage(currentIndex - 1);
        }
    }, { passive: true });

});

// 4. WhatsApp iletişim formu 

const contactForm = document.getElementById("whatsapp-contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("contact-name").value.trim();
        const phone = document.getElementById("contact-phone").value.trim();
        const service = document.getElementById("contact-service").value;
        const location = document.getElementById("contact-location").value.trim();
        const vehicle = document.getElementById("contact-vehicle").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        const whatsappMessage =
            "BAHADIR OTO KURTARMA - İLETİŞİM FORMU\n\n" +
            "Ad Soyad: " + name + "\n" +
            "Telefon: " + phone + "\n" +
            "Hizmet Türü: " + service + "\n" +
            "Konum: " + location + "\n" +
            "Araç Bilgisi: " + (vehicle || "Belirtilmedi") + "\n" +
            "Mesaj: " + (message || "Belirtilmedi");

        const whatsappUrl =
            "https://wa.me/" + PHONE_NUMBER + "?text=" +
            encodeURIComponent(whatsappMessage);

        window.location.href = whatsappUrl;
    });
}

