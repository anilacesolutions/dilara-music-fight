import type { Site } from "./tr";

export const site: Site = {
  meta: {
    signup: "Sign Up",
    login: "Sign In",
    lobby: "Lobby",
    kvkk: "Privacy Notice",
    coinPreview: "Coin preview",
    tagline: "Fight with your songs. Take turns, and whoever misses the format loses points.",
  },

  footer: {
    privacy: "Privacy Notice",
  },

  notFound: {
    title: "This page has left the stage.",
    body: "The room, profile or page you were looking for isn't here.",
    home: "Back to the home page",
  },

  landing: {
    heroEyebrow: "Musical duel · One on one",
    heroTitleTop: "Hit with your song.",
    heroTitleBottom: "Miss the format and you burn.",
    heroBody:
      "Music Fight is a game where two people take turns throwing YouTube songs at each other. If your opponent played Dream Theater, you have to answer from that same world. Come back with something unrelated and the referee won't forgive it.",
    toLobby: "Go to the Lobby →",
    signupNow: "Sign Up Now",
    login: "Sign In",
    chips: (percent: number) => [
      `🎧 ${percent}% listening rule`,
      "🟨🟥 Yellow and red cards",
      "⚖️ AI referee",
      "💬 Live chat",
      "👀 Spectator mode",
      "🏆 Daily, weekly, monthly leaders",
    ],

    whatEyebrow: "What is Music Fight?",
    whatTitle: "Where your taste in music is actually put to the test.",
    pillars: [
      {
        icon: "🎵",
        title: "Take turns",
        body: "Paste a YouTube link and your song takes the stage. Then it's your opponent's word.",
      },
      {
        icon: "🧭",
        title: "Hold the format",
        body: "The opening song has to match the genre you agreed on; every song after that has to sit close to the one before it in genre, energy and world. A song that fits scores, one that doesn't costs you.",
      },
      {
        icon: "🟥",
        title: "Show your card",
        body: "Did your opponent's song break the format? Pull a yellow or a red card. The referee has the last word.",
      },
    ],

    stepsEyebrow: "What happens after you sign up?",
    stepsTitle: "Five steps to the stage.",
    steps: (p: { minGenres: number; skipCost: number; minSongs: number; percent: number }) => [
      {
        title: "Set up your profile",
        body: `Pick an avatar and tick the genres you listen to (at least ${p.minGenres}). All anyone sees is your nickname.`,
      },
      {
        title: "Start a Music Fight",
        body: "Invite a friend with a link or a room code, or watch a live match with a code. Coming soon: fight the AI.",
      },
      {
        title: "Toss the coin, settle the genre",
        body: "Whoever is quicker tosses the coin and calls a side. Whoever holds the side that comes up opens the match; the one who loses picks the genre from what you both listen to.",
      },
      {
        title: "Listen, then decide",
        body: `You hear at least ${p.percent}% of your opponent's song and then make your call. If you'd rather not wait, you can skip it without listening for ${p.skipCost} points.`,
      },
      {
        title: "Play your song, take the points",
        body: `Once you've both played at least ${p.minSongs} songs you can press "End the Match" to finish. The winner takes a bonus and the points go to the leaderboard.`,
      },
    ],

    scoreEyebrow: "Points",
    scoreTitle: "Every song goes on the account.",
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
      { label: "Song that fits the format (opening included)", value: `+${p.match}`, tone: "text-mint" },
      { label: "Song that doesn't fit", value: `${p.mismatch}`, tone: "text-blaze" },
      { label: "Yellow card the referee upheld", value: `${p.yellow}`, tone: "text-sun" },
      { label: "Red card the referee upheld", value: `${p.red}`, tone: "text-blaze" },
      { label: "Skipping a song without listening (to the skipper)", value: `${p.skip}`, tone: "text-sun" },
      { label: "Winning the match", value: `+${p.win}`, tone: "text-mint" },
      { label: "A draw (to both of you)", value: `+${p.draw}`, tone: "text-volt-300" },
    ],
    scoreNote: (min: number) =>
      `Bonuses need at least ${min} songs from each of you. Spectators earn nothing.`,

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
        eyebrow: "Rules",
        title: "Short, and no bending them.",
        items: [
          {
            icon: "🪙",
            text: "A match opens with a coin toss: whoever is quicker throws it, whoever is quicker calls heads or tails, and the other side falls to their opponent. Whoever holds the side that comes up plays the opening song.",
          },
          {
            icon: "🎼",
            text: "The one who loses the toss picks the genre — the options come from the genres both profiles have in common. The winner may refuse that proposal once; the second pick is final. The opening song has to fit it.",
          },
          {
            icon: "🟨🟥",
            text: `Each player gets ${p.yellow} yellow and ${p.red} red cards per match. Yellow means "not quite right", red means "completely off". If the referee disagrees, the card is burnt and nothing changes.`,
          },
          {
            icon: "🎧",
            text: `You can't play a song or show a card before hearing at least ${p.percent}% of your opponent's.`,
          },
          {
            icon: "⏭️",
            text: `You may skip the listening if you like: each skip costs you ${p.skipCost} points, with no limit. You can still show a yellow card on a song you skipped, but never a red one.`,
          },
          {
            icon: "⏱️",
            text: `Songs longer than ${p.maxMinutes} minutes are rejected, and the same song can't be played twice in one match.`,
          },
          { icon: "🤖", text: `Matches against the AI pay ${p.aiPercent}% of the usual points.` },
          { icon: "🔞", text: `You must be at least ${p.minAge} to sign up.` },
        ],
      },
      {
        eyebrow: "How does a match end?",
        title: "Play on as long as you like, but no running away.",
        items: [
          {
            icon: "🏁",
            text: `Once you've both played at least ${p.minSongs} songs and your counts are level, the match ends when you both press "End the Match". There's no upper limit — carry on as long as you want.`,
          },
          {
            icon: "⏳",
            text: `When it's your turn you have ${p.turnMinutes} minutes to send your song (the clock starts after the listening time for your opponent's). Run out and your opponent wins by default.`,
          },
          { icon: "🏳️", text: "You can give up at any point; whoever gives up loses the match." },
          {
            icon: "🚶",
            text: "Couldn't agree on a genre? Either of you can leave without losing points until the first song is played. One of you leaving is enough, and nobody is scored.",
          },
          {
            icon: "🎁",
            text: `Win and draw bonuses are only paid if you both played at least ${p.minSongs} songs.`,
          },
          { icon: "🚪", text: `Rooms nobody joins within ${p.waitingMinutes} minutes close on their own.` },
        ],
      },
      {
        eyebrow: "Chat and spectators",
        title: "Anyone can watch, nobody can tip anyone off.",
        items: [
          {
            icon: "👀",
            text: "Any match can be watched live with its room code. The players can close a match to spectators whenever they like. Spectators earn nothing.",
          },
          { icon: "💬", text: "During a match players and spectators share one chat, text and emoji." },
          {
            icon: "⛔",
            text: "Naming a song, an artist, posting a link or dropping any hint in the chat is forbidden. The referee reads the chat too, and breaking this rule deletes the account permanently.",
          },
          { icon: "🧼", text: "Bad language is masked automatically. You can report or block anyone bothering you." },
          { icon: "🗑️", text: "Chat messages are deleted when the match ends." },
        ],
      },
    ],

    leaderEyebrow: "Leaderboard",
    leaderTitle: "Who's on top?",
    leaderNote: "Istanbul time: the day resets at midnight, the week on Monday, the month on the 1st.",
    dailyTitle: "Best of the day",
    dailySubtitle: "Points collected today",
    weeklyTitle: "Best of the week",
    weeklySubtitle: "Points collected this week",
    monthlyTitle: "Best of the month",
    monthlySubtitle: "Points collected this month",

    ctaTitle: "Ready to play your first song?",
    ctaBody: "Sign up, set up your profile, send a friend your room code. The rest is down to the songs.",
    ctaButton: "Sign Up and Fight",
  },

  lobbyPage: {
    eyebrow: "Lobby",
    welcome: "Welcome back,",
    points: (total: number) => `${total} points in total. Which world are you playing from today?`,
    banners: (p: { yellow: number; red: number; minSongs: number; turnMinutes: number }) => [
      {
        icon: "🪙",
        title: "A match opens with a toss",
        body: "Whoever is quicker throws the coin and calls a side. The winner opens, the loser picks the genre.",
        tone: "from-sun/15",
      },
      {
        icon: "🎯",
        title: "Don't burn your cards early",
        body: `You get ${p.yellow} yellow and ${p.red} red cards per match. If the referee disagrees, the card is wasted.`,
        tone: "from-flare-500/15",
      },
      {
        icon: "🏁",
        title: "How does a match end?",
        body: `Once you've both played at least ${p.minSongs} songs, press "End the Match". On your turn you have ${p.turnMinutes} minutes or you lose by default. Until the first song you can leave without a score.`,
        tone: "from-mint/15",
      },
      {
        icon: "👀",
        title: "Watch a match, join the chat",
        body: "Got a room code? Watch the match live. Tipping anyone off in the chat deletes your account.",
        tone: "from-pulse-500/15",
      },
      {
        icon: "🎨",
        title: "Make your profile yours",
        body: "Pick an avatar, add the genres you love. Let your opponents know who they're up against.",
        tone: "from-volt-500/20",
      },
    ],
    weeklyTitle: "Best of the week",
    weeklySubtitle: "Points collected this week",
  },

  signupPage: {
    eyebrow: "Join us",
    titleBefore: "You need ",
    titleAccent: "a name",
    titleAfter: " before you take the stage.",
    body: "Your real name and email are kept for your account only. In matches, on the leaderboard and on your profile, all anyone sees is your nickname.",
    formTitleMobile: "Sign Up",
    formTitle: "Create your account",
    formNote: "It takes a minute, then you sign in and start fighting.",
  },

  loginPage: {
    created: "Your account is ready! Sign in and start your first match.",
    needLogin: "You need to sign in to continue.",
    title: "Welcome back",
    note: "Sign in with your nickname and password.",
  },

  profilePage: {
    eyebrow: "Player",
    memberSince: (date: string) => `Member since ${date}`,
    totalPoints: "Total points",
    genresTitle: "Genres they love",
    noGenresOwner: "You haven't added any genres yet — pick some below.",
    noGenres: "No genres added yet.",
    blockedTitle: "People you've blocked",
    blockedNote: "You don't see these people's chat messages. Only you can see this list.",
    blockedEmpty: "You haven't blocked anyone.",
    unblock: "Unblock",
    saved: "Your profile has been updated.",
  },

  validation: {
    firstNameMin: "Your first name needs at least 2 characters.",
    firstNameMax: "Your first name can be at most 40 characters.",
    lastNameMin: "Your last name needs at least 2 characters.",
    lastNameMax: "Your last name can be at most 40 characters.",
    nickname: "3-20 characters; letters, digits and underscores.",
    email: "Enter a valid email address.",
    birthDateRequired: "Enter your date of birth.",
    birthDateInvalid: "Enter a valid date.",
    birthDateFuture: "A date of birth can't be in the future.",
    tooYoung: (age: number) => `You must be at least ${age} to join Music Fight.`,
    passwordMin: "The password needs at least 8 characters.",
    passwordMax: "The password can be at most 128 characters.",
    passwordLetter: "The password needs at least one letter.",
    passwordDigit: "The password needs at least one digit.",
    passwordMismatch: "The passwords don't match.",
    kvkk: "You need to accept the privacy notice to continue.",
    genreNotInList: "A genre outside the list was selected.",
    genresMin: (min: number) => `Pick at least ${min} genres.`,
    genresMax: (max: number) => `You can pick at most ${max} genres.`,
    emailTaken: "There's already an account with this email address.",
    nicknameTaken: "That nickname is taken, try another one.",
    loginMissing: "Enter your nickname and password.",
    loginWrong: "Wrong nickname or password.",
  },

  roomPage: {
    metaTitle: (code: string) => `Room ${code}`,
    closedNote: "If the players open the match again, you can watch it from here.",
    backToLobby: "Back to the lobby",
  },

  kvkk: {
    draftLabel: "Draft.",
    draftBody:
      "This text is a placeholder. Before going live it must be replaced with a real privacy notice prepared by your legal counsel.",
    title: "Privacy Notice",
    controllerTitle: "Data controller",
    controllerBody: "[Company name, address and contact details go here.]",
    dataTitle: "Personal data processed",
    data: [
      "Identity: first name, last name, date of birth",
      "Contact: email address",
      "Account: nickname, an irreversible hash of the password, avatar and genre preferences",
      "Game: matches played, song links sent, cards and points",
      "Chat: messages during a match (deleted when it ends) and a copy of reported messages kept for review",
      "Moderation: the nickname of accounts deleted for rule violations and the reason for deletion",
    ],
    purposeTitle: "Purposes of processing",
    purposeBody:
      "Creating an account, verifying the age limit, signing in, running matches, and calculating points and leaderboards. First name, last name, email and date of birth are never shown to other users.",
    rightsTitle: "Your rights",
    rightsBody: "To exercise your rights over your personal data, contact us through [contact channel].",
  },

  devCoin: {
    eyebrow: "Development preview",
    title: "Coin toss and genre pick",
    body: "Runs without a database; shows only the opening part of a match.",
    whoseEyes: "Whose eyes are you looking through?",
    restart: "↻ Restart",
    watchAgain: "Watch again",
    openingBy: (name: string) => name,
    openingLine: "The opening song goes to",
    fakeNote:
      "This page runs on fake data: in a real match the server draws the result and sends it to nobody until a side is called. Here you can press the buttons for both players.",
  },
};
