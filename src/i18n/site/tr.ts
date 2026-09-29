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
    help: "Yardım",
    contact: "İletişim",
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
        body: "Rakibinin şarkısı formatı bozdu mu? Sarı ya da kırmızı kart çıkar. Hakem de katılırsa kırmızı maçı bitirir.",
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
            text: `Maç başına her oyuncunun ${p.yellow} sarı ve ${p.red} kırmızı kartı var. Hakem kartı haklı bulursa geçerli sayılır: kırmızıda maç orada biter ve kartı yiyen kaybeder, ikinci sarıda da aynısı olur. Hakem haksız bulursa kart yanar, hiçbir şey değişmez.`,
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
            text: "Sohbette şarkı adı, sanatçı, link ya da herhangi bir ipucu vermek yasak. Hakem sohbeti de denetler; ilk iki ihlalde uyarı alırsın, üçüncüde hesabın kısıtlanır: maça giremez, maç izleyemezsin.",
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
        body: `Maç başına ${p.yellow} sarı, ${p.red} kırmızı kartın var. Geçerli bir kırmızı ya da ikinci sarı maçı bitirir; hakem haksız bulursa kart boşa gider.`,
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
        body: "Bir oda kodun varsa maçı canlı izle. Sohbette ipucu vermek yasak; iki uyarıdan sonra hesabın kısıtlanır.",
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
    nicknameShort: "Nickname en az 3 karakter olmalı.",
    nicknameLong: "Nickname en fazla 20 karakter olabilir.",
    nicknameChars: (chars: string) =>
      `Nickname’de şunları kullanamazsın: ${chars}. Harf (ç, ğ, ı, ö, ş, ü dahil), rakam ve alt çizgi serbest.`,
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

  help: {
    title: "Yardım",
    intro: "Merak ettiklerin burada. Başlığa dokun, cevabı açılsın.",
    playQ: "Music Fight nasıl oynanır?",
    playA:
      "İki oyuncu sırayla YouTube'dan şarkı atar. Attığın her şarkı, rakibinin bir önceki şarkısının formatına yakın olmak zorundadır: tür, enerji, dönem, prodüksiyon. Hakem her şarkıya uyar ya da uymaz der. Uyarsa puan kazanırsın, uymazsa kaybedersin. Maç boyunca müzik yavaş yavaş başka yerlere sürüklenir, oyunun tadı da budur.",
    signupQ: "Nasıl üye olunur?",
    signupA: (minGenres: number, minAge: number) =>
      `Ad, soyad, nickname, e-posta, doğum tarihi ve şifre yetiyor. Siteyi kullanmak için ${minAge} yaşından büyük olman gerekiyor. Bir de en az ${minGenres} müzik türü seçiyorsun: maçın açılış türü iki oyuncunun ortak türlerinden çıktığı için bu liste boş kalamaz. Sitede yalnızca nickname'in görünür; adın ve e-postan kimseye gösterilmez.`,
    startQ: "Maç nasıl başlatılır?",
    startA:
      "Lobiden yeni bir maç açtığında sana bir oda kodu verilir. Kodu arkadaşına yolla, o da lobideki kutuya yazıp katılsın. Katılan kişi oyuncu olarak oturabilir ya da sadece izleyebilir.",
    coinQ: "Yazı tura nasıl işler?",
    coinA: (seconds: number) =>
      `İki oyuncu da odaya girince "Coin Fırlat" butonu çıkar; hangisi önce basarsa coin havaya atılır, bir kişinin basması yeter. Coin dönerken iki oyuncunun önüne de yazı ve tura seçenekleri gelir; hızlı davranan tarafını seçer, diğerine zorunlu olarak öteki taraf düşer. Coin hangi yüzüne düşerse o tarafı tutan oyuncu açılış şarkısını atar. Sonuç coin havaya atıldığı anda sunucuda belirlenir ama taraf seçilene kadar kimseye gönderilmez, yani kimse sonucu bilerek seçim yapamaz. ${seconds} saniye içinde kimse basmazsa coini sunucu atar.`,
    genreQ: "Maçın türüne kim karar verir?",
    genreA:
      "Yazı turayı kaybeden oyuncu belirler. Karşısına iki oyuncunun profilinde ortak olan türlerden oluşan bir liste çıkar; ortak tür azsa liste herkesin bildiği popüler türlerle beşe tamamlanır. Seçilen türü rakip bir kez reddedebilir, ikinci seçim kesindir. Bu tür yalnızca açılış şarkısını bağlar; sonraki her şarkı bir öncekine göre değerlendirilir.",
    sendQ: "Şarkıyı nasıl gönderirim?",
    sendA: (maxMinutes: number) =>
      `YouTube linkini kutuya yapıştır, "Kontrol Et" de. Şarkının adını, kanalını ve süresini görürsün; doğruysa gönder. ${maxMinutes} dakikadan uzun şarkılar ve canlı yayınlar kabul edilmez. Aynı şarkı bir maçta iki kez çalınamaz.`,
    listenQ: "Neden şarkıyı sesi açık dinlemek zorundayım?",
    listenA: (percent: number) =>
      `Karar verebilmen için rakibinin şarkısının en az %${percent}'ini dinlemen gerekiyor. Sayaç yalnızca şarkı çalarken ve ses açıkken ilerler; sesi kısıp beklemek süreyi doldurmaz. İleri sarmak da işe yaramaz, çünkü sayaç gerçekten duyduğun saniyeleri sayar, aynı yeri tekrar dinlemek de ikinci kez sayılmaz. Sebebi basit: kart kararı da hakem kararı da şarkıyı gerçekten dinlemiş olmana dayanıyor.`,
    skipQ: "Dinlemeden cevap verebilir miyim?",
    skipA: (cost: number) =>
      `Verebilirsin ama bedeli var: ${cost} puan. Atladığın şarkıya sarı kart gösterebilirsin, kırmızı kart gösteremezsin — dinlemediğin bir şarkıyla rakibini maçtan atamazsın. Atlama hakkında sınır yok ve atladığın herkes tarafından görülür.`,
    cardsQ: "Sarı ve kırmızı kart nasıl kullanılır?",
    cardsA: (yellows: number, yellowPenalty: number, redPenalty: number) =>
      `Rakibinin şarkısı sana formatın dışında geldiyse kart gösterirsin: sarı "tam oturmadı", kırmızı "kesinlikle alakasız" demektir. Kart ancak hakem de şarkıyı uyumsuz bulursa geçerli olur; hakem şarkıyı beğenirse kartın boşa gider ve hiçbir şey değişmez. Geçerli sayılan sarı kart rakibine ${yellowPenalty}, kırmızı kart ${redPenalty} puana mal olur. Asıl mesele puan değil: futboldaki gibi, geçerli bir kırmızı kart maçı orada bitirir ve kartı yiyen oyuncu maçı kaybeder. İki geçerli sarı kart da aynı kapıya çıkar. Her oyuncunun bir maçta ${yellows} sarı ve bir kırmızı kart hakkı vardır.`,
    varQ: "VAR nedir, nasıl kullanılır?",
    varA: (seconds: number) =>
      `Futboldaki gibi: sahadaki hakem hızlı karar verir, VAR daha kapsamlı bakar. Rakibin sana kart gösterdiyse ve sahadaki hakem de ona hak verdiyse, kart hemen işlemez — önce senin önüne çıkar. ${seconds} saniyen var: kararı kabul edebilir ya da VAR'a gidebilirsin. VAR'a gidersen ikinci bir hakem maçın tamamına, önceki şarkılara ve alt tür komşuluklarına bakarak yeniden karar verir ve son söz onundur. Kararı bozarsa kart iptal olur, şarkın uyumlu sayılır, puanın düzeltilir ve kart rakibine geri verilir. Bozmazsa kart geçerli kalır. Maç başına bir VAR hakkın var; süre dolarsa kart kendiliğinden geçerli sayılır.`,
    refereeQ: "Hakem ne yapar?",
    refereeA:
      "Hakem bir yapay zekâ. Şarkının başlığından ve kanalından sanatçıyı, parçayı ve türü çıkarır, sonra onu ya bir önceki şarkıyla ya da açılışta anlaşılan türle karşılaştırır. Kararını ve gerekçesini yazar. Gerekçe üç dilde birden yazılır, çünkü aynı karar iki oyuncu ve bütün izleyiciler tarafından okunur. Hakemin kararı sen kart kararını verene kadar mühürlü kalır; kimse önce bakıp ona göre davranamaz.",
    scoringQ: "Puanlar nasıl işler?",
    scoringA: (match: number, mismatch: number, win: number, draw: number, minSongs: number) =>
      `Hakem şarkını uyumlu bulursa +${match}, bulmazsa ${mismatch} puan. Açılış şarkısı da böyle puanlanır, çünkü onun da uyması gereken bir tür vardır. Üstüne geçerli kart cezaları ve atlama cezaları biner. Maç bittiğinde kazanan +${win}, berabere kalınırsa iki taraf da +${draw} puan alır; ama bu bonuslar ancak iki oyuncu da en az ${minSongs} şarkı attıysa verilir, yani maçı erken kesip bonus toplayamazsın. Kazandığın puanlar profiline ve liderlik tablosuna işler.`,
    endQ: "Maç nasıl biter?",
    endA: (minSongs: number, turnMinutes: number) =>
      `En sık yolu anlaşmadır: iki oyuncu da en az ${minSongs} şarkı attıysa ve şarkı sayıları eşitse ikisi birden "Maçı Bitir" der, puanı yüksek olan kazanır. Bunun dışında maç kartla bitebilir, sıranı ${turnMinutes} dakika içinde oynamazsan hükmen bitebilir, ya da "Pes Et" dersen biter. İlk şarkı atılmadan önce fikrin değişirse maçtan puan kaybetmeden çıkabilirsin; tek tıkla oda kapanır ve kimseye hiçbir şey yazılmaz.`,
    chatQ: "Sohbette neler yasak?",
    chatA:
      "Atılacak şarkı için ipucu vermek kesinlikle yasak: şarkı adı, sanatçı, albüm, söz ya da parçayı tanıtan herhangi bir işaret. Bunu bir hakem denetler: ilk iki ihlalde uyarı alırsın, üçüncüde hesabın kısıtlanır ve artık maça giremez, maç izleyemezsin. Hesabın ve puanların silinmez. Çalınmış şarkılar hakkında konuşmak, tezahürat, şaka serbest; somut bir parça içermeyen tür istekleri de serbest. Link paylaşmak engellidir, küfür maskelenir, rahatsız eden birini bildirebilir ya da engelleyebilirsin. Sohbet maç bitince silinir.",
    spectatorQ: "Başkalarının maçını izleyebilir miyim?",
    spectatorA:
      "Evet, oda kodu olan herkes izleyebilir. İzleyiciler yazı turayı, tür seçimini ve bütün şarkıları görür ama hiçbir butona basamaz. Oyuncular isterse maçı izleyicilere tamamen kapatabilir; isterlerse izlemeye açık bırakıp yalnızca izleyici sohbetini kapatabilirler. İzleyiciler puan kazanmaz.",
    stillStuck: "Cevabını bulamadın mı?",
    stillStuckLink: "Bize yaz",
  },

  contactPage: {
    title: "İletişim",
    intro:
      "Bir sorun mu var, bir fikrin mi var, yoksa sadece merhaba mı demek istiyorsun? Yaz, okuyoruz.",
    nameLabel: "Adın",
    emailLabel: "E-posta adresin",
    emailHint: "Cevap verebilmemiz için.",
    subjectLabel: "Konu",
    messageLabel: "Mesajın",
    submit: "Gönder",
    sending: "Gönderiliyor…",
    successTitle: "Mesajın bize ulaştı.",
    successBody: "Teşekkürler. Gerekiyorsa yazdığın adresten dönüş yaparız.",
    another: "Bir mesaj daha yaz",
    nameRequired: "Adını yazar mısın?",
    emailInvalid: "Geçerli bir e-posta adresi gir.",
    subjectRequired: "Kısa bir konu yaz.",
    messageShort: "Mesajın en az 10 karakter olmalı.",
    messageLong: (max: number) => `Mesajın en fazla ${max} karakter olabilir.`,
    failed: "Mesaj gönderilemedi. Biraz sonra tekrar dener misin?",
  },

  accountNotice: {
    warningTitle: (count: number, limit: number) => `Hesabına ${count}. uyarı işlendi (${limit} uyarıda kısıtlama)`,
    warningBody: (limit: number) =>
      `Sohbette şarkı adı, sanatçı ya da ipucu vermek yasak. ${limit}. ihlalde hesabın kısıtlanır: maça giremez, maç izleyemezsin. Puanların ve geçmişin yerinde kalır.`,
    restrictedTitle: "Hesabın kısıtlandı",
    restrictedBody:
      "Sohbette tekrar tekrar şarkı ipucu verdiğin için artık maça giremiyor ve maç izleyemiyorsun. Hesabın ve puanların duruyor. İtirazın varsa iletişim formundan yaz.",
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
      "Moderasyon: uyarı alan ya da kısıtlanan hesapların nickname'i ve gerekçesi",
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
