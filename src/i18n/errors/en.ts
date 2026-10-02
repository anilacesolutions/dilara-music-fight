import type { Errors } from "./tr";

export const errors: Errors = {
  sessionExpired: "Your session has expired, please sign in again.",
  notAPlayer: "You're not a player in this match.",
  spectatorsBlocked: "The players have closed this match to spectators.",
  spectatorChatBlocked: "The players have switched off spectator chat; you can watch but not write.",
  noReviewOpen: "There is no decision waiting on a video check right now.",
  noReviewsLeft: "You have used your video check for this match.",
  reviewPending: "The video check is still running; wait for the outcome.",

  noSuchRoom: "No such room.",
  roomCreateFailed: "The room could not be created, please try again.",
  roomClosed: "This room is closed.",
  roomAlreadyClosed: "This room is already closed.",
  roomFull: "This room is full.",
  roomJustFilled: "Someone just took the last seat.",
  matchOver: "This match is over.",
  opponentNotJoined: "Your opponent hasn't joined yet.",

  noSetup: "This match was created without a coin toss.",
  matchAlreadyStarted: "The match has already started.",
  throwCoinFirst: "One of you has to toss the coin first.",
  coinFirst: "The coin has to be tossed first.",
  listenRatioNotAnOption: "That listening share is not one of the options.",
  genreFirst: "The match genre has to be settled first.",
  genreNotYours: "Your opponent picks the genre.",
  awaitingAnswer: "You're waiting for your opponent's answer.",
  genreNotAnOption: "That genre isn't among your options.",
  noProposal: "There's no genre on the table.",
  cannotAnswerOwn: "You can't answer your own proposal.",
  vetoUsed: "You've already used your refusal.",
  setupIncomplete: "The coin toss and the genre have to be settled first.",

  cannotLeaveAfterFirstSong: "You can't leave without a score once the first song has been played; you can give up instead.",
  matchStartedNoFreeExit: "The match has started, there's no free exit any more.",

  notYourTurn: "It's not your turn.",
  decideFirst: "Listen to your opponent's song and make your call first.",
  songAlreadyPlayed: "That song has already been played in this match.",
  nothingToDecide: "There's no song waiting on your call.",
  noRedOnSkip: "You can't show a red card on a song you skipped without listening.",
  listenFirst: (p: { percent: number; cost: number }) =>
    `You can't decide before hearing at least ${p.percent}% of the song. If you'd rather not wait, you can skip it for ${p.cost} points.`,
  noYellowLeft: "You have no yellow cards left.",
  noRedLeft: "You have no red cards left.",
  needMinSongs: (p: { min: number }) =>
    `To end the match you both need at least ${p.min} songs, and your song counts have to be level.`,

  stateChanged: "The match has moved on.",
  stateChangedRetry: "The match has moved on, please try again.",
  stateChangedRefresh: "The match has moved on, please refresh the page.",
  stateChangedRetrySong: "The match has moved on, refresh the page and try again.",

  chatClosed: "The chat closed when the match ended.",
  emptyMessage: "You can't send an empty message.",
  messageTooLong: (p: { max: number }) => `A message can be at most ${p.max} characters.`,
  noLinks: "Sharing links in the chat is not allowed.",
  tooFast: "Slow down — wait a second between messages.",
  tipWarned: (p: { count: number; limit: number }) =>
    `Giving away a song in the chat is not allowed. That is warning ${p.count}; at ${p.limit} your account is restricted.`,
  tipRestricted: "Your account has been restricted for giving away a song in the chat: no more matches and no more watching.",
  accountRestricted: "Your account is restricted: you cannot join or watch matches.",
  messageNotFound: "Message not found — the match may be over.",
  cannotReportSelf: "You can't report your own message.",
  cannotBlockSelf: "You can't block yourself.",

  invalidAvatar: "That avatar doesn't exist.",
  genreNotInList: "A genre outside the list was selected.",
  tooManyGenres: (p: { max: number }) => `You can pick at most ${p.max} genres.`,

  videoUnreachable: "The YouTube video couldn't be reached (it may be private or deleted).",
  invalidLink: "That's not a valid YouTube link.",
  noLiveStreams: "Live streams are not accepted.",
  durationUnreadable: "The length of the song couldn't be read, try another link.",
  trackTooLong: (p: { minutes: number }) => `Songs longer than ${p.minutes} minutes are not accepted.`,
  searchUnavailable: "Search is not working right now. Paste the song's link instead.",
  searchQuotaSpent: "We have used up today's searches. Paste the song's link instead.",

  refereeUnavailable: "The referee can't answer right now, try again in a few seconds.",
  refereeUnreadable: "The referee's ruling couldn't be read, please send the song again.",

  invalidRequest: "Invalid request.",
  serverProblem: "Something went wrong on our side.",
};
