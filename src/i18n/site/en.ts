import type { Site } from "./tr";

export const site: Site = {
  meta: {
    signup: "Sign Up",
    login: "Sign In",
    lobby: "Lobby",
    coinPreview: "Coin preview",
    tagline: "Fight with your songs. Take turns, and whoever misses the format loses points.",
  },

  footer: {
    help: "Help",
    contact: "Contact",
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
        body: "Did your opponent's song break the format? Pull a yellow or a red card. If the referee agrees, a red ends the match.",
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
            text: `Each player gets ${p.yellow} yellow and ${p.red} red cards per match. A card stands only if the referee agrees: a red ends the match there and then and the player who got it loses, and a second yellow does the same. If the referee disagrees, the card is burnt and nothing changes.`,
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
            text: "Naming a song, an artist, posting a link or dropping any hint in the chat is forbidden. The referee reads the chat too: two warnings, and the third violation restricts the account — no matches and no watching.",
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
        body: `You get ${p.yellow} yellow and ${p.red} red cards per match. A red that stands, or a second yellow, ends the match; if the referee disagrees, the card is wasted.`,
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
        body: "Got a room code? Watch the match live. Tipping anyone off in the chat costs you a warning, and three of those close your account off.",
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
    nicknameShort: "A nickname needs at least 3 characters.",
    nicknameLong: "A nickname can be at most 20 characters.",
    nicknameChars: (chars: string) =>
      `These are not allowed in a nickname: ${chars}. Letters of any alphabet, digits and underscores are fine.`,
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

  help: {
    title: "Help",
    intro: "Everything you might be wondering. Tap a question to open the answer.",
    playQ: "How is Music Fight played?",
    playA:
      "Two players take turns sending songs from YouTube. Every song you send has to sit close to the format of your opponent's last one: genre, energy, era, production. The referee rules on each song, either it fits or it doesn't. Fit and you gain points, miss and you lose them. Over a match the music drifts somewhere neither of you planned, and that is the fun of it.",
    signupQ: "How do I sign up?",
    signupA: (minGenres: number, minAge: number) =>
      `Your name, a nickname, an e-mail, a date of birth and a password are enough. You have to be over ${minAge} to use the site. You also pick at least ${minGenres} genres: the opening genre of a match comes from what the two players have in common, so that list cannot be empty. Only your nickname is shown on the site; your real name and e-mail are never shown to anyone.`,
    startQ: "How do I start a match?",
    startA:
      "Open a new match from the lobby and you get a room code. Send the code to a friend, who types it into the box in the lobby and joins. Whoever arrives can take the second seat or just watch.",
    coinQ: "How does the coin toss work?",
    coinA: (seconds: number) =>
      `Once both players are in the room a "Toss the Coin" button appears; whoever presses first throws it, and one of you pressing is enough. While the coin spins, heads and tails appear in front of both players; whoever is quicker takes a side and the other side falls to their opponent. Whoever holds the side it lands on sends the opening song. The landing is drawn on the server the moment the coin goes up, but it is not sent to anyone until a side has been called, so nobody can pick a side already knowing the result. If nobody presses within ${seconds} seconds, the server throws it.`,
    genreQ: "Who decides the genre of the match?",
    genreA:
      "Whoever loses the toss decides. They are shown a list built from the genres both profiles have in common; when there is little overlap the list is topped up to five with widely known genres. Their opponent may refuse the choice once, and the second choice is final. The genre only binds the opening song; every later song is judged against the one before it.",
    sendQ: "How do I send a song?",
    sendA: (maxMinutes: number) =>
      `Paste the YouTube link into the box and press "Check". You will see the title, the channel and the length; if that is the right song, send it. Songs longer than ${maxMinutes} minutes and live streams are refused. The same song cannot be played twice in one match.`,
    listenQ: "Why do I have to listen with the sound on?",
    listenA: (percent: number) =>
      `Before you can rule on your opponent's song you have to hear at least ${percent}% of it. The counter only moves while the song is playing and the sound is on; turning it down and waiting does not fill the bar. Skipping ahead does not help either, because the counter tracks the seconds you actually heard, and hearing the same part twice does not count twice. The reason is simple: both your card decision and the referee's ruling assume you really listened.`,
    skipQ: "Can I answer without listening?",
    skipA: (cost: number) =>
      `You can, at a price: ${cost} points. You may still show a yellow card on a song you skipped, but not a red one — you cannot knock your opponent out of a match with a song you never heard. There is no limit on skipping, and everyone can see that you did.`,
    cardsQ: "How do yellow and red cards work?",
    cardsA: (yellows: number, yellowPenalty: number, redPenalty: number) =>
      `If your opponent's song strikes you as off-format, you show a card: yellow means "doesn't quite fit", red means "nowhere near". A card only stands if the referee also finds the song off-format; if the referee accepts the song, your card is wasted and nothing changes. A yellow that stands costs your opponent ${yellowPenalty} points, a red ${redPenalty}. The points are not the real stake: as in football, a red card that stands ends the match there and then, and the player who received it loses. Two yellows that stand do the same. Each player gets ${yellows} yellows and one red per match.`,
    varQ: "What is VAR and how do I use it?",
    varA: (seconds: number) =>
      `Exactly as in football: the referee on the pitch decides quickly, VAR looks more closely. If your opponent showed you a card and the referee agreed with it, the card does not bite straight away — it comes to you first. You have ${seconds} seconds: accept the decision, or send it to VAR. A second referee then looks at the whole match, the songs before it and how close the subgenres really are, and its word is final. Overturned, the card is cancelled, your song counts as a fit, your score is corrected and the card goes back to your opponent. Upheld, the card stands. One check per match; if the time runs out, the card simply stands.`,
    refereeQ: "What does the referee do?",
    refereeA:
      "The referee is an AI. It works out the artist, the track and the genre from the title and the channel, then compares that either with the previous song or, on the opening move, with the agreed genre. It writes its ruling and the reasoning behind it. The reasoning is written in all three languages at once, because the same ruling is read by both players and every spectator. The ruling stays sealed until you have made your card decision, so nobody can peek first and play accordingly.",
    scoringQ: "How does scoring work?",
    scoringA: (match: number, mismatch: number, win: number, draw: number, minSongs: number) =>
      `A song the referee accepts is worth +${match}; one it rejects, ${mismatch}. The opening song scores the same way, because it too has a genre to live up to. Card penalties and skip penalties come on top. When the match ends the winner takes +${win}, or both take +${draw} on a draw — but those bonuses are only paid if both players sent at least ${minSongs} songs, so you cannot cut a match short and farm them. Everything you earn goes to your profile and the leaderboard.`,
    endQ: "How does a match end?",
    endA: (minSongs: number, turnMinutes: number) =>
      `Usually by agreement: once both players have sent at least ${minSongs} songs and the counts are level, both press "End Match" and the higher score wins. A match can also end on cards, by default if you let your ${turnMinutes}-minute turn run out, or if you press "Give Up". If you change your mind before the first song is played you can walk away at no cost: one press closes the room and nothing is written to anyone's record.`,
    chatQ: "What is not allowed in the chat?",
    chatA:
      "Giving away a song to play is strictly forbidden: a title, an artist, an album, a lyric or any other clue that points at a track. A referee reads the chat for this: the first two violations are warnings, and the third restricts the account — no matches and no watching. Nothing is deleted; the account and its points stay. Talking about songs already played, cheering and joking are fine, and so are genre requests that name no particular track. Links are blocked, profanity is masked, and you can report or block anyone who bothers you. The chat is deleted when the match ends.",
    spectatorQ: "Can I watch other people's matches?",
    spectatorA:
      "Yes — anyone with the room code can watch. Spectators see the coin toss, the genre pick and every song, but cannot press anything. Players may close the match to spectators entirely, or leave it open to watch while switching off spectator chat. Spectators earn no points.",
    stillStuck: "Didn't find your answer?",
    stillStuckLink: "Write to us",
  },

  contactPage: {
    title: "Contact",
    intro: "Something broken, an idea, or just saying hello? Write to us — we read it.",
    nameLabel: "Your name",
    emailLabel: "Your e-mail address",
    emailHint: "So we can write back.",
    subjectLabel: "Subject",
    messageLabel: "Your message",
    submit: "Send",
    sending: "Sending…",
    successTitle: "Your message reached us.",
    successBody: "Thank you. If it needs an answer, we will write to the address you gave.",
    another: "Write another message",
    nameRequired: "Could you give us your name?",
    emailInvalid: "Please enter a valid e-mail address.",
    subjectRequired: "Add a short subject.",
    messageShort: "Your message needs at least 10 characters.",
    messageLong: (max: number) => `Your message can be at most ${max} characters.`,
    failed: "The message could not be sent. Could you try again in a moment?",
  },

  accountNotice: {
    warningTitle: (count: number, limit: number) => `Warning ${count} on your account (${limit} means a restriction)`,
    warningBody: (limit: number) =>
      `Naming a song, an artist or dropping a hint in the chat is not allowed. At violation ${limit} your account is restricted: no matches and no watching. Your points and history stay as they are.`,
    restrictedTitle: "Your account is restricted",
    restrictedBody:
      "After repeatedly giving away songs in the chat you can no longer join or watch matches. Your account and points remain. If you think this is wrong, write to us through the contact form.",
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
