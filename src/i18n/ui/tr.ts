/**
 * Strings used by Client Components. Turkish is the source of truth: `en` and
 * `de` are typed as `typeof ui`, so a missing key or a changed parameter list
 * fails the build instead of shipping a blank label.
 */

export const ui = {
  common: {
    close: "Kapat",
    cancel: "Vazgeç",
    send: "Gönder",
    somethingWrong: "Bir şeyler ters gitti.",
    sessionExpired: "Oturumun kapanmış, tekrar giriş yap.",
    you: "sen",
    opponent: "Rakibin",
    aPlayer: "Bir oyuncu",
    player: "Oyuncu",
    backToLobby: "Lobiye dön",
  },

  header: {
    home: "Music Fight ana sayfa",
    help: "Yardım",
    login: "Giriş Yap",
    signup: "Üye Ol",
    lobby: "Lobi",
    logout: "Çıkış",
  },

  language: {
    label: "Dil",
    change: "Dili değiştir",
  },

  signup: {
    firstName: "Ad",
    lastName: "Soyad",
    nickname: "Nickname",
    nicknameHint: "Sitede sadece bu görünür. 3-20 karakter: harf, rakam ve _",
    email: "E-posta",
    birthDate: "Doğum tarihi",
    birthDateHint: (age: number) => `Üyelik için en az ${age} yaşında olmalısın.`,
    genres: "Dinlediğin türler",
    genresCount: (picked: number, max: number, min: number) => `${picked}/${max} · en az ${min}`,
    genresHint: "Maçın açılış türü, iki oyuncunun ortak türlerinden seçilir. Sonradan değiştirebilirsin.",
    password: "Şifre",
    passwordHint: "En az 8 karakter, harf ve rakam.",
    passwordConfirm: "Şifre (tekrar)",
    showPassword: "Şifreyi göster",
    submit: "Üye Ol",
    submitting: "Hesabın oluşturuluyor…",
    haveAccount: "Zaten hesabın var mı?",
    loginLink: "Giriş yap",
  },

  login: {
    nickname: "Nickname",
    password: "Şifre",
    submit: "Giriş Yap",
    submitting: "Giriş yapılıyor…",
    noAccount: "Hesabın yok mu?",
    signupLink: "Üye ol",
  },

  joinByCode: {
    label: "Oda kodun mu var?",
    hint: "Koltuk boşsa rakip olarak katılır ya da izlersin; maç başladıysa izlersin.",
    submit: "Odaya Git →",
  },

  startDialog: {
    open: "Music Fight Başlat",
    eyebrow: "Yeni maç",
    title: "Nasıl kapışmak istersin?",
    soon: "Yakında",
    creating: "Oda kuruluyor…",
    createFailed: "Oda kurulamadı.",
    friendTitle: "Arkadaşını Davet Et",
    friendBody:
      "Oda kur, linki ya da oda kodunu paylaş. Arkadaşın katılınca yazı tura atılır, türü belirlersiniz ve maç başlar.",
    aiTitle: "AI ile Kapış",
    aiBody: "Arkadaşın yok mu? Yapay zekâya karşı şarkı at. Normal maçın yarısı kadar puan kazanırsın.",
    watchTitle: "İzleyici Ol",
    watchBody: "Oda koduyla istediğin maçı canlı izle, sohbete katıl. İzleyiciler puan almaz. Yakında: yapay zekâ maçları.",
    watchCodeLabel: "İzlemek istediğin maçın oda kodu",
    watchSubmit: "👀 İzle",
  },

  profileEditor: {
    title: "Profilini düzenle",
    avatar: "Avatar",
    genres: (picked: number, max: number) => `Müzik türleri · ${picked}/${max}`,
    save: "Kaydet",
    saving: "Kaydediliyor…",
  },

  stage: {
    loading: "Oynatıcı yükleniyor…",
    enough: "✓ Yeterince dinledin",
    heard: (percent: number) => `🎧 Dinlenen: %${percent}`,
    required: (heard: string, needed: string) => `${heard} / ${needed} gerekli`,
    requiredMark: "Gereken dinleme",
    muted: "🔇 Ses kapalıyken geçen süre sayılmıyor.",
    pressPlay: "▶ Şarkıyı başlat — sayaç ancak çalarken ilerler.",
    rules: "İleri sarılan kısımlar sayılmaz; aynı yeri tekrar dinlemek de süreyi artırmaz.",
  },

  coin: {
    eyebrow: "Maç açılışı",
    title: "Kim başlıyor?",
    throw: "🪙 Coin Fırlat",
    yazi: "Yazı",
    tura: "Tura",
    idleMine: "Parayı havaya atma sırası yok: hızlı olan basar, bir kişinin basması yeterli.",
    idleWatching: (a: string, b: string) => `${a} ve ${b} yazı turayı bekliyor.`,
    spinningMine: "Coin havada! Hızlı davranan tarafı kapar, diğerine öteki taraf düşer.",
    spinningWatching: "Coin havada, oyuncular yazı tura seçiyor.",
    falling: "Coin düşüyor…",
    resultMine: (side: string) => `${side} geldi. Açılış şarkısı senden!`,
    resultOther: (side: string, name: string) => `${side} geldi. ${name} açılış şarkısını atıyor.`,
    sidesMine: (mine: string, name: string, theirs: string) => `Sen: ${mine} · ${name}: ${theirs}`,
    sidesWatching: (a: string, aSide: string, b: string, bSide: string) => `${a}: ${aSide} · ${b}: ${bSide}`,
    pickedAuto: " — süre dolduğu için seçimi sistem yaptı.",
    pickedByMe: " — seçimi sen yaptın.",
    pickedByOther: (name: string) => ` — seçimi ${name} yaptı.`,
    deadline: (seconds: number) => `${seconds} sn içinde kimse basmazsa yazı turayı sistem atar.`,
  },

  genre: {
    eyebrow: "Maçın türü",
    proposedToMe: (name: string, label: string) => `${name} "${label}" diyor`,
    proposedTitle: (label: string) => `${label} teklif edildi`,
    myTurnTitle: "Maçın türünü sen seçiyorsun",
    theirTurnTitle: (name: string) => `${name} maçın türünü seçiyor`,
    answerNote: "Kabul edersen maç başlar. Beğenmediysen bir kez reddedebilirsin; ikinci seçim kesin olur.",
    waitingNote: (name: string) =>
      `${name} cevabını bekliyorsun. Reddederse listeden bir daha seçeceksin ve o seçim kesin olacak.`,
    watchingProposal: (name: string) => `${name} kabul ya da ret diyecek.`,
    pickAfterVeto: "Veto edildi. Bu seçim kesin, rakibin bir daha reddedemez.",
    pickNote: (name: string) => `Coin'i kaybettin ama sahayı sen seçiyorsun. ${name} açılış şarkısını bu türden atmak zorunda.`,
    watchingAfterVeto: "İlk teklif reddedildi. Yeni seçim doğrudan kesinleşecek.",
    watchingNote: "Seçenekler ikinizin profilindeki ortak türlerden geliyor.",
    accept: "✓ Kabul Et",
    veto: "✕ Başka Tür",
    scoring: (match: number, mismatch: number) =>
      `Açılış şarkısı bu türe uyarsa +${match}, uymazsa ${mismatch}. Sonraki şarkılar yine bir öncekinin formatına göre değerlendirilir.`,
    deadline: (seconds: number) => ` · ${seconds} sn içinde seçim yapılmazsa türü sistem belirler.`,
    startingSoon: (label: string) => `Maç ${label} türünde başlıyor`,
  },

  send: {
    yourTurn: "● Sıra sende",
    openingTitle: "Açılış şarkısını seç",
    replyTitle: "Cevap şarkını seç",
    openingWithGenreBefore: "Anlaştığınız tür ",
    openingWithGenreAfter: (match: number, mismatch: number) =>
      `. Açılış şarkın bu türe uyarsa +${match}, uymazsa ${mismatch}. Rakibin de senin şarkının formatına cevap verecek.`,
    openingNoGenre: "Maçın formatını sen belirliyorsun. Rakibin bu dünyadan bir şarkıyla cevap vermek zorunda.",
    reply: (match: number, mismatch: number) =>
      `Rakibinin şarkısının formatına yakın bir şarkı seç. Uyarsa +${match}, alakasızsa ${mismatch}.`,
    urlLabel: "YouTube linki",
    clear: "Linki temizle",
    check: "Kontrol Et",
    checking: "Kontrol ediliyor…",
    checkFailed: "Link kontrol edilemedi.",
    submit: "🎵 Şarkıyı At",
    submitting: "Hakeme gidiyor…",
    limits: (minutes: number) =>
      `${minutes} dakikadan uzun şarkılar ve canlı yayınlar kabul edilmez. Aynı şarkı bir maçta iki kez çalınamaz.`,
  },

  card: {
    eyebrow: "Kart kararı",
    skipping: (cost: number) =>
      `⏭ Dinlemeden atlıyorsun: ${cost} puanın düşecek. Sarı kart gösterebilirsin, kırmızı kart gösteremezsin.`,
    needListen: (percent: number, cost: number) =>
      `🔒 Önce şarkının en az %${percent}'ini dinle ya da ${cost} puan karşılığında atla.`,
    preparing: (seconds: number) => `⏳ Hakem masası hazırlanıyor… ${seconds} sn`,
    ready: "Kararın ne? Hakemin kararı, sen seçtiğin an açılacak.",
    yellow: "Sarı Kart",
    yellowMeaning: "Tam oturmadı",
    red: "Kırmızı Kart",
    redMeaning: "Kesinlikle alakasız",
    redSkipMeaning: "Dinlemeden olmaz",
    none: "Kart Yok",
    noneMeaning: "Format tamam",
    left: (left: number, penalty: number) => `${left} kaldı · ${penalty}`,
    skipButton: (cost: number) => `⏭ Dinlemeden Atla (−${cost} puan)`,
    skipCancel: "Vazgeç, dinlemeye devam et",
    footnote:
      "Hakem de şarkıyı uyumsuz bulursa kart geçerli sayılır: rakibin puan cezası yer ve kart siciline işlenir. Kırmızıysa maç orada biter, rakibin yenik sayılır; ikinci sarıda da aynısı olur. Hakem şarkıyı uyumlu bulursa kartın boşa gider.",
  },

  var: {
    eyebrow: "VAR incelemesi",
    yellow: "sarı kart",
    red: "kırmızı kart",
    title: (card: string, name: string) => `${name} için ${card} — VAR'a gidilsin mi?`,
    yoursBody: (left: number): string =>
      left > 0
        ? "Karar sende: kabul edersen kart geçerli sayılır, VAR'a gidersen ikinci bir hakem maçın tamamına bakıp son kararı verir. Maçta bir kez kullanabilirsin."
        : "VAR hakkını bu maçta kullandın, bu kart geçerli sayılacak.",
    theirsBody: (name: string) => `${name} kararı kabul etmek ya da VAR'a gitmek için düşünüyor.`,
    countdown: (seconds: number) => `${seconds} saniye içinde karar verilmezse kart geçerli sayılır.`,
    request: "📺 VAR'a git",
    accept: "Kararı kabul et",
    checking: "VAR inceliyor…",
    upheldTitle: "VAR: karar değişmedi",
    overturnedTitle: "VAR: karar bozuldu",
    upheldNote: (card: string) => `${card} geçerli.`,
    overturnedNote: (card: string) => `${card} iptal edildi, şarkı formata uygun sayıldı.`,
    noAnswer: "Süre doldu, kimse VAR'a gitmedi.",
    noReason: "Karar kabul edildi.",
  },

  consent: {
    title: "Ölçüm çerezlerine izin veriyor musun?",
    body: "Sitenin nasıl kullanıldığını anlamak için Mixpanel ile hangi sayfaların açıldığını ve maç adımlarının nasıl ilerlediğini ölçmek istiyoruz. Adın, e-postan ve nickname'in gönderilmez. İstemiyorum dersen ölçüm aracı hiç yüklenmez; oyun her iki durumda da aynı çalışır.",
    accept: "Kabul et",
    decline: "İstemiyorum",
    currentlyGranted: "Şu anki tercihin: izin verildi.",
    currentlyDenied: "Şu anki tercihin: izin verilmedi.",
  },

  chat: {
    title: "Sohbet",
    who: "oyuncular + izleyiciler",
    empty: "İlk mesajı sen yaz.",
    closed: "Sohbet kapandı.",
    placeholder: "Mesaj yaz…",
    mutedSpectator: "Oyuncular izleyici sohbetini kapattı. Mesajları okuyabilirsin ama yazamazsın.",
    inputLabel: "Sohbet mesajı",
    send: "Gönder",
    quickSend: (emoji: string) => `${emoji} gönder`,
    options: (nickname: string) => `${nickname} mesajı için seçenekler`,
    report: "🚩 Şikayet et",
    block: "🚫 Engelle",
    reported: (nickname: string) => `${nickname} şikayet edildi. İnceleyeceğiz.`,
    blocked: (nickname: string) => `${nickname} engellendi. Mesajlarını artık görmeyeceksin.`,
    noLinks: "Sohbette link paylaşmak yasak.",
    sendFailed: "Mesaj gönderilemedi.",
    reportFailed: "Şikayet gönderilemedi.",
    blockFailed: "Engellenemedi.",
    warning:
      "Sohbette şarkı adı, sanatçı ya da ipucu vermek yasak. Hakem sohbeti de denetler; iki uyarıdan sonra hesabın kısıtlanır.",
  },

  controls: {
    endMatch: "🏁 Maçı Bitir",
    withdrawEnd: "Bitirme isteğini geri al",
    needEqual: (min: number, mine: number, name: string, theirs: number) =>
      `İkinizin de en az ${min} şarkısı olmalı ve sayılar eşit olmalı. Şu an: sen ${mine} · ${name} ${theirs}.`,
    waitingForThem: (name: string) => `${name} de basarsa maç biter. O basana kadar maç sürüyor, sıran gelince süren işler.`,
    theyWant: (name: string) => `${name} maçı bitirmek istiyor. Sen de basarsan biter.`,
    bothMustPress: "İkiniz de basınca maç biter. İsterseniz uzatmaya devam edebilirsiniz.",
    surrender: "🏳️ Pes Et",
    surrenderWarning: "Pes edersen maçı kaybedersin.",
    surrenderBonus: (name: string, bonus: number) => `${name} +${bonus} galibiyet bonusu alır.`,
    surrenderNoBonus: (min: number) => `İkiniz de ${min} şarkıya ulaşmadığınız için bonus verilmez.`,
    surrenderConfirm: "Evet, pes et",
    leave: "🚪 Maçtan Ayrıl",
    leaveHint: "Türde anlaşamadınız mı? İlk şarkı atılana kadar puan kaybetmeden çıkabilirsin.",
    leaveQuestion: "Maçtan ayrılmak istiyor musun?",
    leaveNote: "Henüz şarkı atılmadı: kimseye puan yazılmaz, oda kapanır.",
    leaveConfirm: "Evet, ayrıl",
    spectatorsOn: "İzleyicilere açık",
    spectatorsHint: "Oda koduyla herkes maçı izleyebilir.",
    spectatorChatOn: "İzleyiciler mesaj atabilsin",
    spectatorChatHint: "Kapatırsan izleyiciler sohbeti okur ama yazamaz.",
  },

  clock: {
    mineLabel: "Hamle süren",
    theirLabel: (name: string) => `${name} için kalan süre`,
    includesListening: "(dinleme süresi dahil)",
    mineOver: "Süren doldu",
    theirOver: "Süre doldu",
  },

  history: {
    title: "Şarkılar",
    empty: "Henüz şarkı atılmadı.",
    sealed: "🔒 hakem kararı mühürlü",
    skipped: "⏭ atlandı",
    skippedTitle: (penalty: number) => `Rakibi bu şarkıyı dinlemeden atladı (${penalty})`,
    yellowTitle: "Sarı kart",
    redTitle: "Kırmızı kart",
    varOpen: "VAR bekleniyor",
    varUpheld: "VAR: karar değişmedi",
    varOverturned: "VAR: karar bozuldu",
    varAccepted: "Kart kabul edildi, VAR'a gidilmedi",
    varExpired: "Süre doldu, VAR'a gidilmedi",
    varWhy: "neden?",
  },

  verdict: {
    mismatch: "Hakem: formata uymuyor",
    match: "Hakem: formata uyuyor",
    cardUpheld: (name: string, penalty: number) => `${name} haklı çıktı: ${penalty} ek ceza`,
    cardWasted: (name: string) => `${name} boşa gitti, hakem şarkıyı uyumlu buldu`,
    noCard: "Kart gösterilmedi",
    yellow: "Sarı kart",
    red: "Kırmızı kart",
    skipped: (penalty: number) => `⏭ Şarkı dinlenmeden atlandı; atlayan oyuncuya ${penalty} yazıldı.`,
    theirResult: (name: string) => `${name} şarkısının sonucu`,
    myResult: "Senin şarkının sonucu",
  },

  result: {
    over: "Maç bitti",
    cancelledEyebrow: "Maç kurulamadı",
    cancelled: "Maç iptal edildi",
    draw: "Berabere!",
    wonWatching: (name: string) => `${name} kazandı`,
    won: "Kazandın! 🏆",
    lost: "Bu sefer olmadı",
    reasonCancelled: "Tek bir şarkı atılmadan maçtan çıkıldı.",
    reasonAgreement: "İki oyuncu da maçı bitirmeye karar verdi.",
    reasonSurrenderMine: "Pes ettin.",
    reasonSurrenderTheirs: (name: string) => `${name} pes etti.`,
    reasonTimeoutMine: "Süren içinde şarkı göndermediğin için maç hükmen bitti.",
    reasonTimeoutTheirs: (name: string) => `${name} süresi içinde şarkı göndermedi, hükmen galibiyet.`,
    reasonCardsMine: "Kartların doldu, oyun dışı kaldın ve maç orada bitti.",
    reasonCardsTheirs: (name: string) => `${name} kart sınırını doldurup oyun dışı kaldı, maç orada bitti.`,
    reasonViolation: (name: string) => `${name} kuralları çiğnediği için maçtan çıkarıldı.`,
    bonusCancelled: "Hiç kimseye puan yazılmadı; iki oyuncunun da toplamı olduğu gibi kaldı.",
    bonusNone: (min: number) => `Bonus yok: iki oyuncu da en az ${min} şarkı atmadan maç bitti.`,
    bonusDraw: (bonus: number) => `İkisine de +${bonus} beraberlik bonusu yazıldı.`,
    bonusWon: (bonus: number) => `+${bonus} galibiyet bonusu hesabına yazıldı.`,
    bonusTheirs: (name: string, bonus: number) => `${name} +${bonus} galibiyet bonusu aldı.`,
    songCount: (count: number) => `${count} şarkı çalındı`,
    withGenre: (label: string) => ` · açılış türü: ${label}`,
    newMatch: "Yeni Maç",
    backToLobby: "Lobiye Dön",
    leaderboard: "Liderlik Tablosu",
  },

  waiting: {
    eyebrow: "Oda kuruldu",
    title: "Rakibini çağır",
    body: "Linki ya da oda kodunu gönder. Katıldığı an yazı tura atılır, maçın türü belirlenir ve maç başlar. İzleyiciler de aynı kodla maçı izleyebilir.",
    roomCode: "Oda kodu",
    copy: "Kopyala",
    copied: "Kopyalandı ✓",
    inviteLink: "Davet linki",
    copyLink: "Linki Kopyala",
    waitingForOpponent: "● Rakip bekleniyor…",
  },

  spectator: {
    badge: "İzleyici modu",
    waitingTitle: "Maç başlamayı bekliyor",
    waitingBody: (host: string) => `${host} rakibini bekliyor. Maç başladığında şarkıları buradan canlı izleyeceksin.`,
    nowPlaying: (sender: string, listener: string) => `${sender} attı · ${listener} dinliyor`,
    choosing: (name: string) => `${name} şarkısını seçiyor…`,
    choosingOpening: (name: string) => `${name} açılış şarkısını seçiyor…`,
    willPlay: "Şarkı gelince burada çalmaya başlayacak.",
    openingGenre: (label: string) => `Açılış şarkısı ${label} türünden olmak zorunda.`,
    count: (count: number) => `👀 ${count} izleyici`,
    closed: "🔒 İzleyicilere kapalı",
  },

  join: {
    title: (name: string) => `${name} bir rakip bekliyor`,
    body: "Rakip olarak katılırsan önce yazı tura atılıp maçın türü belirlenir, sonra maç başlar. Sadece izlemek istiyorsan koltuk boş kalır.",
    join: "🥊 Maça Katıl",
    joining: "Katılıyorsun…",
    watch: "👀 İzle",
    closed: "Bu maç izleyicilere kapalı.",
  },

  opponent: {
    turn: (name: string) => `Sıra rakipte · ${name}`,
    listening: "🎧 Şarkını dinliyor…",
    listeningNote: "Tahmini dinleme süresi. Dinleme bitince kart kararını verecek, sonra hakemin kararı açılacak.",
    choosing: (name: string) => `${name} şarkısını seçiyor…`,
    choosingNote: "Şarkı gelince dinlemeye başlayabileceksin.",
    theyPlayed: (sender: string) => `${sender} bu şarkıyı attı`,
  },

  room: {
    back: "← Lobi",
    expiredTitle: "Bu oda kapandı",
    expiredBody: (minutes: number) => `${minutes} dakika içinde rakip gelmediği için oda kapatıldı.`,
    newMatch: "Yeni Maç Kur",
    standInTitle: "⚠ Hakem test modunda",
    standInBody:
      "Şu an şarkıları gerçek hakem değil, sadece başlıklara bakan bir yedek değerlendiriyor. Kararları ve VAR sonuçları güvenilir değil; puanları ciddiye alma.",
  },

  scoreboard: {
    waitingForOpponent: "Rakip bekleniyor…",
    onTurn: "● sırada",
    wantsToEnd: "bitirmek istiyor ✓",
    bookedYellow: (count: number, limit: number) =>
      `Yediği sarı kart: ${count}/${limit} — ${limit} sarıda maç biter`,
    bookedRed: (count: number) => `Yediği kırmızı kart: ${count}/1 — kırmızıda maç biter`,
  },

  leaderboard: {
    empty: "Henüz kimse yok — ilk sen ol",
  },

  preview: {
    live: "canlı örnek",
    played: (name: string) => `${name} attı`,
    opening: "Hakem: tür tuttu",
    match: "Hakem: uyumlu",
    mismatch: "Hakem: uyumsuz",
  },
};

/** The shape every other language must match, parameters included. */
export type Ui = typeof ui;
