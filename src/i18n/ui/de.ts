import type { Ui } from "./tr";

export const ui: Ui = {
  common: {
    close: "Schließen",
    cancel: "Abbrechen",
    send: "Senden",
    somethingWrong: "Da ist etwas schiefgelaufen.",
    sessionExpired: "Deine Sitzung ist abgelaufen, bitte melde dich erneut an.",
    you: "du",
    opponent: "Dein Gegner",
    aPlayer: "Ein Spieler",
    player: "Spieler",
    backToLobby: "Zurück zur Lobby",
  },

  header: {
    home: "Music Fight Startseite",
    login: "Anmelden",
    signup: "Registrieren",
    lobby: "Lobby",
    logout: "Abmelden",
  },

  language: {
    label: "Sprache",
    change: "Sprache wechseln",
  },

  signup: {
    firstName: "Vorname",
    lastName: "Nachname",
    nickname: "Nickname",
    nicknameHint: "Mehr sieht niemand von dir. 3-20 Zeichen: Buchstaben, Ziffern und _",
    email: "E-Mail",
    birthDate: "Geburtsdatum",
    birthDateHint: (age: number) => `Für die Registrierung musst du mindestens ${age} Jahre alt sein.`,
    genres: "Was du hörst",
    genresCount: (picked: number, max: number, min: number) => `${picked}/${max} · mindestens ${min}`,
    genresHint:
      "Das Eröffnungsgenre eines Matches kommt aus den Genres, die beide Spieler gemeinsam haben. Du kannst das später ändern.",
    password: "Passwort",
    passwordHint: "Mindestens 8 Zeichen, mit einem Buchstaben und einer Ziffer.",
    passwordConfirm: "Passwort (wiederholen)",
    showPassword: "Passwort anzeigen",
    kvkkBefore: "Ich habe die ",
    kvkkLink: "Datenschutzerklärung",
    kvkkAfter: " gelesen und bin damit einverstanden, dass meine Daten wie darin beschrieben verarbeitet werden.",
    submit: "Registrieren",
    submitting: "Dein Konto wird erstellt…",
    haveAccount: "Schon ein Konto?",
    loginLink: "Anmelden",
  },

  login: {
    nickname: "Nickname",
    password: "Passwort",
    submit: "Anmelden",
    submitting: "Du wirst angemeldet…",
    noAccount: "Noch kein Konto?",
    signupLink: "Registrieren",
  },

  joinByCode: {
    label: "Hast du einen Raumcode?",
    hint: "Ist ein Platz frei, kannst du einsteigen oder zuschauen; läuft das Match schon, schaust du zu.",
    submit: "Zum Raum →",
  },

  startDialog: {
    open: "Music Fight starten",
    eyebrow: "Neues Match",
    title: "Wie willst du antreten?",
    soon: "Bald",
    creating: "Raum wird geöffnet…",
    createFailed: "Der Raum konnte nicht erstellt werden.",
    friendTitle: "Freund einladen",
    friendBody:
      "Öffne einen Raum und teile Link oder Code. Sobald dein Freund da ist, werft ihr eine Münze, legt das Genre fest und es geht los.",
    aiTitle: "Gegen die KI",
    aiBody: "Niemand da? Spiel gegen die KI. Du bekommst die Hälfte der Punkte eines normalen Matches.",
    watchTitle: "Zuschauen",
    watchBody:
      "Schau jedes Match mit seinem Raumcode live mit und rede im Chat mit. Zuschauer bekommen keine Punkte. Bald: KI-Matches.",
    watchCodeLabel: "Raumcode des Matches, das du sehen willst",
    watchSubmit: "👀 Zuschauen",
  },

  profileEditor: {
    title: "Profil bearbeiten",
    avatar: "Avatar",
    genres: (picked: number, max: number) => `Musikgenres · ${picked}/${max}`,
    save: "Speichern",
    saving: "Wird gespeichert…",
  },

  stage: {
    loading: "Player wird geladen…",
    enough: "✓ Genug gehört",
    heard: (percent: number) => `🎧 Gehört: ${percent}%`,
    required: (heard: string, needed: string) => `${heard} / ${needed} nötig`,
    requiredMark: "Nötige Hördauer",
    muted: "🔇 Zeit mit stummem Ton zählt nicht.",
    rules: "Vorgespultes zählt nicht, und dieselbe Stelle noch einmal zu hören bringt auch nichts.",
  },

  coin: {
    eyebrow: "Matchbeginn",
    title: "Wer fängt an?",
    throw: "🪙 Münze werfen",
    yazi: "Kopf",
    tura: "Zahl",
    idleMine: "Beim Wurf gibt es keine Reihenfolge: Wer schneller ist, drückt, und einer von euch reicht.",
    idleWatching: (a: string, b: string) => `${a} und ${b} warten auf den Münzwurf.`,
    spinningMine: "Die Münze ist oben! Wer schneller ist, nimmt eine Seite, die andere bleibt dem Gegner.",
    spinningWatching: "Die Münze ist oben, die Spieler wählen ihre Seite.",
    falling: "Die Münze fällt…",
    resultMine: (side: string) => `${side}! Der Eröffnungssong gehört dir.`,
    resultOther: (side: string, name: string) => `${side}! ${name} spielt den Eröffnungssong.`,
    sidesMine: (mine: string, name: string, theirs: string) => `Du: ${mine} · ${name}: ${theirs}`,
    sidesWatching: (a: string, aSide: string, b: string, bSide: string) => `${a}: ${aSide} · ${b}: ${bSide}`,
    pickedAuto: " — die Zeit lief ab, also hat der Server gewählt.",
    pickedByMe: " — du hast gewählt.",
    pickedByOther: (name: string) => ` — ${name} hat gewählt.`,
    deadline: (seconds: number) => `Drückt innerhalb von ${seconds}s niemand, wirft der Server die Münze.`,
  },

  genre: {
    eyebrow: "Genre des Matches",
    proposedToMe: (name: string, label: string) => `${name} schlägt „${label}“ vor`,
    proposedTitle: (label: string) => `${label} wurde vorgeschlagen`,
    myTurnTitle: "Du wählst das Genre",
    theirTurnTitle: (name: string) => `${name} wählt das Genre`,
    answerNote:
      "Nimmst du an, geht es los. Gefällt es dir nicht, darfst du einmal ablehnen; die zweite Wahl ist endgültig.",
    waitingNote: (name: string) =>
      `Du wartest auf ${name}. Bei einer Ablehnung wählst du erneut aus der Liste, und diese Wahl ist endgültig.`,
    watchingProposal: (name: string) => `${name} nimmt an oder lehnt ab.`,
    pickAfterVeto: "Der erste Vorschlag wurde abgelehnt. Diese Wahl ist endgültig, dein Gegner kann nicht noch einmal ablehnen.",
    pickNote: (name: string) => `Du hast den Wurf verloren, aber du bestimmst das Feld. ${name} muss damit eröffnen.`,
    watchingAfterVeto: "Der erste Vorschlag wurde abgelehnt. Die nächste Wahl gilt sofort.",
    watchingNote: "Die Vorschläge kommen aus den Genres, die beide Profile gemeinsam haben.",
    accept: "✓ Annehmen",
    veto: "✕ Anderes Genre",
    scoring: (match: number, mismatch: number) =>
      `Passt der Eröffnungssong zum Genre, gibt es +${match}, sonst ${mismatch}. Jeder weitere Song wird am vorherigen gemessen.`,
    deadline: (seconds: number) => ` · Wird innerhalb von ${seconds}s nichts gewählt, entscheidet der Server.`,
    startingSoon: (label: string) => `Das Match beginnt mit ${label}`,
  },

  send: {
    yourTurn: "● Du bist dran",
    openingTitle: "Wähle den Eröffnungssong",
    replyTitle: "Wähle deine Antwort",
    openingWithGenreBefore: "Ihr habt euch auf ",
    openingWithGenreAfter: (match: number, mismatch: number) =>
      ` geeinigt. Passt dein Eröffnungssong, gibt es +${match}, sonst ${mismatch}. Dein Gegner antwortet dann auf das Format deines Songs.`,
    openingNoGenre: "Du gibst das Format dieses Matches vor. Dein Gegner muss aus derselben Welt antworten.",
    reply: (match: number, mismatch: number) =>
      `Wähle einen Song nah am Format deines Gegners. Passt er, gibt es +${match}, daneben ${mismatch}.`,
    urlLabel: "YouTube-Link",
    check: "Prüfen",
    checking: "Wird geprüft…",
    checkFailed: "Der Link konnte nicht geprüft werden.",
    submit: "🎵 Song spielen",
    submitting: "Geht zum Schiedsrichter…",
    limits: (minutes: number) =>
      `Songs über ${minutes} Minuten und Livestreams werden abgelehnt. Derselbe Song kann in einem Match nicht zweimal laufen.`,
  },

  card: {
    eyebrow: "Deine Entscheidung",
    skipping: (cost: number) =>
      `⏭ Du antwortest ohne zu hören: ${cost} Punkte. Eine Gelbe Karte geht noch, eine Rote nicht.`,
    needListen: (percent: number, cost: number) =>
      `🔒 Hör erst mindestens ${percent}% des Songs, oder überspring ihn für ${cost} Punkte.`,
    preparing: (seconds: number) => `⏳ Der Schiedsrichter macht sich bereit… ${seconds}s`,
    ready: "Wie entscheidest du? Das Urteil öffnet sich in dem Moment, in dem du wählst.",
    yellow: "Gelbe Karte",
    yellowMeaning: "Passt nicht ganz",
    red: "Rote Karte",
    redMeaning: "Völlig daneben",
    redSkipMeaning: "Nur nach vollem Hören",
    none: "Keine Karte",
    noneMeaning: "Format passt",
    left: (left: number, penalty: number) => `${left} übrig · ${penalty}`,
    skipButton: (cost: number) => `⏭ Ohne Hören überspringen (−${cost} Punkte)`,
    skipCancel: "Doch nicht, weiter hören",
    footnote:
      "Findet auch der Schiedsrichter den Song unpassend, kassiert dein Gegner zusätzlich die Kartenstrafe. Akzeptiert er ihn, war deine Karte umsonst.",
  },

  chat: {
    title: "Chat",
    who: "Spieler + Zuschauer",
    empty: "Schreib die erste Nachricht.",
    closed: "Der Chat ist geschlossen.",
    placeholder: "Nachricht schreiben…",
    inputLabel: "Chatnachricht",
    send: "Senden",
    quickSend: (emoji: string) => `${emoji} senden`,
    options: (nickname: string) => `Optionen für die Nachricht von ${nickname}`,
    report: "🚩 Melden",
    block: "🚫 Blockieren",
    reported: (nickname: string) => `${nickname} wurde gemeldet. Wir sehen uns das an.`,
    blocked: (nickname: string) => `${nickname} ist blockiert. Du siehst diese Nachrichten nicht mehr.`,
    noLinks: "Links im Chat sind nicht erlaubt.",
    sendFailed: "Die Nachricht konnte nicht gesendet werden.",
    reportFailed: "Die Meldung konnte nicht gesendet werden.",
    blockFailed: "Blockieren hat nicht geklappt.",
    warning:
      "Songtitel, Künstler oder Hinweise im Chat sind verboten. Der Schiedsrichter liest den Chat mit; wer die Regel bricht, verliert sein Konto dauerhaft.",
  },

  controls: {
    endMatch: "🏁 Match beenden",
    withdrawEnd: "Stimme zurückziehen",
    needEqual: (min: number, mine: number, name: string, theirs: number) =>
      `Ihr braucht beide mindestens ${min} Songs, und der Stand muss gleich sein. Aktuell: du ${mine} · ${name} ${theirs}.`,
    waitingForThem: (name: string) =>
      `Das Match endet, sobald ${name} auch drückt. Bis dahin läuft es weiter, und in deinem Zug läuft deine Uhr.`,
    theyWant: (name: string) => `${name} will das Match beenden. Drück auch, dann ist Schluss.`,
    bothMustPress: "Das Match endet, wenn ihr beide drückt. Ihr könnt so lange weitermachen, wie ihr wollt.",
    surrender: "🏳️ Aufgeben",
    surrenderWarning: "Wer aufgibt, verliert das Match.",
    surrenderBonus: (name: string, bonus: number) => `${name} bekommt den Siegbonus von +${bonus}.`,
    surrenderNoBonus: (min: number) => `Keiner von euch hat ${min} Songs erreicht, also gibt es keinen Bonus.`,
    surrenderConfirm: "Ja, aufgeben",
    leave: "🚪 Match verlassen",
    leaveHint: "Beim Genre nicht einig geworden? Bis zum ersten Song kannst du ohne Verlust aussteigen.",
    leaveQuestion: "Willst du dieses Match verlassen?",
    leaveNote: "Es wurde noch kein Song gespielt: niemand bekommt Punkte, der Raum schließt.",
    leaveConfirm: "Ja, verlassen",
    spectatorsOn: "Für Zuschauer offen",
    spectatorsHint: "Jeder mit dem Raumcode kann zusehen und mitreden.",
  },

  clock: {
    mineLabel: "Dein Zug",
    theirLabel: (name: string) => `Restzeit für ${name}`,
    includesListening: "(Hördauer inbegriffen)",
    mineOver: "Zeit abgelaufen",
    theirOver: "Zeit abgelaufen",
  },

  history: {
    title: "Songs",
    empty: "Noch kein Song gespielt.",
    sealed: "🔒 Urteil versiegelt",
    skipped: "⏭ übersprungen",
    skippedTitle: (penalty: number) => `Der Gegner hat ohne Hören geantwortet (${penalty})`,
    yellowTitle: "Gelbe Karte",
    redTitle: "Rote Karte",
  },

  verdict: {
    mismatch: "Schiedsrichter: passt nicht ins Format",
    match: "Schiedsrichter: passt ins Format",
    cardUpheld: (name: string, penalty: number) => `${name} bestätigt: ${penalty} obendrauf`,
    cardWasted: (name: string) => `${name} umsonst — der Schiedsrichter hat den Song akzeptiert`,
    noCard: "Keine Karte gezeigt",
    yellow: "Gelbe Karte",
    red: "Rote Karte",
    skipped: (penalty: number) => `⏭ Ohne Hören beantwortet; wer übersprungen hat, bekam ${penalty}.`,
    theirResult: (name: string) => `Ergebnis des Songs von ${name}`,
    myResult: "Ergebnis deines Songs",
  },

  result: {
    over: "Match vorbei",
    cancelledEyebrow: "Match kam nicht zustande",
    cancelled: "Match abgebrochen",
    draw: "Unentschieden!",
    wonWatching: (name: string) => `${name} hat gewonnen`,
    won: "Gewonnen! 🏆",
    lost: "Diesmal nicht",
    reasonCancelled: "Jemand ist gegangen, bevor ein einziger Song lief.",
    reasonAgreement: "Beide Spieler wollten das Match beenden.",
    reasonSurrenderMine: "Du hast aufgegeben.",
    reasonSurrenderTheirs: (name: string) => `${name} hat aufgegeben.`,
    reasonTimeoutMine: "Du hast nicht rechtzeitig einen Song geschickt, das Match ging an deinen Gegner.",
    reasonTimeoutTheirs: (name: string) => `${name} hat nicht rechtzeitig einen Song geschickt — Sieg ohne Spiel.`,
    reasonViolation: (name: string) => `${name} wurde wegen eines Regelverstoßes aus dem Match entfernt.`,
    bonusCancelled: "Niemand wurde bewertet; beide Punktestände bleiben, wie sie waren.",
    bonusNone: (min: number) => `Kein Bonus: Das Match endete, bevor beide ${min} Songs erreicht hatten.`,
    bonusDraw: (bonus: number) => `Ihr bekommt beide den Unentschieden-Bonus von +${bonus}.`,
    bonusWon: (bonus: number) => `Der Siegbonus von +${bonus} ging auf dein Konto.`,
    bonusTheirs: (name: string, bonus: number) => `${name} hat den Siegbonus von +${bonus} bekommen.`,
    songCount: (count: number) => `${count} Songs gespielt`,
    withGenre: (label: string) => ` · Eröffnungsgenre: ${label}`,
    newMatch: "Neues Match",
    backToLobby: "Zur Lobby",
    leaderboard: "Bestenliste",
  },

  waiting: {
    eyebrow: "Raum offen",
    title: "Hol deinen Gegner dazu",
    body: "Schick den Link oder den Raumcode. Sobald er da ist, werft ihr eine Münze, legt das Genre fest und es geht los. Zuschauer nutzen denselben Code.",
    roomCode: "Raumcode",
    copy: "Kopieren",
    copied: "Kopiert ✓",
    inviteLink: "Einladungslink",
    copyLink: "Link kopieren",
    waitingForOpponent: "● Warte auf einen Gegner…",
  },

  spectator: {
    badge: "Zuschauermodus",
    waitingTitle: "Warten auf den Matchbeginn",
    waitingBody: (host: string) => `${host} wartet auf einen Gegner. Sobald es losgeht, siehst du die Songs hier live.`,
    nowPlaying: (sender: string, listener: string) => `${sender} hat gespielt · ${listener} hört`,
    choosing: (name: string) => `${name} wählt einen Song…`,
    choosingOpening: (name: string) => `${name} wählt den Eröffnungssong…`,
    willPlay: "Er startet hier, sobald er da ist.",
    openingGenre: (label: string) => `Der Eröffnungssong muss ${label} sein.`,
    count: (count: number) => `👀 ${count} Zuschauer`,
    closed: "🔒 Für Zuschauer geschlossen",
  },

  join: {
    title: (name: string) => `${name} wartet auf einen Gegner`,
    body: "Steigst du als Gegner ein, werft ihr erst eine Münze und legt das Genre fest, dann geht es los. Willst du nur zusehen, bleibt der Platz frei.",
    join: "🥊 Match beitreten",
    joining: "Du steigst ein…",
    watch: "👀 Zuschauen",
    closed: "Dieses Match ist für Zuschauer geschlossen.",
  },

  opponent: {
    turn: (name: string) => `Gegner am Zug · ${name}`,
    listening: "🎧 Hört deinen Song…",
    listeningNote:
      "Ungefähre Hördauer. Danach fällt die Kartenentscheidung, und dann öffnet sich das Urteil des Schiedsrichters.",
    choosing: (name: string) => `${name} wählt einen Song…`,
    choosingNote: "Sobald er da ist, kannst du mit dem Hören anfangen.",
    theyPlayed: (sender: string) => `${sender} hat diesen Song gespielt`,
  },

  room: {
    back: "← Lobby",
    expiredTitle: "Dieser Raum ist geschlossen",
    expiredBody: (minutes: number) => `Innerhalb von ${minutes} Minuten kam kein Gegner, also wurde der Raum geschlossen.`,
    newMatch: "Neuen Raum öffnen",
  },

  scoreboard: {
    waitingForOpponent: "Warte auf einen Gegner…",
    onTurn: "● am Zug",
    wantsToEnd: "will beenden ✓",
    yellowCards: (left: number, total: number) => `Gelbe Karten: ${left}/${total}`,
    redCards: (left: number, total: number) => `Rote Karten: ${left}/${total}`,
  },

  leaderboard: {
    empty: "Noch niemand — sei der Erste",
  },

  preview: {
    live: "Live-Beispiel",
    played: (name: string) => `${name} hat gespielt`,
    opening: "Schiedsrichter: Genre passt",
    match: "Schiedsrichter: passt",
    mismatch: "Schiedsrichter: daneben",
  },
};
