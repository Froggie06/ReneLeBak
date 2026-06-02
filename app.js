const tracks = {
      stolid: {
        title: "Solid Stigma",
        artist: "Angerfist",
        punishment: "Er gebeurt niks",
        message: "De sigma spaart je... deze keer.",
        cover: "assets/solid-stigma.jpg",
        audio: "assets/solid-stigma.mp3"
      },
      ifITellYou: {
        title: "If I Tell You",
        artist: "René le Blanc",
        punishment: "3 slokken",
        message: "René heeft gesproken. 3 slokken, geen discussie.",
        cover: "assets/if-i-tell-you.jpg",
        audio: "assets/if-i-tell-you.mp3"
      },
      hardcore: {
        title: "Hardcore versie",
        artist: "René le Blanc, LARSTIG & GASDROP",
        punishment: "1 bak / 1 atje",
        message: "Kleine kans, 100% ellende. Atje voor de sfeer.",
        cover: "assets/hardcore-remix.jpg",
        audio: "assets/hardcore-remix.mp3"
      }
    };

    const BASE_ODDS = { stolid: 75, ifITellYou: 20, hardcore: 5 };
    const EXTREME_ODDS = { stolid: 75, ifITellYou: 40, hardcore: 10 };
    const CHANCE_VARIATION = 5;
    const STORAGE_KEY = "reneLeBakStats";
    const defaultStats = { stolid: 0, ifITellYou: 0, hardcore: 0, total: 0 };
    let selectedMode = "classic";
    let stats = loadStats();

    const startButton = document.getElementById("startButton");
    const playAgainButton = document.getElementById("playAgainButton");
    const resetStatsButton = document.getElementById("resetStatsButton");
    const resultSection = document.getElementById("resultSection");
    const resultCard = document.getElementById("resultCard");
    const resultTitle = document.getElementById("resultTitle");
    const resultPunishment = document.getElementById("resultPunishment");
    const resultMessage = document.getElementById("resultMessage");
    const musicButton = document.getElementById("musicButton");
    const trackCover = document.getElementById("trackCover");
    const coverImage = document.getElementById("coverImage");
    const coverText = document.getElementById("coverText");
    const trackTitle = document.getElementById("trackTitle");
    const trackArtist = document.getElementById("trackArtist");
    const trackPunishment = document.getElementById("trackPunishment");
    const trackAudio = document.getElementById("trackAudio");
    const modeButtons = document.querySelectorAll("[data-mode]");
    const customPanel = document.getElementById("customPanel");
    const modeStatus = document.getElementById("modeStatus");
    const customInputs = {
      stolid: document.getElementById("customStolid"),
      ifITellYou: document.getElementById("customIfITellYou"),
      hardcore: document.getElementById("customHardcore")
    };

    startButton.addEventListener("click", playRound);
    playAgainButton.addEventListener("click", playRound);
    musicButton.addEventListener("click", () => {
      playCurrentTrack();
    });
    modeButtons.forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.mode));
    });
    Object.values(customInputs).forEach((input) => {
      input.addEventListener("input", updateModeStatus);
    });
    resetStatsButton.addEventListener("click", () => {
      stats = { ...defaultStats };
      saveStats();
      renderStats();
    });

    renderStats();
    setMode("classic");

    function chooseResult() {
      const odds = getModeOdds();
      const total = odds.stolid + odds.ifITellYou + odds.hardcore;
      const random = Math.random() * total;

      if (random < odds.stolid) {
        return "stolid";
      } else if (random < odds.stolid + odds.ifITellYou) {
        return "ifITellYou";
      } else {
        return "hardcore";
      }
    }

    function getModeOdds() {
      if (selectedMode === "custom") {
        return getCustomOdds();
      }

      if (selectedMode === "extreme") {
        return getVariedOdds(EXTREME_ODDS);
      }

      return getVariedOdds(BASE_ODDS);
    }

    function getVariedOdds(baseOdds) {
      return {
        stolid: randomWeight(baseOdds.stolid),
        ifITellYou: randomWeight(baseOdds.ifITellYou),
        hardcore: randomWeight(baseOdds.hardcore)
      };
    }

    function randomWeight(base) {
      const offset = (Math.random() * CHANCE_VARIATION * 2) - CHANCE_VARIATION;
      return Math.max(1, base + offset);
    }

    function getCustomOdds() {
      const odds = {
        stolid: readCustomValue(customInputs.stolid),
        ifITellYou: readCustomValue(customInputs.ifITellYou),
        hardcore: readCustomValue(customInputs.hardcore)
      };

      if (odds.stolid + odds.ifITellYou + odds.hardcore <= 0) {
        return { ...BASE_ODDS };
      }

      return odds;
    }

    function readCustomValue(input) {
      const value = Number(input.value);
      return Number.isFinite(value) ? Math.max(0, value) : 0;
    }

    function setMode(mode) {
      selectedMode = mode;
      modeButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.mode === mode);
      });
      customPanel.classList.toggle("is-visible", mode === "custom");
      updateModeStatus();
    }

    function updateModeStatus() {
      if (selectedMode === "custom") {
        const odds = getCustomOdds();
        const total = odds.stolid + odds.ifITellYou + odds.hardcore;
        modeStatus.textContent = `Actieve modus: Custom · Solid ${odds.stolid} · If I Tell You ${odds.ifITellYou} · Hardcore ${odds.hardcore} · totaal ${total}`;
      } else if (selectedMode === "extreme") {
        modeStatus.textContent = "Actieve modus: Extreme · If I Tell You en Hardcore tellen dubbel mee";
      } else {
        modeStatus.textContent = "Actieve modus: Classic";
      }
    }

    function playRound() {
      const result = chooseResult();
      const track = tracks[result];

      stats[result] += 1;
      stats.total += 1;
      saveStats();
      renderStats();
      renderResult(result, track);
    }

    function renderResult(result, track) {
      resultSection.classList.add("is-visible");
      resultCard.className = `result-card theme-${result}`;
      resultCard.classList.remove("shake", "is-reloading");
      void resultCard.offsetWidth;
      resultCard.classList.add(result === "hardcore" ? "shake" : "is-reloading");

      resultTitle.textContent = track.title;
      resultPunishment.textContent = track.punishment;
      resultMessage.textContent = track.message;
      coverText.textContent = track.title;
      coverImage.src = track.cover;
      coverImage.alt = `Cover van ${track.title}`;
      trackTitle.textContent = track.title;
      trackArtist.textContent = track.artist;
      trackPunishment.textContent = track.punishment;
      trackCover.className = `cover theme-${result}`;

      renderAudio(track);
      startButton.textContent = "🎲 Spel gestart";
      startButton.classList.remove("primary-action");

      window.setTimeout(() => {
        resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }

    function renderAudio(track) {
      trackAudio.pause();
      trackAudio.src = track.audio;
      trackAudio.autoplay = true;
      musicButton.textContent = "🎶 Play muziek";
      playCurrentTrack();
    }

    function playCurrentTrack() {
      if (trackAudio.readyState > 0) {
        trackAudio.currentTime = 0;
      }

      const playAttempt = trackAudio.play();

      if (playAttempt) {
        playAttempt.catch(() => {
          musicButton.textContent = "🎶 Tik om muziek te starten";
        });
      }
    }

    function renderStats() {
      document.getElementById("statStolid").textContent = `${stats.stolid}x`;
      document.getElementById("statIfITellYou").textContent = `${stats.ifITellYou}x`;
      document.getElementById("statHardcore").textContent = `${stats.hardcore}x`;
      document.getElementById("statTotal").textContent = `${stats.total}x`;
    }

    function loadStats() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return { ...defaultStats, ...saved };
      } catch {
        return { ...defaultStats };
      }
    }

    function saveStats() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }

    window.reneLeBakTest = { chooseResult, tracks };


