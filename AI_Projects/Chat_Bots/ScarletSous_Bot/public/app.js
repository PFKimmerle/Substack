const form = document.getElementById("qform");
const input = document.getElementById("q");
const out = document.getElementById("out");
const send = document.getElementById("send");

function createSkeletonCards() {
  const container = document.createElement("div");
  container.className = "skeleton-cards";

  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";

    const image = document.createElement("div");
    image.className = "skeleton-image";

    const body = document.createElement("div");
    body.className = "skeleton-body";

    const title = document.createElement("div");
    title.className = "skeleton-title";

    const meta = document.createElement("div");
    meta.className = "skeleton-meta";

    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(image);
    card.appendChild(body);
    container.appendChild(card);
  }

  return container;
}

function renderRecipeCards(recipes, greeting) {
  const container = document.createElement("div");
  container.className = "recipe-response";

  if (greeting) {
    const greetingEl = document.createElement("p");
    greetingEl.className = "recipe-greeting";
    greetingEl.textContent = greeting;
    container.appendChild(greetingEl);
  }

  const cardsContainer = document.createElement("div");
  cardsContainer.className = "cards";

  for (const recipe of recipes) {
    const card = document.createElement("a");
    card.className = "card";
    card.href = recipe.sourceUrl;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    if (recipe.image) {
      const img = document.createElement("img");
      img.src = recipe.image;
      img.alt = recipe.title;
      img.loading = "lazy";
      card.appendChild(img);
    }

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("span");
    title.className = "card-title";
    title.textContent = recipe.title;
    body.appendChild(title);

    const metaParts = [];
    if (recipe.cookTime) metaParts.push(`${recipe.cookTime} min`);
    if (recipe.servings) metaParts.push(`${recipe.servings} servings`);

    if (metaParts.length > 0) {
      const meta = document.createElement("p");
      meta.className = "meta";
      meta.textContent = metaParts.join(" · ");
      body.appendChild(meta);
    }

    card.appendChild(body);
    cardsContainer.appendChild(card);
  }

  container.appendChild(cardsContainer);
  return container;
}

function addMsg(content, who = "bot", isLoading = false) {
  const msgWrapper = document.createElement("div");
  msgWrapper.className = `msg ${who === "me" ? "me" : "bot"}`;

  if (isLoading) {
    msgWrapper.appendChild(createSkeletonCards());
  } else if (who === "bot") {
    if (content.recipes) {
      msgWrapper.appendChild(renderRecipeCards(content.recipes, content.greeting));
    } else {
      msgWrapper.textContent = content.error || "No recipes found.";
    }
  } else {
    msgWrapper.textContent = content;
  }

  out.appendChild(msgWrapper);
  requestAnimationFrame(() => {
    out.scrollTo({ top: out.scrollHeight, behavior: "smooth" });
  });

  return msgWrapper;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addMsg(text, "me");
  input.value = "";
  send.disabled = true;

  const loadingMsg = addMsg("", "bot", true);

  try {
    const response = await fetch("/api/rolebot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    loadingMsg.remove();

    const data = await response.json();
    addMsg(data, "bot");

  } catch (error) {
    loadingMsg.remove();
    addMsg({ error: "Connection error. Please try again." }, "bot");
  } finally {
    send.disabled = false;
    input.focus();
  }
});

document.addEventListener("DOMContentLoaded", () => input.focus());
