import type { Site } from "./tr";

export const site: Site = {
  meta: {
    signup: "Registrieren",
    login: "Anmelden",
    lobby: "Lobby",
    kvkk: "Datenschutzerklärung",
    coinPreview: "Münzwurf-Vorschau",
    tagline: "Kämpf mit deinen Songs. Abwechselnd spielen — wer das Format verfehlt, verliert Punkte.",
  },

  footer: {
    privacy: "Datenschutzerklärung",
  },

  notFound: {
    title: "Diese Seite ist von der Bühne.",
    body: "Der Raum, das Profil oder die Seite, die du suchst, gibt es hier nicht.",
    home: "Zurück zur Startseite",
  },

  landing: {
    heroEyebrow: "Musikduell · Eins gegen eins",
    heroTitleTop: "Triff mit deinem Song.",
    heroTitleBottom: "Wer das Format verfehlt, brennt.",
    heroBody:
      "Music Fight ist ein Spiel, in dem sich zwei Leute abwechselnd Songs von YouTube zuwerfen. Hat dein Gegner Dream Theater gespielt, musst du aus derselben Welt antworten. Kommst du mit etwas völlig anderem, verzeiht der Schiedsrichter das nicht.",
    toLobby: "Zur Lobby →",
    signupNow: "Jetzt registrieren",
    login: "Anmelden",
    chips: (percent: number) => [
      `🎧 ${percent}%-Hörregel`,
      "🟨🟥 Gelbe und Rote Karten",
      "⚖️ KI-Schiedsrichter",
      "💬 Live-Chat",
      "👀 Zuschauermodus",
      "🏆 Tages-, Wochen- und Monatsbeste",
    ],

    whatEyebrow: "Was ist Music Fight?",
    whatTitle: "Hier wird dein Musikgeschmack wirklich auf die Probe gestellt.",
    pillars: [
      {
        icon: "🎵",
        title: "Abwechselnd spielen",
        body: "YouTube-Link einfügen, und dein Song steht auf der Bühne. Danach hat dein Gegner das Wort.",
      },
      {
        icon: "🧭",
        title: "Halte das Format",
        body: "Der Eröffnungssong muss zum vereinbarten Genre passen; jeder weitere Song muss dem vorherigen in Genre, Energie und Welt nahekommen. Ein passender Song bringt Punkte, ein beliebiger kostet welche.",
      },
      {
        icon: "🟥",
        title: "Zeig deine Karte",
        body: "Hat der Song deines Gegners das Format gesprengt? Zieh Gelb oder Rot. Das letzte Wort hat der Schiedsrichter.",
      },
    ],

    stepsEyebrow: "Was passiert nach der Registrierung?",
    stepsTitle: "In fünf Schritten auf die Bühne.",
    steps: (p: { minGenres: number; skipCost: number; minSongs: number; percent: number }) => [
      {
        title: "Profil einrichten",
        body: `Wähle einen Avatar und markiere die Genres, die du hörst (mindestens ${p.minGenres}). Zu sehen ist nur dein Nickname.`,
      },
      {
        title: "Music Fight starten",
        body: "Lade einen Freund per Link oder Raumcode ein, oder schau mit einem Code live zu. Bald: gegen die KI antreten.",
      },
      {
        title: "Münze werfen, Genre festlegen",
        body: "Wer schneller ist, wirft die Münze und wählt eine Seite. Wer die gefallene Seite hat, eröffnet das Match; der Verlierer wählt das Genre aus euren gemeinsamen Genres.",
      },
      {
        title: "Hören, dann entscheiden",
        body: `Du hörst mindestens ${p.percent}% des Songs deines Gegners und entscheidest dann. Wenn du nicht warten willst, kannst du ihn für ${p.skipCost} Punkte ungehört überspringen.`,
      },
      {
        title: "Song spielen, Punkte sammeln",
        body: `Sobald ihr beide mindestens ${p.minSongs} Songs gespielt habt, könnt ihr mit „Match beenden“ Schluss machen. Der Sieger bekommt einen Bonus, die Punkte gehen in die Bestenliste.`,
      },
    ],

    scoreEyebrow: "Punkte",
    scoreTitle: "Jeder Song kommt aufs Konto.",
    scoreRows: (p: {
      match: number;
      mismatch: number;
      yellow: number;
      red: number;
      skip: number;
      win: number;
      draw: number;
      ai: number;
    }) => [
      { label: "Song, der ins Format passt (auch die Eröffnung)", value: `+${p.match}`, tone: "text-mint" },
      { label: "Song, der nicht passt", value: `${p.mismatch}`, tone: "text-blaze" },
      { label: "Vom Schiedsrichter bestätigte Gelbe Karte", value: `${p.yellow}`, tone: "text-sun" },
      { label: "Vom Schiedsrichter bestätigte Rote Karte", value: `${p.red}`, tone: "text-blaze" },
      { label: "Song ungehört überspringen (für den Überspringenden)", value: `${p.skip}`, tone: "text-sun" },
      { label: "Match gewinnen", value: `+${p.win}`, tone: "text-mint" },
      { label: "Unentschieden (für euch beide)", value: `+${p.draw}`, tone: "text-volt-300" },
    ],
    scoreNote: (min: number) =>
      `Für Boni braucht ihr beide mindestens ${min} Songs. Zuschauer bekommen keine Punkte.`,

    rules: (p: {
      yellow: number;
      red: number;
      skipCost: number;
      maxMinutes: number;
      aiPercent: number;
      minAge: number;
      minSongs: number;
      turnMinutes: number;
      waitingMinutes: number;
      percent: number;
    }) => [
      {
        eyebrow: "Regeln",
        title: "Kurz, aber ohne Ausnahmen.",
        items: [
          {
            icon: "🪙",
            text: "Ein Match beginnt mit einem Münzwurf: Wer schneller ist, wirft, wer schneller ist, wählt Kopf oder Zahl, die andere Seite bleibt dem Gegner. Wer die gefallene Seite hat, spielt den Eröffnungssong.",
          },
          {
            icon: "🎼",
            text: "Wer den Wurf verliert, wählt das Genre — die Vorschläge kommen aus den Genres, die beide Profile gemeinsam haben. Der Gewinner darf diesen Vorschlag einmal ablehnen; die zweite Wahl ist endgültig. Der Eröffnungssong muss dazu passen.",
          },
          {
            icon: "🟨🟥",
            text: `Jeder Spieler hat pro Match ${p.yellow} Gelbe und ${p.red} Rote Karten. Gelb heißt „passt nicht ganz“, Rot heißt „völlig daneben“. Sieht der Schiedsrichter das anders, ist die Karte verbrannt und nichts ändert sich.`,
          },
          {
            icon: "🎧",
            text: `Bevor du nicht mindestens ${p.percent}% des gegnerischen Songs gehört hast, kannst du weder spielen noch eine Karte zeigen.`,
          },
          {
            icon: "⏭️",
            text: `Du darfst das Hören überspringen: Jedes Überspringen kostet dich ${p.skipCost} Punkte, unbegrenzt oft. Auf einen übersprungenen Song darfst du Gelb zeigen, aber nie Rot.`,
          },
          {
            icon: "⏱️",
            text: `Songs über ${p.maxMinutes} Minuten werden abgelehnt, und derselbe Song kann in einem Match nicht zweimal laufen.`,
          },
          { icon: "🤖", text: `Matches gegen die KI bringen ${p.aiPercent}% der üblichen Punkte.` },
          { icon: "🔞", text: `Für die Registrierung musst du mindestens ${p.minAge} Jahre alt sein.` },
        ],
      },
      {
        eyebrow: "Wie endet ein Match?",
        title: "Verlängern erlaubt, weglaufen nicht.",
        items: [
          {
            icon: "🏁",
            text: `Sobald ihr beide mindestens ${p.minSongs} Songs gespielt habt und der Stand gleich ist, endet das Match, wenn ihr beide auf „Match beenden“ drückt. Nach oben gibt es keine Grenze.`,
          },
          {
            icon: "⏳",
            text: `Wenn du dran bist, hast du ${p.turnMinutes} Minuten für deinen Song (die Uhr startet nach der Hördauer des gegnerischen Songs). Läuft sie ab, gewinnt dein Gegner kampflos.`,
          },
          { icon: "🏳️", text: "Du kannst jederzeit aufgeben; wer aufgibt, verliert das Match." },
          {
            icon: "🚶",
            text: "Beim Genre nicht einig geworden? Bis zum ersten Song kann jeder von euch ohne Punktverlust aussteigen. Einer reicht, und niemand wird bewertet.",
          },
          {
            icon: "🎁",
            text: `Sieg- und Unentschieden-Bonus gibt es nur, wenn ihr beide mindestens ${p.minSongs} Songs gespielt habt.`,
          },
          { icon: "🚪", text: `Räume, zu denen innerhalb von ${p.waitingMinutes} Minuten niemand kommt, schließen von selbst.` },
        ],
      },
      {
        eyebrow: "Chat und Zuschauer",
        title: "Zusehen darf jeder, verraten niemand.",
        items: [
          {
            icon: "👀",
            text: "Jedes Match lässt sich mit seinem Raumcode live verfolgen. Die Spieler können es jederzeit für Zuschauer schließen. Zuschauer bekommen keine Punkte.",
          },
          { icon: "💬", text: "Während eines Matches schreiben Spieler und Zuschauer im selben Chat, mit Text und Emoji." },
          {
            icon: "⛔",
            text: "Songtitel, Künstler, Links oder irgendwelche Hinweise im Chat sind verboten. Der Schiedsrichter liest den Chat mit; wer die Regel bricht, verliert sein Konto dauerhaft.",
          },
          { icon: "🧼", text: "Schimpfwörter werden automatisch maskiert. Wer dich stört, lässt sich melden oder blockieren." },
          { icon: "🗑️", text: "Chatnachrichten werden mit dem Ende des Matches gelöscht." },
        ],
      },
    ],

    leaderEyebrow: "Bestenliste",
    leaderTitle: "Wer steht oben?",
    leaderNote: "Istanbuler Zeit: Der Tag beginnt um Mitternacht, die Woche am Montag, der Monat am 1.",
    dailyTitle: "Tagesbeste",
    dailySubtitle: "Heute gesammelte Punkte",
    weeklyTitle: "Wochenbeste",
    weeklySubtitle: "Diese Woche gesammelte Punkte",
    monthlyTitle: "Monatsbeste",
    monthlySubtitle: "Diesen Monat gesammelte Punkte",

    ctaTitle: "Bereit für deinen ersten Song?",
    ctaBody: "Registrier dich, richte dein Profil ein, schick einem Freund deinen Raumcode. Den Rest machen die Songs.",
    ctaButton: "Registrieren und loslegen",
  },

  lobbyPage: {
    eyebrow: "Lobby",
    welcome: "Willkommen zurück,",
    points: (total: number) => `${total} Punkte insgesamt. Aus welcher Welt spielst du heute?`,
    banners: (p: { yellow: number; red: number; minSongs: number; turnMinutes: number }) => [
      {
        icon: "🪙",
        title: "Ein Match beginnt mit einem Wurf",
        body: "Wer schneller ist, wirft die Münze und wählt eine Seite. Der Gewinner eröffnet, der Verlierer wählt das Genre.",
        tone: "from-sun/15",
      },
      {
        icon: "🎯",
        title: "Verbrenn deine Karten nicht zu früh",
        body: `Du hast pro Match ${p.yellow} Gelbe und ${p.red} Rote Karten. Sieht es der Schiedsrichter anders, war die Karte umsonst.`,
        tone: "from-flare-500/15",
      },
      {
        icon: "🏁",
        title: "Wie endet ein Match?",
        body: `Sobald ihr beide mindestens ${p.minSongs} Songs gespielt habt, drückt auf „Match beenden“. In deinem Zug hast du ${p.turnMinutes} Minuten, sonst verlierst du kampflos. Bis zum ersten Song kannst du ohne Wertung aussteigen.`,
        tone: "from-mint/15",
      },
      {
        icon: "👀",
        title: "Zuschauen und mitreden",
        body: "Du hast einen Raumcode? Schau das Match live mit. Hinweise im Chat kosten dich dein Konto.",
        tone: "from-pulse-500/15",
      },
      {
        icon: "🎨",
        title: "Mach dein Profil zu deinem",
        body: "Wähle einen Avatar, trag deine Lieblingsgenres ein. Deine Gegner sollen wissen, gegen wen sie spielen.",
        tone: "from-volt-500/20",
      },
    ],
    weeklyTitle: "Wochenbeste",
    weeklySubtitle: "Diese Woche gesammelte Punkte",
  },

  signupPage: {
    eyebrow: "Komm dazu",
    titleBefore: "Vor der Bühne brauchst du ",
    titleAccent: "einen Namen",
    titleAfter: ".",
    body: "Dein echter Name und deine E-Mail bleiben bei deinem Konto. In Matches, in der Bestenliste und in deinem Profil sieht man nur deinen Nickname.",
    formTitleMobile: "Registrieren",
    formTitle: "Konto erstellen",
    formNote: "Dauert eine Minute, dann meldest du dich an und legst los.",
  },

  loginPage: {
    created: "Dein Konto steht! Melde dich an und starte dein erstes Match.",
    needLogin: "Zum Weitermachen musst du dich anmelden.",
    title: "Willkommen zurück",
    note: "Melde dich mit Nickname und Passwort an.",
  },

  profilePage: {
    eyebrow: "Spieler",
    memberSince: (date: string) => `Dabei seit ${date}`,
    totalPoints: "Punkte gesamt",
    genresTitle: "Lieblingsgenres",
    noGenresOwner: "Du hast noch keine Genres eingetragen — wähl unten welche aus.",
    noGenres: "Noch keine Genres eingetragen.",
    blockedTitle: "Von dir blockiert",
    blockedNote: "Die Chatnachrichten dieser Leute siehst du nicht. Diese Liste sieht nur du.",
    blockedEmpty: "Du hast niemanden blockiert.",
    unblock: "Blockierung aufheben",
    saved: "Dein Profil wurde aktualisiert.",
  },

  validation: {
    firstNameMin: "Dein Vorname braucht mindestens 2 Zeichen.",
    firstNameMax: "Dein Vorname darf höchstens 40 Zeichen haben.",
    lastNameMin: "Dein Nachname braucht mindestens 2 Zeichen.",
    lastNameMax: "Dein Nachname darf höchstens 40 Zeichen haben.",
    nickname: "3-20 Zeichen; Buchstaben, Ziffern und Unterstriche.",
    email: "Gib eine gültige E-Mail-Adresse ein.",
    birthDateRequired: "Gib dein Geburtsdatum ein.",
    birthDateInvalid: "Gib ein gültiges Datum ein.",
    birthDateFuture: "Ein Geburtsdatum kann nicht in der Zukunft liegen.",
    tooYoung: (age: number) => `Für Music Fight musst du mindestens ${age} Jahre alt sein.`,
    passwordMin: "Das Passwort braucht mindestens 8 Zeichen.",
    passwordMax: "Das Passwort darf höchstens 128 Zeichen haben.",
    passwordLetter: "Das Passwort braucht mindestens einen Buchstaben.",
    passwordDigit: "Das Passwort braucht mindestens eine Ziffer.",
    passwordMismatch: "Die Passwörter stimmen nicht überein.",
    kvkk: "Zum Fortfahren musst du die Datenschutzerklärung akzeptieren.",
    genreNotInList: "Es wurde ein Genre außerhalb der Liste gewählt.",
    genresMin: (min: number) => `Wähle mindestens ${min} Genres.`,
    genresMax: (max: number) => `Du kannst höchstens ${max} Genres wählen.`,
    emailTaken: "Mit dieser E-Mail-Adresse gibt es bereits ein Konto.",
    nicknameTaken: "Dieser Nickname ist vergeben, versuch einen anderen.",
    loginMissing: "Gib Nickname und Passwort ein.",
    loginWrong: "Nickname oder Passwort ist falsch.",
  },

  roomPage: {
    metaTitle: (code: string) => `Raum ${code}`,
    closedNote: "Öffnen die Spieler das Match wieder, kannst du hier zusehen.",
    backToLobby: "Zurück zur Lobby",
  },

  kvkk: {
    draftLabel: "Entwurf.",
    draftBody:
      "Dieser Text ist ein Platzhalter. Vor dem Livegang muss er durch eine echte, von eurer Rechtsberatung erstellte Datenschutzerklärung ersetzt werden.",
    title: "Datenschutzerklärung",
    controllerTitle: "Verantwortlicher",
    controllerBody: "[Firmenname, Anschrift und Kontaktdaten kommen hierhin.]",
    dataTitle: "Verarbeitete personenbezogene Daten",
    data: [
      "Identität: Vorname, Nachname, Geburtsdatum",
      "Kontakt: E-Mail-Adresse",
      "Konto: Nickname, ein nicht umkehrbarer Hash des Passworts, Avatar und Genre-Vorlieben",
      "Spiel: gespielte Matches, gesendete Song-Links, Karten und Punkte",
      "Chat: Nachrichten während eines Matches (werden danach gelöscht) und eine zur Prüfung aufbewahrte Kopie gemeldeter Nachrichten",
      "Moderation: Nickname wegen Regelverstoßes gelöschter Konten und der Grund der Löschung",
    ],
    purposeTitle: "Zwecke der Verarbeitung",
    purposeBody:
      "Konto anlegen, Altersgrenze prüfen, anmelden, Matches durchführen sowie Punkte und Bestenlisten berechnen. Vorname, Nachname, E-Mail und Geburtsdatum werden anderen Nutzern nie gezeigt.",
    rightsTitle: "Deine Rechte",
    rightsBody: "Um deine Rechte an deinen personenbezogenen Daten auszuüben, erreichst du uns über [Kontaktweg].",
  },

  devCoin: {
    eyebrow: "Entwicklungsvorschau",
    title: "Münzwurf und Genrewahl",
    body: "Läuft ohne Datenbank; zeigt nur den Anfang eines Matches.",
    whoseEyes: "Aus wessen Sicht schaust du?",
    restart: "↻ Von vorn",
    watchAgain: "Noch einmal ansehen",
    openingBy: (name: string) => name,
    openingLine: "Den Eröffnungssong spielt",
    fakeNote:
      "Diese Seite läuft mit Testdaten: In einem echten Match zieht der Server das Ergebnis und schickt es niemandem, bevor eine Seite gewählt ist. Hier kannst du die Buttons beider Spieler drücken.",
  },
};
