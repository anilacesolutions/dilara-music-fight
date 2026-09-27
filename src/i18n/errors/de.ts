import type { Errors } from "./tr";

export const errors: Errors = {
  sessionExpired: "Deine Sitzung ist abgelaufen, bitte melde dich erneut an.",
  notAPlayer: "Du bist in diesem Match kein Spieler.",
  spectatorsBlocked: "Die Spieler haben dieses Match für Zuschauer geschlossen.",

  noSuchRoom: "Diesen Raum gibt es nicht.",
  roomCreateFailed: "Der Raum konnte nicht erstellt werden, versuch es noch einmal.",
  roomClosed: "Dieser Raum ist geschlossen.",
  roomAlreadyClosed: "Dieser Raum ist bereits geschlossen.",
  roomFull: "Dieser Raum ist voll.",
  roomJustFilled: "Den letzten Platz hat gerade jemand anderes genommen.",
  matchOver: "Dieses Match ist vorbei.",
  opponentNotJoined: "Dein Gegner ist noch nicht da.",

  noSetup: "Dieses Match wurde ohne Münzwurf erstellt.",
  matchAlreadyStarted: "Das Match hat bereits begonnen.",
  throwCoinFirst: "Einer von euch muss zuerst die Münze werfen.",
  coinFirst: "Zuerst muss die Münze geworfen werden.",
  genreNotYours: "Dein Gegner wählt das Genre.",
  awaitingAnswer: "Du wartest auf die Antwort deines Gegners.",
  genreNotAnOption: "Dieses Genre steht dir nicht zur Auswahl.",
  noProposal: "Es liegt kein Genrevorschlag vor.",
  cannotAnswerOwn: "Auf deinen eigenen Vorschlag kannst du nicht antworten.",
  vetoUsed: "Deine Ablehnung hast du schon verbraucht.",
  setupIncomplete: "Erst müssen Münzwurf und Genre geklärt sein.",

  cannotLeaveAfterFirstSong:
    "Nach dem ersten Song kannst du nicht mehr ohne Wertung aussteigen; du kannst aber aufgeben.",
  matchStartedNoFreeExit: "Das Match läuft, ein Ausstieg ohne Wertung ist nicht mehr möglich.",

  notYourTurn: "Du bist nicht am Zug.",
  decideFirst: "Hör erst den Song deines Gegners und triff deine Entscheidung.",
  songAlreadyPlayed: "Dieser Song lief in diesem Match schon.",
  nothingToDecide: "Es wartet kein Song auf deine Entscheidung.",
  noRedOnSkip: "Auf einen übersprungenen Song kannst du keine Rote Karte zeigen.",
  listenFirst: (p: { percent: number; cost: number }) =>
    `Du kannst nicht entscheiden, bevor du mindestens ${p.percent}% des Songs gehört hast. Wenn du nicht warten willst, kannst du ihn für ${p.cost} Punkte überspringen.`,
  noYellowLeft: "Du hast keine Gelben Karten mehr.",
  noRedLeft: "Du hast keine Roten Karten mehr.",
  needMinSongs: (p: { min: number }) =>
    `Zum Beenden braucht ihr beide mindestens ${p.min} Songs, und die Anzahl muss gleich sein.`,

  stateChanged: "Das Match ist weitergelaufen.",
  stateChangedRetry: "Das Match ist weitergelaufen, versuch es noch einmal.",
  stateChangedRefresh: "Das Match ist weitergelaufen, lade die Seite neu.",
  stateChangedRetrySong: "Das Match ist weitergelaufen, lade die Seite neu und versuch es noch einmal.",

  chatClosed: "Mit dem Ende des Matches wurde der Chat geschlossen.",
  emptyMessage: "Eine leere Nachricht kannst du nicht senden.",
  messageTooLong: (p: { max: number }) => `Eine Nachricht darf höchstens ${p.max} Zeichen haben.`,
  noLinks: "Links im Chat sind nicht erlaubt.",
  tooFast: "Langsamer — warte eine Sekunde zwischen den Nachrichten.",
  tipDeleted: "Dein Konto wurde dauerhaft gelöscht, weil du im Chat einen Song verraten hast.",
  messageNotFound: "Nachricht nicht gefunden — das Match ist vielleicht vorbei.",
  cannotReportSelf: "Deine eigene Nachricht kannst du nicht melden.",
  cannotBlockSelf: "Dich selbst kannst du nicht blockieren.",

  invalidAvatar: "Diesen Avatar gibt es nicht.",
  genreNotInList: "Es wurde ein Genre außerhalb der Liste gewählt.",
  tooManyGenres: (p: { max: number }) => `Du kannst höchstens ${p.max} Genres wählen.`,

  videoUnreachable: "Das YouTube-Video ist nicht erreichbar (vielleicht privat oder gelöscht).",
  invalidLink: "Das ist kein gültiger YouTube-Link.",
  noLiveStreams: "Livestreams werden nicht angenommen.",
  durationUnreadable: "Die Länge des Songs war nicht lesbar, versuch einen anderen Link.",
  trackTooLong: (p: { minutes: number }) => `Songs über ${p.minutes} Minuten werden nicht angenommen.`,

  refereeUnavailable: "Der Schiedsrichter antwortet gerade nicht, versuch es in ein paar Sekunden noch einmal.",
  refereeUnreadable: "Das Urteil des Schiedsrichters war nicht lesbar, schick den Song noch einmal.",

  invalidRequest: "Ungültige Anfrage.",
  serverProblem: "Auf unserer Seite ist etwas schiefgelaufen.",
};
