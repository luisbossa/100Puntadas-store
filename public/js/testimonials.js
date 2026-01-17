const testimonials = [
  { user: "@pilarr", image: "/images/chats/chat-1.jpeg" },
  { user: "@monicacubillo", image: "/images/chats/chat-2.jpeg" },
  { user: "@jeasminee_", image: "/images/chats/chat-3.jpeg" },
  { user: "@katebase", image: "/images/chats/chat-4.jpeg" },
  { user: "@danny_", image: "/images/chats/chat-5.jpeg" },
  { user: "@its_maykelli", image: "/images/chats/chat-6.jpeg" },
  { user: "@sofit", image: "/images/chats/chat-7.jpeg" },
  { user: "@tiaryd", image: "/images/chats/chat-8.jpeg" },
  { user: "@carocas", image: "/images/chats/chat-9.jpeg" },
  { user: "@paulaG", image: "/images/chats/chat-10.jpeg" },
  { user: "@luCastro", image: "/images/chats/chat-11.jpeg" },
  { user: "@vaneSalas", image: "/images/chats/chat-12.jpeg" },
  { user: "@pastorcatalina", image: "/images/chats/chat-13.jpeg" },
  { user: "@kamyco", image: "/images/chats/chat-14.jpeg" },
  { user: "@marimarr", image: "/images/chats/chat-15.jpeg" },
  { user: "@clauve", image: "/images/chats/chat-16.jpeg" },
  { user: "@lizroch", image: "/images/chats/chat-17.jpeg" },
];

const marqueeList = document.getElementById("marqueeList");

/* duplicamos para efecto infinito */
[...testimonials, ...testimonials].forEach(({ user, image }) => {
  const item = document.createElement("div");
  item.className = "marquee-item";
  item.setAttribute("role", "listitem");

  item.innerHTML = `
    <article class="testimonial-card">
      <header class="testimonial-header">
        <span class="testimonial-user">${user}</span>
        <div class="testimonial-stars">
          <img src="/images/stars.svg" alt="5 estrellas">
        </div>
      </header>

      <figure class="testimonial-media">
        <img class="testimonial-image" src="${image}" alt="${user}">
      </figure>
    </article>
  `;

  marqueeList.appendChild(item);
});
