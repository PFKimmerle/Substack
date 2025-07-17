console.log("Script loaded");

let allCountries = [];
let sortDescending = true;

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const regionSelect = document.getElementById("region");
    const sortSelect = document.getElementById("sort");
    const toggleOrderBtn = document.getElementById("toggleOrder");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const icon = document.querySelector(".toggle-icon");

    // event listeners
    searchInput.addEventListener("input", handleFilter);
    regionSelect.addEventListener("change", handleFilter);
    sortSelect.addEventListener("change", handleFilter);

    toggleOrderBtn.addEventListener("click", () => {
    sortDescending = !sortDescending;
    toggleOrderBtn.textContent = sortDescending ? "▼ Descending" : "▲ Ascending";
    handleFilter();
  });


  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
  icon.textContent = isDark ? "⏾" : "☀";
});


    loadCountries();
});

async function loadCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,population,area,flags,languages');
        const data = await response.json();
        allCountries = data;
        console.log("Fetch countries", allCountries.length);
        document.getElementById("loading").style.display = "none";
        renderCountries(allCountries);
    } catch (error) {
        document.getElementById("loading").textContent = "Error loading countries";
    }
}



function handleFilter() {
    const search = document.getElementById("search").value.toLowerCase();
    const region = document.getElementById("region").value;
    const sortKey = document.getElementById("sort").value;

    let filtered = allCountries.filter(c => {
        const matchesName = c.name.common.toLowerCase().includes(search);
        const matchesRegion = !region || c.region === region;
        return matchesName && matchesRegion;
    });


    filtered.sort((a, b) => {
        if (sortKey === "population" || sortKey === "area") {
        return sortDescending
            ? (b[sortKey] || 0) - (a[sortKey] || 0)
            : (a[sortKey] || 0) - (b[sortKey] || 0);
        } else {
        return sortDescending
            ? b.name.common.localeCompare(a.name.common)
            : a.name.common.localeCompare(b.name.common);
        }
    });

    renderCountries(filtered);
    updateStats(filtered);
}

function renderCountries(countries) {
    const container = document.getElementById("countries");
    container.innerHTML = countries.map((c, i) => `
        <div class="country" data-index="${i}">
            <img src="${c.flags.svg}" alt="${c.name.common}" class="country__flag">
            <h3>${c.name.common}</h3>
            <p><strong>Capital:</strong> ${c.capital?.[0] || "N/A"}</p>
        </div>
    `).join("");

    document.querySelectorAll(".country").forEach(card => {
        card.addEventListener("click", () => {
            const country = countries[card.dataset.index];
            showModal(country);
        });
    });
}


function updateStats(countries) {
    const total = countries.length;
    const population = countries.reduce((sum, c) => sum + (c.population || 0), 0);
    const languages = new Set();
    countries.forEach(c => {
        if (c.languages) {
        Object.values(c.languages).forEach(lang => languages.add(lang));
        }
    });

    document.getElementById("total").textContent = total;
    document.getElementById("population").textContent = population.toLocaleString();
    document.getElementById("languages").textContent = languages.size;
}

function showModal(country) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
        <div class="modal">
            <button class="modal-close">✖</button>
            <img src="${country.flags.svg}" alt="${country.name.common}" class="modal-flag">
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Area:</strong> ${country.area?.toLocaleString() || "N/A"} km²</p>
            <p><strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(", ") : "N/A"}</p>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".modal-close").addEventListener("click", () => {
        modal.remove();
    });
}
