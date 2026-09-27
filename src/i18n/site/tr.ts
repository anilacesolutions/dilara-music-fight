/** Copy for server-rendered pages: landing, lobby, profile, auth pages, notices. */

interface RuleGroup {
  eyebrow: string;
  title: string;
  items: { icon: string; text: string }[];
}

export const site = {
  meta: {
    signup: "Üye Ol",
    login: "Giriş Yap",
    lobby: "Lobi",
    kvkk: "KVKK Aydınlatma Metni",
    coinPreview: "Coin önizleme",
    tagline: "Şarkınla kapış. Sırayla şarkı at, formatı tutturamayan puan kaybeder.",
  },

  footer: {
    privacy: "KVKK Aydınlatma Metni",
  },

  notFound: {
    title: "Bu sayfa sahneden inmiş.",
    body: "Aradığın oda, profil ya da sayfa bulunamadı.",
    home: "Ana sayfaya dön",
  },

  landing: {
    heroEyebrow: "Müzikal düello · Bire bir",
    heroTitleTop: "Şarkınla vur.",
    heroTitleBottom: "Formatı kaçıran yanar.",
    heroBody:
      "Music Fight, iki kişinin sırayla YouTube'dan şarkı atarak kapıştığı bir oyun. Rakibin Dream Theater attıysa sen de o dünyadan bir şarkıyla cevap vermelisin. Üstüne Tarkan atarsan hakem affetmez.",
    toLobby: "Lobiye Git →",
    signupNow: "Hemen Üye Ol",
    login: "Giriş Yap",
    chips: (percent: number) => [
      `🎧 %${percent} dinleme kuralı`,
      "🟨🟥 Sarı ve kırmızı kart",
      "⚖️ Yapay zekâ hakem",
      "💬 Canlı sohbet",
      "👀 İzleyici modu",
      "🏆 Günlük, haftalık, aylık liderler",
    ],

    whatEyebrow: "Music Fight nedir?",
    whatTitle: "Müzik zevkinin gerçekten sınandığı yer.",
    pillars: [
      {
        icon: "🎵",
        title: "Sırayla şarkı at",
        body: "YouTube linkini yapıştır, şarkın sahneye çıksın. Sonra söz rakibinde.",
      },
      {
        icon: "🧭",
        title: "Formatı koru",
        body: "Açılış şarkısı anlaştığınız türden olmalı; sonraki her şarkı bir öncekinin türüne, enerjisine ve dünyasına yakın. Uyan şarkı puan kazandırır, alakasız şarkı kaybettirir.",
      },
      {
        icon: "🟥",
        title: "Kartını göster",
        body: "Rakibinin şarkısı formatı bozdu mu? Sarı ya da kırmızı kart çıkar. Son sözü hakem söyler.",
      },
    ],

    stepsEyebrow: "Üye olunca ne yapıyorsun?",
    stepsTitle: "Beş adımda sahnedesin.",
    steps: (p: { minGenres: number; skipCost: number; minSongs: number; percent: number }) => [
      {
        title: "Profilini kur",
        body: `Avatarını seç, dinlediğin müzik türlerini işaretle (en az ${p.minGenres}). Sitede sadece nickname'in görünür.`,
      },
      {
        title: "Music Fight başlat",
        body: "Arkadaşını link ya da oda koduyla davet et, ya da bir oda koduyla canlı maç izle. Yakında: yapay zekâya karşı kapış.",
      },
      {
        title: "Yazı tura at, türü belirle",
        body: "Coin'i hızlı olan fırlatır, hızlı olan tarafı seçer. Gelen taraf kimdeyse maçı o açar; kaybeden ise maçın türünü ortak türlerinizden seçer.",
      },
      {
        title: "Dinle, karar ver",
        body: `Rakibinin şarkısının en az %${p.percent}'ini dinleyip kararını verirsin. Beklemek istemezsen ${p.skipCost} puan karşılığında dinlemeden atlayabilirsin.`,
      },
      {
        title: "Şarkını at, puanı topla",
        body: `İkiniz de en az ${p.minSongs}'er şarkı atınca «Maçı Bitir»e basıp bitirebilirsiniz. Kazanan bonus alır, puanlar liderlik tablosuna yazılır.`,
      },
    ],

    scoreEyebrow: "Puanlar",
    scoreTitle: "Her şarkı hesaba yazılır.",
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
      { label: "Formata uyan şarkı (açılış dahil)", value: `+${p.match}`, tone: "text-mint" },
      { label: "Formata uymayan şarkı", value: `${p.mismatch}`, tone: "text-blaze" },
      { label: "Hakemin haklı bulduğu sarı kart", value: `${p.yellow}`, tone: "text-sun" },
      { label: "Hakemin haklı bulduğu kırmızı kart", value: `${p.red}`, tone: "text-blaze" },
      { label: "Şarkıyı dinlemeden atlamak (atlayana)", value: `${p.skip}`, tone: "text-sun" },
      { label: "Maçı kazanmak", value: `+${p.win}`, tone: "text-mint" },
      { label: "Berabere biterse (ikinize de)", value: `+${p.draw}`, tone: "text-volt-300" },
    ],
    scoreNote: (min: number) =>
      `Bonuslar için ikinizin de en az ${min} şarkı atmış olması gerekir. İzleyiciler puan almaz.`,

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
    }): RuleGroup[] => [
      {
        eyebrow: "Kurallar",
        title: "Kısa ama tavizsiz.",
        items: [
          {
            icon: "🪙",
            text: "Maç yazı turayla başlar: coin'i hızlı olan fırlatır, yazı ya da turayı hızlı olan seçer, diğerine öteki taraf düşer. Gelen taraf kimdeyse açılış şarkısını o atar.",
          },
          {
            icon: "🎼",
            text: "Yazı turayı kaybeden maçın türünü seçer — seçenekler iki oyuncunun profilindeki ortak türlerden gelir. Kazanan bu teklifi bir kez reddedebilir; ikinci seçim kesindir. Açılış şarkısı bu türe uymak zorunda.",
          },
          {
            icon: "🟨🟥",
            text: `Maç başına her oyuncunun ${p.yellow} sarı ve ${p.red} kırmızı kartı var. Sarı «tam oturmadı», kırmızı «kesinlikle alakasız» demek. Hakem kartı haksız bulursa kart yanar, puan değişmez.`,
          },
          { icon: "🎧", text: `Rakibinin şarkısının en az %${p.percent}'ini dinlemeden şarkı atamaz, kart gösteremezsin.` },
          {
            icon: "⏭️",
            text: `İstersen dinlemeden atlayabilirsin: her atlama ${p.skipCost} puanına mal olur, sınırı yok. Atladığın şarkıya sarı kart gösterebilirsin, kırmızı kart gösteremezsin.`,
          },
          {
            icon: "⏱️",
            text: `${p.maxMinutes} dakikadan uzun şarkılar kabul edilmez, aynı şarkı bir maçta iki kez çalınmaz.`,
          },
          { icon: "🤖", text: `Yapay zekâya karşı oynanan maçlarda puanların %${p.aiPercent}'i kazanılır.` },
          { icon: "🔞", text: `Üyelik için en az ${p.minAge} yaşında olmalısın.` },
        ],
      },
      {
        eyebrow: "Maç nasıl biter?",
        title: "Uzatmak serbest, kaçmak yok.",
        items: [
          {
            icon: "🏁",
            text: `İkiniz de en az ${p.minSongs} şarkı attığınızda ve şarkı sayılarınız eşitken «Maçı Bitir»e ikiniz de basarsanız maç biter. Üst sınır yok, istediğiniz kadar uzatabilirsiniz.`,
          },
          {
            icon: "⏳",
            text: `Sıra sana gelince şarkını göndermek için ${p.turnMinutes} dakikan var (rakibinin şarkısını dinleme süresinden sonra başlar). Süre dolarsa rakibin hükmen kazanır.`,
          },
          { icon: "🏳️", text: "İstediğin an pes edebilirsin; pes eden maçı kaybeder." },
          {
            icon: "🚶",
            text: "Türde anlaşamadıysanız ilk şarkı atılana kadar maçtan puan kaybetmeden ayrılabilirsiniz. Tek kişinin ayrılması yeter, kimseye puan yazılmaz.",
          },
          {
            icon: "🎁",
            text: `Galibiyet ve beraberlik bonusu, ancak ikiniz de en az ${p.minSongs} şarkı attıysanız yazılır.`,
          },
          { icon: "🚪", text: `${p.waitingMinutes} dakika içinde rakip gelmeyen odalar kapanır.` },
        ],
      },
      {
        eyebrow: "Sohbet ve izleyiciler",
        title: "Herkes izleyebilir, kimse kopya veremez.",
        items: [
          {
            icon: "👀",
            text: "Oda koduyla her maç canlı izlenebilir. Oyuncular isterse maçı izleyicilere kapatır. İzleyiciler puan almaz.",
          },
          { icon: "💬", text: "Maç sırasında oyuncular ve izleyiciler aynı sohbette yazışır, emoji atar." },
          {
            icon: "⛔",
            text: "Sohbette şarkı adı, sanatçı, link ya da herhangi bir ipucu vermek yasak. Hakem sohbeti de denetler; kuralı çiğneyenin hesabı kalıcı olarak silinir.",
          },
          { icon: "🧼", text: "Kötü sözler otomatik gizlenir. Rahatsız eden birini şikayet edebilir ya da engelleyebilirsin." },
          { icon: "🗑️", text: "Sohbet mesajları maç bitince silinir." },
        ],
      },
    ],

    leaderEyebrow: "Liderlik tablosu",
    leaderTitle: "Zirvede kim var?",
    leaderNote: "İstanbul saatiyle: gün gece yarısı, hafta pazartesi, ay her ayın 1'inde sıfırlanır.",
    dailyTitle: "Günün en iyileri",
    dailySubtitle: "Bugün toplanan puanlar",
    weeklyTitle: "Haftanın en iyileri",
    weeklySubtitle: "Bu hafta toplanan puanlar",
    monthlyTitle: "Ayın en iyileri",
    monthlySubtitle: "Bu ay toplanan puanlar",

    ctaTitle: "İlk şarkını atmaya hazır mısın?",
    ctaBody: "Üye ol, profilini kur, arkadaşına oda kodunu gönder. Gerisi şarkılara kalmış.",
    ctaButton: "Üye Ol ve Kapış",
  },

  lobbyPage: {
    eyebrow: "Lobi",
    welcome: "Hoş geldin,",
    points: (total: number) => `Toplam ${total} puan. Bugün hangi dünyadan şarkı atacaksın?`,
    banners: (p: { yellow: number; red: number; minSongs: number; turnMinutes: number }) => [
      {
        icon: "🪙",
        title: "Maç yazı turayla başlar",
        body: "Coin'i hızlı olan fırlatır ve tarafı hızlı olan seçer. Kazanan açılışı yapar, kaybeden maçın türünü seçer.",
        tone: "from-sun/15",
      },
      {
        icon: "🎯",
        title: "Kartlarını erken yakma",
        body: `Maç başına ${p.yellow} sarı, ${p.red} kırmızı kartın var. Hakem haksız bulursa kart boşa gider.`,
        tone: "from-flare-500/15",
      },
      {
        icon: "🏁",
        title: "Maç nasıl biter?",
        body: `İkiniz de en az ${p.minSongs} şarkı atınca «Maçı Bitir»e basın. Sıran gelince ${p.turnMinutes} dakikan var, yoksa hükmen kaybedersin. İlk şarkıya kadar puansız ayrılabilirsin.`,
        tone: "from-mint/15",
      },
      {
        icon: "👀",
        title: "İzleyici ol, sohbete katıl",
        body: "Bir oda kodun varsa maçı canlı izle. Sohbette ipucu vermek yasak, hesabın silinir.",
        tone: "from-pulse-500/15",
      },
      {
        icon: "🎨",
        title: "Profilini kişiselleştir",
        body: "Avatarını seç, sevdiğin türleri ekle. Rakiplerin kiminle kapıştığını bilsin.",
        tone: "from-volt-500/20",
      },
    ],
    weeklyTitle: "Haftanın en iyileri",
    weeklySubtitle: "Bu hafta toplanan puanlar",
  },

  signupPage: {
    eyebrow: "Aramıza katıl",
    titleBefore: "Sahneye çıkmadan önce ",
    titleAccent: "bir isim",
    titleAfter: " lazım.",
    body: "Gerçek adın ve e-postan sadece hesabın için saklanır. Maçlarda, liderlik tablosunda ve profilinde yalnızca nickname'in görünür.",
    formTitleMobile: "Üye Ol",
    formTitle: "Hesabını oluştur",
    formNote: "Bir dakikanı alır, sonra giriş yapıp kapışmaya başlarsın.",
  },

  loginPage: {
    created: "Hesabın oluşturuldu! Şimdi giriş yapıp ilk maçına başlayabilirsin.",
    needLogin: "Devam etmek için giriş yapman gerekiyor.",
    title: "Tekrar hoş geldin",
    note: "Nickname ve şifrenle giriş yap.",
  },

  profilePage: {
    eyebrow: "Oyuncu",
    memberSince: (date: string) => `Üyelik: ${date}`,
    totalPoints: "Toplam puan",
    genresTitle: "Sevdiği müzik türleri",
    noGenresOwner: "Henüz tür eklemedin, aşağıdan seçebilirsin.",
    noGenres: "Henüz tür eklenmemiş.",
    blockedTitle: "Engellediklerin",
    blockedNote: "Bu kişilerin sohbet mesajlarını görmüyorsun. Sadece sen görebilirsin.",
    blockedEmpty: "Kimseyi engellemedin.",
    unblock: "Engeli kaldır",
    saved: "Profilin güncellendi.",
  },

  /** Form checks. Server Actions produce these, so they live on the server side. */
  validation: {
    firstNameMin: "Adın en az 2 karakter olmalı.",
    firstNameMax: "Adın en fazla 40 karakter olabilir.",
    lastNameMin: "Soyadın en az 2 karakter olmalı.",
    lastNameMax: "Soyadın en fazla 40 karakter olabilir.",
    nickname: "3-20 karakter; harf, rakam ve alt çizgi kullanabilirsin.",
    email: "Geçerli bir e-posta adresi gir.",
    birthDateRequired: "Doğum tarihini gir.",
    birthDateInvalid: "Geçerli bir tarih gir.",
    birthDateFuture: "Doğum tarihi gelecekte olamaz.",
    tooYoung: (age: number) => `Music Fight'a üye olmak için en az ${age} yaşında olmalısın.`,
    passwordMin: "Şifre en az 8 karakter olmalı.",
    passwordMax: "Şifre en fazla 128 karakter olabilir.",
    passwordLetter: "Şifrede en az bir harf olmalı.",
    passwordDigit: "Şifrede en az bir rakam olmalı.",
    passwordMismatch: "Şifreler eşleşmiyor.",
    kvkk: "Devam etmek için aydınlatma metnini onaylaman gerekiyor.",
    genreNotInList: "Listede olmayan bir tür seçildi.",
    genresMin: (min: number) => `En az ${min} tür seç.`,
    genresMax: (max: number) => `En fazla ${max} tür seçebilirsin.`,
    emailTaken: "Bu e-posta adresiyle zaten bir hesap var.",
    nicknameTaken: "Bu nickname alınmış, başka bir tane dene.",
    loginMissing: "Nickname ve şifreni gir.",
    loginWrong: "Nickname veya şifre hatalı.",
  },

  roomPage: {
    metaTitle: (code: string) => `Oda ${code}`,
    closedNote: "Oyuncular maçı tekrar açarsa buradan izleyebilirsin.",
    backToLobby: "Lobiye dön",
  },

  kvkk: {
    draftLabel: "Taslak.",
    draftBody:
      "Bu metin yer tutucudur. Yayına almadan önce hukuk danışmanınız tarafından hazırlanmış gerçek aydınlatma metniyle değiştirilmelidir.",
    title: "KVKK Aydınlatma Metni",
    controllerTitle: "Veri sorumlusu",
    controllerBody: "[Şirket unvanı, adresi ve iletişim bilgileri buraya gelecek.]",
    dataTitle: "İşlenen kişisel veriler",
    data: [
      "Kimlik: ad, soyad, doğum tarihi",
      "İletişim: e-posta adresi",
      "Hesap: nickname, şifrenin geri döndürülemez özeti, avatar ve müzik türü tercihleri",
      "Oyun: oynanan maçlar, gönderilen şarkı linkleri, kartlar ve puanlar",
      "Sohbet: maç sırasındaki mesajlar (maç bitince silinir) ve şikayet edilen mesajların inceleme için saklanan kopyası",
      "Moderasyon: kural ihlali nedeniyle silinen hesapların nickname'i ve silinme gerekçesi",
    ],
    purposeTitle: "İşleme amaçları",
    purposeBody:
      "Üyelik oluşturmak, yaş sınırını doğrulamak, oturum açmak, maçları yürütmek, puanları ve liderlik tablolarını hesaplamak. Ad, soyad, e-posta ve doğum tarihi diğer kullanıcılara gösterilmez.",
    rightsTitle: "Haklarınız",
    rightsBody:
      "6698 sayılı Kanun'un 11. maddesi kapsamındaki haklarınızı kullanmak için [başvuru kanalı] üzerinden bize ulaşabilirsiniz.",
  },

  devCoin: {
    eyebrow: "Geliştirme önizlemesi",
    title: "Yazı tura ve tür seçimi",
    body: "Veritabanı olmadan çalışır; maç akışının sadece açılış kısmını gösterir.",
    whoseEyes: "Kimin gözünden bakıyorsun?",
    restart: "↻ Baştan",
    watchAgain: "Tekrar izle",
    openingBy: (name: string) => name,
    openingLine: "Açılış şarkısını",
    fakeNote:
      "Bu sayfa sahte veriyle çalışıyor: gerçek maçta sonucu sunucu çekiyor ve seçim yapılmadan kimseye göndermiyor. Burada her iki tarafın butonlarına da sen basabiliyorsun.",
  },
};

export type Site = typeof site;
