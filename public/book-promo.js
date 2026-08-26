(function () {
  var promos = Array.prototype.slice.call(
    document.querySelectorAll("[data-rb-book-promo]")
  );
  var modals = Array.prototype.slice.call(
    document.querySelectorAll("[data-rb-book-modal]")
  );

  if (!promos.length || !modals.length) {
    return;
  }

  var siteId = promos[0].getAttribute("data-rb-book-site") || "site";
  var activeLang = "";
  var promoDismissKey = "rb-book-promo-dismissed:" + siteId;

  function addPromoCloseButtons() {
    promos.forEach(function (promo) {
      if (promo.querySelector("[data-rb-book-promo-close]")) {
        return;
      }

      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-rb-book-promo-close", "");
      button.setAttribute(
        "aria-label",
        normalizeLang(promo.getAttribute("data-rb-book-lang")) === "en"
          ? "Close promotion"
          : "Chiudi promozione"
      );
      button.textContent = "×";
      promo.insertBefore(button, promo.firstChild);
    });
  }

  function isPromoDismissed() {
    try {
      return window.localStorage.getItem(promoDismissKey) === "1";
    } catch (error) {
      return false;
    }
  }

  function dismissPromos() {
    promos.forEach(function (promo) {
      promo.setAttribute("hidden", "");
    });
    try {
      window.localStorage.setItem(promoDismissKey, "1");
    } catch (error) {
      return;
    }
  }

  function normalizeLang(value) {
    if (!value) {
      return "";
    }

    var lang = String(value).toLowerCase();
    if (lang.indexOf("en") === 0 || lang === "english") {
      return "en";
    }
    if (lang.indexOf("it") === 0 || lang === "italiano" || lang === "italian") {
      return "it";
    }
    return "";
  }

  function getStoredLang(key) {
    try {
      return normalizeLang(window.localStorage.getItem(key));
    } catch (error) {
      return "";
    }
  }

  function getQueryLang() {
    try {
      return normalizeLang(new URLSearchParams(window.location.search).get("lang"));
    } catch (error) {
      return "";
    }
  }

  function getControlLang() {
    var activeControl = document.querySelector(
      "[data-lang].active, [data-lang][aria-selected='true'], [data-lang][aria-pressed='true']"
    );
    return activeControl ? normalizeLang(activeControl.getAttribute("data-lang")) : "";
  }

  function getPathLang() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("/en/") !== -1 || path.slice(-3) === "/en") {
      return "en";
    }
    if (path.indexOf("/it/") !== -1 || path.slice(-3) === "/it") {
      return "it";
    }
    return "";
  }

  function getActiveLang() {
    return (
      getQueryLang() ||
      getControlLang() ||
      getStoredLang("prompting101-lang") ||
      getStoredLang("lang") ||
      getStoredLang("i18nextLng") ||
      getStoredLang("language") ||
      normalizeLang(document.documentElement.lang) ||
      getPathLang() ||
      normalizeLang(navigator.language) ||
      "it"
    );
  }

  function getStorageKey(lang) {
    return "rb-book-promo-seen:" + siteId + ":" + lang;
  }

  function getModal(lang) {
    return (
      modals.filter(function (candidate) {
        return normalizeLang(candidate.getAttribute("data-rb-book-lang")) === lang;
      })[0] || modals[0]
    );
  }

  function hasSeenModal(lang) {
    try {
      return window.localStorage.getItem(getStorageKey(lang)) === "1";
    } catch (error) {
      return false;
    }
  }

  function markModalSeen(lang) {
    try {
      window.localStorage.setItem(getStorageKey(lang), "1");
    } catch (error) {
      return;
    }
  }

  function syncPromos(lang) {
    var nextLang = lang || getActiveLang();
    activeLang = nextLang;

    if (isPromoDismissed()) {
      promos.forEach(function (promo) {
        promo.setAttribute("hidden", "");
      });
      return;
    }

    promos.forEach(function (promo) {
      var promoLang = normalizeLang(promo.getAttribute("data-rb-book-lang")) || "it";
      if (promoLang === nextLang) {
        promo.removeAttribute("hidden");
      } else {
        promo.setAttribute("hidden", "");
      }
    });
  }

  function closeModals() {
    modals.forEach(function (modal) {
      modal.setAttribute("hidden", "");
    });
    document.documentElement.classList.remove("rb-book-modal-open");
  }

  function openModal(lang) {
    var nextLang = lang || getActiveLang();
    var modal = getModal(nextLang);

    closeModals();
    modal.removeAttribute("hidden");
    document.documentElement.classList.add("rb-book-modal-open");
    markModalSeen(nextLang);

    var closeButton = modal.querySelector("[data-rb-book-modal-close]");
    if (closeButton) {
      closeButton.focus({ preventScroll: true });
    }
  }

  modals.forEach(function (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target.closest("[data-rb-book-modal-close]")) {
        closeModals();
      }
    });
  });

  addPromoCloseButtons();

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-rb-book-promo-close]")) {
      event.preventDefault();
      event.stopPropagation();
      dismissPromos();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeModals();
    }
  });

  document.addEventListener("click", function (event) {
    var control = event.target.closest("[data-lang]");
    if (!control) {
      return;
    }

    window.setTimeout(function () {
      syncPromos(normalizeLang(control.getAttribute("data-lang")) || getActiveLang());
    }, 0);
  });

  if (window.MutationObserver) {
    new MutationObserver(function () {
      var nextLang = getActiveLang();
      if (nextLang !== activeLang) {
        syncPromos(nextLang);
      }
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
  }

  syncPromos(getActiveLang());

  if (!hasSeenModal(activeLang)) {
    window.setTimeout(function () {
      openModal(activeLang);
    }, 450);
  }
})();
