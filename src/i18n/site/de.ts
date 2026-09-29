import type { Site } from "./tr";

export const site: Site = {
  meta: {
    signup: "Registrieren",
    login: "Anmelden",
    lobby: "Lobby",
    coinPreview: "Münzwurf-Vorschau",
    tagline: "Kämpf mit deinen Songs. Abwechselnd spielen — wer das Format verfehlt, verliert Punkte.",
  },

  footer: {
    cookies: "Cookie-Einstellungen",
    help: "Hilfe",
    contact: "Kontakt",
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
        body: "Hat der Song deines Gegners das Format gesprengt? Zieh Gelb oder Rot. Stimmt der Schiedsrichter zu, beendet Rot das Match.",
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
            text: `Jeder Spieler hat pro Match ${p.yellow} Gelbe und ${p.red} Rote Karten. Eine Karte zählt nur, wenn der Schiedsrichter zustimmt: Rot beendet das Match sofort und wer sie bekommt, verliert es; die zweite Gelbe ebenso. Sieht er es anders, ist die Karte verbrannt und nichts ändert sich.`,
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
            text: "Songtitel, Künstler, Links oder irgendwelche Hinweise im Chat sind verboten. Der Schiedsrichter liest mit: die ersten beiden Verstöße sind Verwarnungen, beim dritten wird das Konto eingeschränkt — keine Matches, kein Zuschauen.",
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
        body: `Du hast pro Match ${p.yellow} Gelbe und ${p.red} Rote Karten. Eine gültige Rote oder die zweite Gelbe beendet das Match; sieht es der Schiedsrichter anders, war die Karte umsonst.`,
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
        body: "Du hast einen Raumcode? Schau das Match live mit. Hinweise im Chat kosten eine Verwarnung; nach dreien wird dein Konto eingeschränkt.",
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
    nicknameShort: "Ein Nickname braucht mindestens 3 Zeichen.",
    nicknameLong: "Ein Nickname darf höchstens 20 Zeichen haben.",
    nicknameChars: (chars: string) =>
      `Das geht im Nickname nicht: ${chars}. Buchstaben jedes Alphabets, Ziffern und Unterstriche sind erlaubt.`,
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

  help: {
    title: "Hilfe",
    intro: "Hier steht, was du wissen willst. Tipp auf eine Frage, dann klappt die Antwort auf.",
    playQ: "Wie spielt man Music Fight?",
    playA:
      "Zwei Spieler schicken abwechselnd Songs von YouTube. Jeder Song muss nah am Format des vorherigen liegen: Genre, Energie, Ära, Produktion. Der Schiedsrichter entscheidet bei jedem Song, ob er passt oder nicht. Passt er, gibt es Punkte, sonst kostet er welche. Im Lauf eines Matches driftet die Musik irgendwohin, wo keiner von euch sie geplant hat — genau das macht den Reiz aus.",
    signupQ: "Wie melde ich mich an?",
    signupA: (minGenres: number, minAge: number) =>
      `Name, Nickname, E-Mail, Geburtsdatum und ein Passwort genügen. Du musst über ${minAge} sein, um die Seite zu nutzen. Dazu wählst du mindestens ${minGenres} Genres: Das Eröffnungsgenre eines Matches kommt aus den Genres, die beide Spieler gemeinsam haben, deshalb darf diese Liste nicht leer sein. Auf der Seite ist nur dein Nickname sichtbar; dein echter Name und deine E-Mail werden niemandem gezeigt.`,
    startQ: "Wie starte ich ein Match?",
    startA:
      "Öffne in der Lobby ein neues Match, dann bekommst du einen Raumcode. Schick den Code an einen Freund, der ihn in der Lobby einträgt und dazukommt. Wer dazukommt, kann den zweiten Platz einnehmen oder einfach zusehen.",
    coinQ: "Wie läuft der Münzwurf ab?",
    coinA: (seconds: number) =>
      `Sobald beide Spieler im Raum sind, erscheint der Knopf „Münze werfen“; wer zuerst drückt, wirft sie, und einer von euch reicht. Während die Münze fliegt, erscheinen bei beiden Spielern Kopf und Zahl; wer schneller ist, nimmt eine Seite, die andere fällt dem Gegner zu. Wer die gefallene Seite hält, schickt den Eröffnungssong. Das Ergebnis wird auf dem Server gezogen, sobald die Münze hochgeht, aber es wird niemandem geschickt, bevor eine Seite gewählt ist — so kann niemand mit Wissen um das Ergebnis wählen. Drückt innerhalb von ${seconds} Sekunden niemand, wirft der Server.`,
    genreQ: "Wer bestimmt das Genre des Matches?",
    genreA:
      "Wer den Wurf verliert, bestimmt es. Vorgeschlagen wird eine Liste aus den Genres, die beide Profile gemeinsam haben; gibt es wenig Überschneidung, wird sie mit breit bekannten Genres auf fünf aufgefüllt. Der Gegner darf die Wahl einmal ablehnen, die zweite Wahl ist endgültig. Das Genre bindet nur den Eröffnungssong; jeder weitere Song wird am vorherigen gemessen.",
    sendQ: "Wie schicke ich einen Song?",
    sendA: (maxMinutes: number) =>
      `Füge den YouTube-Link ins Feld ein und drücke „Prüfen“. Du siehst Titel, Kanal und Länge; stimmt alles, schick ihn ab. Songs über ${maxMinutes} Minuten und Livestreams werden abgelehnt. Derselbe Song kann in einem Match nicht zweimal laufen.`,
    listenQ: "Warum muss ich mit Ton hören?",
    listenA: (percent: number) =>
      `Bevor du über den Song deines Gegners entscheiden kannst, musst du mindestens ${percent}% davon hören. Der Zähler läuft nur, während der Song spielt und der Ton an ist; leise drehen und warten füllt den Balken nicht. Vorspulen hilft ebenso wenig, denn gezählt werden die Sekunden, die du wirklich gehört hast, und dieselbe Stelle zweimal zu hören zählt nicht doppelt. Der Grund ist einfach: Deine Kartenentscheidung und das Urteil des Schiedsrichters setzen voraus, dass du wirklich zugehört hast.`,
    skipQ: "Kann ich ohne Hören antworten?",
    skipA: (cost: number) =>
      `Kannst du, aber es kostet: ${cost} Punkte. Eine Gelbe Karte darfst du auf einen übersprungenen Song immer noch zeigen, eine Rote nicht — mit einem Song, den du nie gehört hast, wirfst du niemanden aus dem Match. Überspringen ist unbegrenzt, und alle sehen, dass du es getan hast.`,
    cardsQ: "Wie funktionieren Gelbe und Rote Karten?",
    cardsA: (yellows: number, yellowPenalty: number, redPenalty: number) =>
      `Wenn dir der Song deines Gegners unpassend vorkommt, zeigst du eine Karte: Gelb heißt „passt nicht ganz“, Rot heißt „völlig daneben“. Eine Karte zählt nur, wenn auch der Schiedsrichter den Song unpassend findet; akzeptiert er ihn, war deine Karte umsonst und nichts ändert sich. Eine gültige Gelbe kostet deinen Gegner ${yellowPenalty} Punkte, eine Rote ${redPenalty}. Die Punkte sind nicht der eigentliche Einsatz: Wie im Fußball beendet eine gültige Rote das Match sofort, und wer sie bekommen hat, verliert es. Zwei gültige Gelbe bewirken dasselbe. Jeder Spieler hat pro Match ${yellows} Gelbe und eine Rote.`,
    varQ: "Was ist der VAR und wie nutze ich ihn?",
    varA: (seconds: number) =>
      `Genau wie im Fußball: Der Schiedsrichter auf dem Platz entscheidet schnell, der VAR schaut genauer hin. Hat dein Gegner dir eine Karte gezeigt und der Schiedsrichter ihm recht gegeben, greift die Karte nicht sofort — sie kommt erst zu dir. Du hast ${seconds} Sekunden: Entscheidung annehmen oder zum VAR schicken. Ein zweiter Schiedsrichter sieht sich dann das ganze Match an, die Songs davor und wie nah die Subgenres wirklich beieinander liegen; sein Wort ist endgültig. Wird die Entscheidung gekippt, ist die Karte weg, dein Song gilt als passend, deine Punkte werden korrigiert und die Karte geht an deinen Gegner zurück. Bleibt sie bestehen, zählt die Karte. Eine Prüfung pro Match; läuft die Zeit ab, bleibt die Karte einfach bestehen.`,
    refereeQ: "Was macht der Schiedsrichter?",
    refereeA:
      "Der Schiedsrichter ist eine KI. Aus Titel und Kanal erschließt er Künstler, Stück und Genre und vergleicht das dann mit dem vorherigen Song oder, beim Eröffnungszug, mit dem vereinbarten Genre. Er schreibt sein Urteil und die Begründung dazu. Die Begründung entsteht gleich in allen drei Sprachen, denn dasselbe Urteil lesen beide Spieler und alle Zuschauer. Das Urteil bleibt versiegelt, bis du deine Kartenentscheidung getroffen hast — niemand kann vorher nachsehen und sich danach richten.",
    scoringQ: "Wie werden Punkte vergeben?",
    scoringA: (match: number, mismatch: number, win: number, draw: number, minSongs: number) =>
      `Ein Song, den der Schiedsrichter annimmt, bringt +${match}, ein abgelehnter ${mismatch}. Der Eröffnungssong zählt genauso, denn auch er hat ein Genre, dem er gerecht werden muss. Karten- und Überspring-Strafen kommen obendrauf. Am Ende bekommt der Sieger +${win}, bei einem Unentschieden beide +${draw} — diese Boni gibt es aber nur, wenn beide mindestens ${minSongs} Songs geschickt haben, damit niemand das Match abkürzt, um sie einzusammeln. Alles, was du verdienst, landet in deinem Profil und in der Bestenliste.`,
    endQ: "Wie endet ein Match?",
    endA: (minSongs: number, turnMinutes: number) =>
      `Meistens im Einvernehmen: Sobald beide mindestens ${minSongs} Songs geschickt haben und der Stand gleich ist, drücken beide auf „Match beenden“, und die höhere Punktzahl gewinnt. Ein Match kann auch durch Karten enden, kampflos, wenn du deine ${turnMinutes} Minuten verstreichen lässt, oder wenn du auf „Aufgeben“ drückst. Überlegst du es dir, bevor der erste Song läuft, steigst du ohne Verlust aus: Ein Druck schließt den Raum, und niemandem wird etwas angerechnet.`,
    chatQ: "Was ist im Chat verboten?",
    chatA:
      "Einen Songtipp zu geben ist streng verboten: Titel, Künstler, Album, Textzeile oder jeder andere Hinweis, der auf ein Stück zeigt. Ein Schiedsrichter liest den Chat daraufhin mit: Die ersten beiden Verstöße sind Verwarnungen, beim dritten wird das Konto eingeschränkt — keine Matches, kein Zuschauen. Gelöscht wird nichts; Konto und Punkte bleiben. Über bereits gespielte Songs zu reden, anzufeuern und zu scherzen ist erlaubt, ebenso Genre-Wünsche ohne konkretes Stück. Links sind gesperrt, Schimpfwörter werden maskiert, und wer dich stört, lässt sich melden oder blockieren. Der Chat wird gelöscht, wenn das Match endet.",
    spectatorQ: "Kann ich Matches anderer ansehen?",
    spectatorA:
      "Ja — wer den Raumcode hat, kann zusehen. Zuschauer sehen den Münzwurf, die Genre-Wahl und jeden Song, können aber nichts drücken. Die Spieler können das Match ganz für Zuschauer schließen oder es offen lassen und nur den Zuschauer-Chat abschalten. Zuschauer bekommen keine Punkte.",
    stillStuck: "Antwort nicht gefunden?",
    stillStuckLink: "Schreib uns",
  },

  contactPage: {
    title: "Kontakt",
    intro: "Etwas kaputt, eine Idee, oder einfach nur Hallo? Schreib uns — wir lesen mit.",
    nameLabel: "Dein Name",
    emailLabel: "Deine E-Mail-Adresse",
    emailHint: "Damit wir antworten können.",
    subjectLabel: "Betreff",
    messageLabel: "Deine Nachricht",
    submit: "Senden",
    sending: "Wird gesendet…",
    successTitle: "Deine Nachricht ist angekommen.",
    successBody: "Danke. Wenn sie eine Antwort braucht, schreiben wir an die angegebene Adresse.",
    another: "Noch eine Nachricht schreiben",
    nameRequired: "Verrätst du uns deinen Namen?",
    emailInvalid: "Bitte gib eine gültige E-Mail-Adresse ein.",
    subjectRequired: "Gib einen kurzen Betreff an.",
    messageShort: "Deine Nachricht braucht mindestens 10 Zeichen.",
    messageLong: (max: number) => `Deine Nachricht darf höchstens ${max} Zeichen haben.`,
    failed: "Die Nachricht konnte nicht gesendet werden. Versuchst du es gleich noch einmal?",
  },

  accountNotice: {
    warningTitle: (count: number, limit: number) => `Verwarnung ${count} auf deinem Konto (bei ${limit} folgt die Sperre)`,
    warningBody: (limit: number) =>
      `Einen Songtitel, einen Künstler oder einen Hinweis im Chat zu nennen ist verboten. Beim ${limit}. Verstoß wird dein Konto eingeschränkt: keine Matches, kein Zuschauen. Deine Punkte und deine Historie bleiben.`,
    restrictedTitle: "Dein Konto ist eingeschränkt",
    restrictedBody:
      "Weil du im Chat wiederholt Songs verraten hast, kannst du keine Matches mehr spielen oder ansehen. Konto und Punkte bleiben bestehen. Hältst du das für falsch, schreib uns über das Kontaktformular.",
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
