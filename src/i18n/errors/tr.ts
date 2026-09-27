/**
 * Everything the server can refuse a request with. GameError carries one of
 * these keys instead of a sentence, and the API boundary turns it into the
 * reader's language.
 */

export const errors = {
  // Session and access
  sessionExpired: "Oturumun kapanmış, tekrar giriş yap.",
  notAPlayer: "Bu maçın oyuncusu değilsin.",
  spectatorsBlocked: "Oyuncular bu maçı izleyicilere kapattı.",

  // Rooms
  noSuchRoom: "Böyle bir oda yok.",
  roomCreateFailed: "Oda kurulamadı, tekrar dene.",
  roomClosed: "Bu oda kapandı.",
  roomAlreadyClosed: "Bu oda zaten kapandı.",
  roomFull: "Bu oda dolu.",
  roomJustFilled: "Bu oda az önce doldu.",
  matchOver: "Bu maç bitti.",
  opponentNotJoined: "Rakip henüz katılmadı.",

  // Coin toss and genre
  noSetup: "Bu maç yazı tura olmadan kurulmuş.",
  matchAlreadyStarted: "Maç çoktan başladı.",
  throwCoinFirst: "Önce parayı havaya atmanız gerekiyor.",
  coinFirst: "Önce yazı tura atılmalı.",
  genreNotYours: "Türü rakibin seçiyor.",
  awaitingAnswer: "Rakibinin cevabını bekliyorsun.",
  genreNotAnOption: "Bu tür seçeneklerin arasında yok.",
  noProposal: "Ortada bir tür teklifi yok.",
  cannotAnswerOwn: "Kendi teklifine sen cevap veremezsin.",
  vetoUsed: "Veto hakkını zaten kullandın.",
  setupIncomplete: "Önce yazı tura ve tür seçimi tamamlanmalı.",

  // Leaving
  cannotLeaveAfterFirstSong: "İlk şarkı atıldıktan sonra maçtan puansız çıkamazsın; pes edebilirsin.",
  matchStartedNoFreeExit: "Maç başladı, artık puansız çıkılamaz.",

  // Turns and songs
  notYourTurn: "Sıra sende değil.",
  decideFirst: "Önce rakibinin şarkısını dinleyip kararını ver.",
  songAlreadyPlayed: "Bu şarkı bu maçta zaten çalındı.",
  nothingToDecide: "Karar verilecek bir şarkı yok.",
  noRedOnSkip: "Dinlemeden atladığın şarkıya kırmızı kart gösteremezsin.",
  listenFirst: (p: { percent: number; cost: number }) =>
    `Şarkının en az %${p.percent}'ini dinlemeden karar veremezsin. İstersen ${p.cost} puan karşılığında atlayabilirsin.`,
  noYellowLeft: "Sarı kart hakkın kalmadı.",
  noRedLeft: "Kırmızı kart hakkın kalmadı.",
  needMinSongs: (p: { min: number }) =>
    `Maçı bitirmek için ikinizin de en az ${p.min} şarkı atmış olması ve şarkı sayılarınızın eşit olması gerekiyor.`,

  // Races against another request
  stateChanged: "Maç durumu değişti.",
  stateChangedRetry: "Maç durumu değişti, tekrar dene.",
  stateChangedRefresh: "Maç durumu değişti, sayfayı yenile.",
  stateChangedRetrySong: "Maç durumu değişti, sayfayı yenileyip tekrar dene.",

  // Chat
  chatClosed: "Maç bittiği için sohbet kapandı.",
  emptyMessage: "Boş mesaj gönderilemez.",
  messageTooLong: (p: { max: number }) => `Mesaj en fazla ${p.max} karakter olabilir.`,
  noLinks: "Sohbette link paylaşmak yasak.",
  tooFast: "Biraz yavaş, mesajlar arasında bir saniye bekle.",
  tipDeleted: "Sohbette şarkı ipucu verdiğin için hesabın kalıcı olarak silindi.",
  messageNotFound: "Mesaj bulunamadı, maç bitmiş olabilir.",
  cannotReportSelf: "Kendi mesajını şikayet edemezsin.",
  cannotBlockSelf: "Kendini engelleyemezsin.",

  // Profile
  invalidAvatar: "Geçersiz avatar seçimi.",
  genreNotInList: "Listede olmayan bir tür seçildi.",
  tooManyGenres: (p: { max: number }) => `En fazla ${p.max} tür seçebilirsin.`,

  // YouTube
  videoUnreachable: "YouTube videosuna ulaşılamadı (gizli veya silinmiş olabilir).",
  invalidLink: "Geçerli bir YouTube linki değil.",
  noLiveStreams: "Canlı yayınlar kabul edilmiyor.",
  durationUnreadable: "Şarkının süresi okunamadı, başka bir link dene.",
  trackTooLong: (p: { minutes: number }) => `${p.minutes} dakikadan uzun şarkılar kabul edilmiyor.`,

  // Referee
  refereeUnavailable: "Hakem şu an cevap veremiyor, birkaç saniye sonra tekrar dene.",
  refereeUnreadable: "Hakemin kararı okunamadı, şarkıyı tekrar gönder.",

  // Fallbacks at the API boundary
  invalidRequest: "Geçersiz istek.",
  serverProblem: "Sunucu tarafında bir sorun çıktı.",
};

export type Errors = typeof errors;
