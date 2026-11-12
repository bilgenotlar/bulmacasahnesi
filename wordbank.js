/**
 * Bulmaca Stüdyosu v2.0 - Kelime Bankası ve Kategori Yönetimi
 *
 * YENİ KATEGORİ EKLEME:
 * 1. CATEGORIES nesnesine "anahtar: 'Görünen Ad'" satırı ekleyin (Örn: fenerbahce: 'Fenerbahçe').
 * 2. RAW_WORDS nesnesine aynı anahtarla yeni bir blok açıp "KELİME | İpucu" şeklinde satırlar ekleyin.
 *
 * GOOGLE E-TABLOLAR (SHEETS) CANLI BAĞLANTISI (İSTEĞE BAĞLI):
 * E-Tablonuzda sütunlar: [Kategori Anahtarı] | [Kelime] | [İpucu] | [Zorluk (isteğe bağlı)]
 * Dosya > Paylaş > Web'de yayınla > CSV olarak yayınlayıp linki aşağıya yapıştırın.
 */

const GOOGLE_SHEETS_CSV_URL = ''; // Örn: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv'

const CATEGORIES = {
    bilim: 'Bilim',
    populer_kultur: 'Popüler Kültür',
    sinema: 'Sinema',
	gokbilim: 'Gökbilim',
    edebiyat: 'Edebiyat',
    astronomi: 'Astronomi',
    cografya: 'Coğrafya',
    ekonomi: 'Ekonomi',
    bitkiler: 'Bitkiler',
    hayvanlar: 'Hayvanlar',
    unluler: 'Ünlüler',
    genel: 'Genel Kültür',
    sosyoloji: 'Sosyoloji',
    tarih: 'Tarih',
    muzik: 'Müzik',
    spor: 'Spor',
    mitoloji: 'Mitoloji',
	ulkeler: 'Ülkeler'
};

const RAW_WORDS = {
    bilim: `
	ABİYOGENEZ | cansız maddelerden doğal yollarla ve kimyasal evrim süreciyle canlılığın ortaya çıkmasını açıklayan bilimsel teori
ABİYOTİK | ekosistemde canlı olmayan, cansız çevreye ve bileşenlere özgü olan durum veya etken
ABİYOZ | canlılık belirtilerinin bulunmaması, yaşamın noksanlığı ve yokluğu durumunu ifade eden biyoloji terimi
AKUSTİK | ses dalgalarının oluşumunu, yayılımını, duyulmasını ve özelliklerini inceleyen fizik alt dalı
APATİ | nöroloji ve psikolojide duygusal tepkisizlik, çevreye karşı aşırı ilgisizlik ve hissizlik hali
ATOM | kimyasal elementlerin tüm özelliklerini taşıyan, çekirdek ve elektronlardan oluşan en küçük yapı taşı
BİYOSFER | Yeryüzünde canlıların yaşadığı atmosfer, karalar ve sulardan oluşan küresel yaşam katmanı
BOTANİK | bitkilerin yapısını, büyümesini, beslenmesini ve sınıflandırılmasını inceleyen biyoloji dalı
DORMANSİ | bitki tohumları ve tomurcuklarında olumsuz çevre koşullarında büyümenin geçici olarak durduğu uyku hali
DOKU | canlılarda benzer yapı ve işleve sahip hücrelerin bir araya gelerek oluşturduğu biyolojik birim
EKOLOJİ | canlıların birbirleriyle ve cansız çevreleriyle olan karmaşık ilişkilerini inceleyen bilim dalı
ELEKTRON | atom çekirdeği etrafında dönen, negatif elektrik yüküne sahip temel atom altı parçacık
EMBRİYO | döllenmiş yumurtanın gelişmesiyle oluşan ve organlaşma evresindeki erken canlı taslağı
ENZİM | canlı organizmalardaki biyokimyasal tepkimelerin hızını artıran biyolojik katalizör protein
FOSİL | jeolojik devirlerde yaşamış canlıların kayaçlar içinde korunarak günümüze ulaşan kalıntısı veya izi
FOTON | elektromanyetik radyasyonun ve ışığın temel yapı taşı olan kütlesiz enerji paketi
GALAKSİ | kütle çekimiyle birbirine bağlı milyarlarca yıldız, gaz ve toz bulutundan oluşan devasa gök sistemi
HORMON | iç salgı bezleri tarafından üretilip kan yoluyla hedef organlara taşınan düzenleyici kimyasal
HÜCRE | tüm canlıların yapısını oluşturan, bağımsız yaşam yeteneğine sahip en küçük biyolojik birim
KROMOZOM | hücre çekirdeğinde bulunan ve genetik bilgiyi taşıyan DNA ile protein kompleksinden oluşan yapı
KULUÇKA | yumurtalı canlıların embriyo gelişimini tamamlaması için gereken sıcaklık ve nem ortamında bekleme süreci
MUKUS | canlı organlarını korumak, nemli tutmak ve yabancı maddeleri tutmak için salgılanan kaygan sıvı
OPTİK | ışığın doğasını, yayılmasını, kırılmasını ve maddeyle etkileşimini inceleyen fizik dalı
PARSEK | astronomide gök cisimleri arasındaki devasa uzaklıkları ölçmede kullanılan ve yaklaşık 3,26 ışık yılına denk gelen mesafe birimi
PESTİSİT | tarım ürünlerine zarar veren böcek, ot ve mantar gibi organizmaları engellemek veya yok etmek için kullanılan kimyasal bileşik
PİGMENT | canlı dokularına renk veren ve belirli dalga boylarındaki ışığı emerek işlev gören kimyasal madde
POLEN | çiçekli bitkilerde erkek üreme hücresini taşıyan ve tozlaşmayı sağlayan mikro boyuttaki tanecik
PROKARYOT | belirgin bir hücre çekirdeği ve zarla çevrili organelleri bulunmayan tek hücreli canlı türü
RETİNOL | görme işlevinde ve hücre büyümesinde temel rol oynayan A vitamininin biyolojik olarak aktif ana formu
STOMA | bitkilerin yapraklarında gaz alışverişini ve terlemeyi denetleyen açılıp kapanabilir gözenek yapısı
        ATOM | Maddenin kimyasal özelliklerini taşıyan en küçük yapı taşı
        LAZER | Yoğunlaştırılmış tek renkli ve eş evreli ışık demeti
        ELEKTRON | Atom çekirdeğinin çevresinde dönen negatif yüklü parçacık
        PROTON | Atom çekirdeğinde bulunan pozitif yüklü temel parçacık
        NÖTRON | Atom çekirdeğindeki yüksüz parçacık
        MOLEKÜL | İki veya daha fazla atomun kimyasal bağla birleşmesiyle oluşan yapı
        ENZİM | Canlı hücrelerde kimyasal tepkimeleri hızlandıran biyolojik katalizör
        GENETİK | Kalıtım ve genlerin yapısını inceleyen bilim dalı
        BAKTERİ | Tek hücreli mikroskobik canlı grubu
        VİRÜS | Sadece canlı hücre içinde çoğalabilen mikroskobik enfeksiyon etkeni
        İVME | Birim zamandaki hız değişimi
        KÜTLE | Bir cismin içerdiği değişmez madde miktarı
        ENERJİ | İş yapabilme yeteneği
        OPTİK | Işığın doğasını ve davranışlarını inceleyen fizik dalı
        KATALİZ | Bir maddenin tepkimeyi kendisi değişmeden hızlandırması
        İZOTOP | Proton sayıları aynı, nötron sayıları farklı atomlar
        PLAZMA | Maddenin iyonlaşmış gaz halindeki dördüncü hali
        FÜZYON | Hafif atom çekirdeklerinin birleşerek enerji açığa çıkarması
        FİSYON | Ağır atom çekirdeğinin bölünerek enerji üretmesi
        GRAVİTE | Kütleli cisimlerin birbirini çekme kuvveti
    `,

    populer_kultur: `
        PODCAST | İnternet üzerinden dinlenebilen dijital ses yayını serisi
        FENOMEN | Sosyal medyada geniş kitlelerce takip edilen popüler kişi
        TREND | Belirli bir dönemde toplumda yaygınlaşan eğilim veya akım
        RETRO | Geçmiş dönemlerin moda ve tasarım anlayışını yansıtan stil
        MANGA | Japonya'ya özgü çizgi roman sanatı
        ANİME | Japonya'ya özgü çizim teknikleriyle yapılan animasyon türü
        COSPLAY | Kurgu karakterlerin kostüm ve makyajına bürünme sanatı
        VLOG | Video formatında hazırlanan kişisel günlük yayını
        HASHTAG | Sosyal medyada konuları etiketlemek için kullanılan diyez işareti
        AVATAR | Dijital platformlarda kullanıcıyı temsil eden sanal karakter
        EMOJİ | Dijital mesajlarda duygu ifade eden küçük simge
        KARAOKE | Altyapı müziği eşliğinde ekrandaki sözleri okuyarak şarkı söyleme
        SİTKOM | Durum komedisi türünde televizyon dizisi
        NOSTALJİ | Geçmişe duyulan özlem
        İKON | Bir dönemi veya akımı simgeleyen kişi ya da nesne
        SPOİLER | Bir eserin sürpriz gelişmelerini önceden ele veren bilgi
        REYTİNG | Televizyon programlarının izlenme oranı ölçümü
        MARATON | Bir dizinin bölümlerini ara vermeden art arda izleme eylemi
    `,
 gokbilim: `
ASTEROİT | Güneş etrafında dolanan, gezegenlerden küçük, kayaç veya metal yapılı gök cismi.
ASTRONOMİ | gök cisimlerini, uzayı ve evrenin fiziki yapısını inceleyen gök bilim dalı.
ATMOSFER | bir gök cismini çevreleyen ve kütle çekimi sayesinde dengede duran gaz katmanı.
CÜCE | kendi kütle çekimiyle küresel biçim almış ancak yörüngesini temizleyememiş küçük gök cismi sınıfı.
EKSEN | bir gök cisminin kendi etrafındaki dönme hareketini gerçekleştirdiği hayali hat.
FOTON | elektromanyetik radyasyonun ve ışığın temel yapı taşı olan kütlesiz enerji paketi.
GALAKSİ | kütle çekimiyle birbirine bağlı milyarlarca yıldız, gaz ve toz bulutundan oluşan dev gök sistemi.
GEZEGEN | bir yıldız çevresinde dolanan ve kendi kütle çekimiyle küresel biçim kazanmış gök cismi.
GÖKADA | gaz, toz ve milyarlarca yıldızın kütle çekimiyle bir arada tutulduğu devasa sistem.
GÖKBİLİM | gök cisimlerinin konumlarını, hareketlerini ve kimyasal yapılarını inceleyen bilim dalı.
GÖKKÜRE | gözlemcinin merkezde yer aldığı ve tüm gök cisimlerinin üzerinde bulunduğu var sayılan hayali küre.
GÜNEŞ | Güneş Sistemi'nin merkezinde yer alan ve sıcak plazmadan oluşan orta büyüklükteki yıldız.
IŞIKYILI | ışığın boşlukta bir dünya yılında katettiği yaklaşık 9,46 trilyon kilometrelik mesafe birimi.
IŞINIM | enerjinin dalga veya parçacıklar halinde uzayda yayılması süreci.
KOZMOS | kaosun zıttı olarak evrenin bir düzen ve bütünlük içindeki halini ifade eden terim.
KRATER | bir gök taşının gezegen veya uydu yüzeyine çarpması sonucu oluşan çanak şeklindeki çukur.
KUAZAR | uzak galaksilerin merkezinde bulunan ve aşırı miktarda enerji yayan çok parlak çekirdek.
KUTUP | bir gezegenin dönme ekseninin yüzeyi kestiği en kuzey ve en güney noktalar.
METEOR | gezegen atmosferine girip sürtünmeyle ısınarak ışık çizgisi oluşturan gök taşı.
NEBULA | uzayda yeni yıldızların doğduğu yoğun gaz ve toz bulutu.
PARSEK | gök bilimcilerin yıldızlararası uzaklıkları ölçmek için kullandığı 3,26 ışık yılına denk gelen birim.
PLAZMA | gaz atomlarının elektronlarını kaybetmesiyle oluşan maddenin yüksek enerjili iyonize hali.
PULSAR | kendi etrafında hızla dönerek uzaya kütlesel radyo dalgası demetleri yayan nötron yıldızı.
TAYF | ışığın prizmadan veya kırınım ağından geçerek dalga boylarına göre ayrışması sonucu oluşan renk dizilimi.
TELESKOP | uzaktaki gök cisimlerinden gelen elektromanyetik radyasyonu toplayıp görüntüleyen araç.
TUTULMA | bir gök cisminin başka bir gök cisminin gölgesine girmesiyle ışığının geçici olarak kesilmesi.
TUTULUM | Güneş'in gökküresi üzerinde bir yıl boyunca izlediği hayali dairesel yol.
UYDU | bir gezegenin kütle çekim etkisinde kalarak onun etrafında belirli bir yörüngede dönen gök cismi.
YILDIZ | çekirdeğinde gerçekleşen nükleer füzyon tepkimeleri sayesinde çevreye ısı ve ışık saçan plazma küresi.
YÖRÜNGE | bir gök cisminin kütle çekimi etkisi altında başka bir cisim etrafında izlediği periyodik yol.
    `,

    sinema: `
        OSCAR | Sinema Sanatları ve Bilimleri Akademisi tarafından verilen ödül
        KURGU | Çekilen sahnelerin anlamlı bir bütün oluşturacak şekilde birleştirilmesi
        SENARYO | Bir filmin sahnelerini ve diyaloglarını içeren yazılı metin
        KAMERA | Görüntü kaydetmeye yarayan optik cihaz
        AKTRİS | Kadın sinema ve tiyatro oyuncusu
        AKTÖR | Erkek sinema ve tiyatro oyuncusu
        FRAGMAN | Filmin vizyona girmeden önce yayınlanan kısa tanıtım videosu
        DUBLAJ | Yabancı dildeki filmlerin yerli seslendirme ile uyarlanması
        JENERİK | Filmin başında veya sonunda emeği geçenlerin listelendiği bölüm
        PLATOLAR | Film çekimleri için özel olarak hazırlanan geniş mekanlar
        KLAKET | Çekim başlangıcında sahne ve çekim numarasını bildiren tahta
        SEKANS | Kendi içinde bütünlüğü olan film bölümü
        FİGÜRAN | Filmlerde konuşmasız yan rollerde yer alan oyuncu
        GALA | Bir filmin ilk kez izleyiciyle buluştuğu özel gösterim gecesi
        VİZYON | Bir filmin sinema salonlarında gösterime girmesi
        MONTAJ | Görüntü ve ses kayıtlarının seçilip düzenlenmesi işlemi
        KADRAJ | Kamera objektifinin gördüğü çerçeve alanı
        BELGESEL | Gerçek olayları ve yaşamları konu alan sinema türü
    `,

    edebiyat: `
        ROMAN | İnsanların başından geçen veya geçebilecek olayları anlatan uzun kurgu eser
        ŞİİR | Duygu ve düşüncelerin ölçülü, ahenkli dizelerle anlatıldığı edebi tür
        HİKAYE | Gerçek veya tasarlanmış olayları kısa şekilde anlatan yazı türü
        DENEME | Yazarın herhangi bir konudaki kişisel görüşlerini anlattığı düzyazı
        TİYATRO | Sahnede oynanmak üzere yazılan edebi eser türü
        MANİ | Genellikle yedi heceli dört dizeden oluşan anonim halk şiiri
        GAZEL | Divan edebiyatında aşk ve güzellik konularını işleyen nazım biçimi
        KASİDE | Din ve devlet büyüklerini övmek amacıyla yazılan divan şiiri
        FABUL | Kahramanları genellikle hayvanlar olan ders verici kısa öykü
        DESTAN | Milletlerin tarihindeki kahramanlıkları anlatan uzun manzum eser
        KAFİYE | Dize sonlarındaki ses benzerliği
        REDİF | Dize sonlarında aynı görevle tekrarlanan ek veya kelimeler
        İMGELER | Şiirde zihinde canlandırılan hayali tasarımlar
        MİSRA | Şiirin her bir satırı, dize
        ÜSLUP | Bir yazarın kendine özgü anlatım biçimi
        ELEŞTİRİ | Bir sanat veya edebiyat eserini olumlu ve olumsuz yönleriyle değerlendirme
        BİYOGRAFİ | Tanınmış bir kişinin hayatını anlatan eser
        OTOBİYOGRAFİ | Kişinin kendi yaşam öyküsünü yazdığı eser
    `,

    astronomi: `
        MARS | Yüzeyindeki demir oksit nedeniyle Kızıl Gezegen olarak bilinen gezegen
        VENÜS | Güneş sisteminin en sıcak gezegeni, Çoban Yıldızı
        SATÜRN | Belirgin buz ve kaya halkalarıyla tanınan dev gezegen
        JÜPİTER | Güneş sisteminin en büyük gezegeni
        NEPTÜN | Güneş'e en uzak sekizinci gezegen
        URANÜS | Eksen eğikliği nedeniyle yan yatmış gibi dönen buz devi
        MERKÜR | Güneş'e en yakın ve en küçük gezegen
        NEBULA | Yıldızların doğduğu devasa toz ve gaz bulutu
        GALAKSİ | Milyarlarca yıldız, gaz ve tozdan oluşan dev sistem, gök ada
        ASTEROİT | Güneş çevresinde dolanan kayalık gök cismi
        METEOR | Atmosfere girerek yanan gök taşı
        KRATER | Gök taşı çarpması veya volkanik patlamayla oluşan çukur
        UYDU | Bir gezegenin çevresinde dolanan doğal veya yapay cisim
        YÖRÜNGE | Bir gök cisminin başka bir cisim etrafında izlediği yol
        TUTULMA | Bir gök cisminin başka bir cismin gölgesine girmesi olayı
        EŞİTGECE | Gece ve gündüz sürelerinin eşit olduğu an, ekinoks
        PARLAKLIK | Bir yıldızın yaydığı ışık şiddeti
        TELESKOP | Uzak gök cisimlerini gözlemlemeye yarayan optik alet
        KOZMOS | Evrenin düzenli ve uyumlu bütünü
    `,

    cografya: `
        DELTA | Akarsuların denize döküldüğü yerde oluşturduğu üçgen biçimli ova
        BOĞAZ | İki denizi birbirine bağlayan dar su geçidi
        YARIMADA | Üç tarafı sularla çevrili kara parçası
        TAKIMADA | Birbirine yakın konumlanmış adalar grubu
        PLATO | Akarsular tarafından derin yarılmış yüksek düzlük, yayla
        VADI | İki dağ arasında uzanan çukur arazi
        FAY | Yer kabuğundaki kırık hattı
        EROSYON | Toprağın su ve rüzgar etkisiyle aşınıp taşınması
        MUSON | Güney ve Güneydoğu Asya'da etkili olan mevsimlik rüzgar
        STEP | Yarı kurak iklim bölgelerinde görülen bozkır bitki örtüsü
        TUNDRA | Kutup altı soğuk bölgelerde görülen yosunlu bitki örtüsü
        BUZUL | Dağ zirvelerinde veya kutuplarda biriken dev buz kütlesi
        LAGÜN | Kıyı okunun bir koyun önünü kapatmasıyla oluşan kıyı gölü
        KANYON | Akarsuların kireç taşlarını derin oymasıyla oluşan dar vadi
        OBRUK | Yer altı mağaralarının tavanının çökmesiyle oluşan derin kuyu
        Ekvator | Dünyayı kuzey ve güney yarım küreye ayıran hayali çizgi
        MERİDYEN | İki kutup noktasını birleştiren hayali yarım daire
        İZOHİPS | Deniz seviyesine göre aynı yükseklikteki noktaları birleştiren eğri
        HORST | Fay hatları arasında yükselmiş kara bloğu
    `,

    ekonomi: `
        ENFLASYON | Fiyatlar genel düzeyinin sürekli ve hızlı artışı
        DEFLASYON | Fiyatlar genel düzeyinin sürekli düşmesi
        İHRACAT | Bir ülkenin ürettiği malları dış ülkelere satması, dış satım
        İTHALAT | Başka ülkelerden mal ve hizmet satın alınması, dış alım
        DÖVİZ | Yabancı ülke para birimlerinin genel adı
        BORSA | Hisse senedi ve tahvil gibi değerlerin alınıp satıldığı piyasa
        FAİZ | Ödünç verilen paranın kullanım bedeli
        BÜTÇE | Gelecek döneme ait gelir ve gider tahminlerini gösteren cetvel
        VERGİ | Devletin kamu hizmetleri için vatandaşlardan aldığı yasal pay
        SERMAYE | Bir işletmenin kurulması ve işlemesi için gereken ana para ve mal varlığı
        CARİ | Günlük ve devam eden ticari işlemleri tanımlayan terim
        ARZ | Piyasaya sunulan mal ve hizmet miktarı
        TALEP | Satın alma gücüyle desteklenen tüketici isteği
        REKABET | Aynı piyasada faaliyet gösteren firmalar arasındaki yarış
        TEKEL | Bir malın üretiminin tek bir firmanın elinde bulunması, monopol
        KREDİ | Geri ödenmek üzere sağlanan finansal kaynak
        TEMETTÜ | Şirketlerin yıllık kârından ortaklarına dağıttığı pay
        RESESYON | Ekonomik faaliyetlerde yaşanan durgunluk dönemi
    `,

    bitkiler: `
        ORKİDE | Zarif çiçekleriyle bilinen tropikal kökenli süs bitkisi
        KAKTÜS | Gövdesinde su depolayan dikenli çöl bitkisi
        LAVANTA | Mor çiçekli ve hoş kokulu aromatik bitki
        PAPATYA | Beyaz yapraklı, sarı merkezli kır çiçeği
        MANOLYA | Büyük, gösterişli ve kokulu çiçekler açan ağaç türü
        ZEYTİN | Akdeniz ikliminin simgesi olan uzun ömürlü meyve ağacı
        DEFNE | Yaprakları baharat ve parfümeride kullanılan her dem yeşil ağaç
        IHALAMUR | Çiçekleri kış aylarında çay olarak demlenen kokulu ağaç
        SÖĞÜT | Su kenarlarında yetişen, sarkık dallı ağaç
        ÇINAR | Geniş gövdeli ve uzun ömürlü heybetli ağaç
        ARDIC | Kozalaklı ve iğne yapraklı dayanıklı ağaç türü
        EĞRELTİ | Çiçeksiz ve sporla çoğalan orman bitkisi
        YOSUN | Nemli kaya ve ağaç gövdelerini kaplayan ilkel bitki
        LALE | Soğanlı, kadeh biçimli çiçek açan süs bitkisi
        SÜMBÜL | Yoğun kokulu, salkım çiçekli soğanlı bitki
        BEGONYA | Renkli yaprakları ve çiçekleriyle bilinen salon bitkisi
        BAMBU | Hızlı büyüyen, odunsu gövdeli dev otsu bitki
        SAFRAN | Dünyanın en pahalı baharatını veren mor çiçekli bitki
    `,

    hayvanlar: `
        ÇİTA | Karada yaşayan en hızlı memeli hayvan
        PENGUEN | Güney Yarım Küre'de yaşayan, uçamayan ama iyi yüzen deniz kuşu
        FLAMİNGO | Pembe tüyleri ve uzun bacaklarıyla tanınan su kuşu
        BUKALEMUN | Ortama ve ruh haline göre renk değiştirebilen sürüngen
        YUNUS | Yüksek zekası ve ses dalgalarıyla yön bulmasıyla bilinen deniz memelisi
        BALİNA | Dünyanın en büyük deniz memelisi
        KANGURU | Yavrularını karnındaki kesede taşıyan Avustralya memelisi
        KOALA | Okaliptüs yapraklarıyla beslenen keseli memeli
        PANDA | Bambu filizleriyle beslenen siyah-beyaz ayı türü
        KARTAL | Keskin görüşü ve yüksekten uçuşuyla bilinen yırtıcı kuş
        BAYKUŞ | Gece avlanan, başını geniş açıyla döndürebilen kuş
        AKREP | Kıskaçlı ve zehirli iğneli eklem bacaklı
        AHTAPOT | Sekiz kollu, üç kalpli zeki deniz yumuşakçası
        DENİZATI | Erkeğinin yavruları kuluçka kesesinde taşıdığı ilginç balık
        KİRPİ | Tehlike anında dikenli bir top haline gelen küçük memeli
        KUNDUZ | Akarsulara ağaç dallarından setler kuran kemirgen
        LEOPAR | Benekli kürküyle tanınan çevik büyük kedi
        ALBATROS | Kanat açıklığı en geniş deniz kuşlarından biri
    `,

    unluler: `
        ATATÜRK | Türkiye Cumhuriyeti'nin kurucusu ve ilk Cumhurbaşkanı
        EİNSTEİN | Görelilik kuramını geliştiren Nobel ödüllü fizikçi
        NEWTON | Evrensel kütle çekim yasasını formüle eden bilim insanı
        GALİLEO | Modern gözlemsel astronominin babası sayılan İtalyan bilgin
        TESLA | Alternatif akım elektrik sisteminin öncüsü mucit
        EDİSON | Ticari elektrik ampulünü ve fonografı geliştiren mucit
        MOZART | Klasik Batı müziğinin Avusturyalı dahi bestecisi
        BEETHOVEN | Sağırlığına rağmen 9. Senfoni'yi besteleyen Alman müzisyen
        PİCASSO | Kübizm akımının öncüsü İspanyol ressam
        DARWİN | Doğal seçilim yoluyla evrim kuramını ortaya atan doğa bilimci
        CURİE | Radyoaktivite çalışmalarıyla iki farklı dalda Nobel alan bilim kadını
        İBNİSİNA | Tıbbın Kanunu eseriyle tanınan büyük bilgin
        FARABİ | İslam felsefesinde İkinci Öğretmen unvanıyla bilinen düşünür
        MİMAR | Sinan'ın da unvanı olan, yapı tasarlayan sanatçı
        ŞEKSPIİR | Hamlet ve Romeo ile Juliet'in yazarı İngiliz oyun yazarı
        TOLSTOY | Savaş ve Barış ile Anna Karenina'nın Rus yazarı
        ORWELL | 1984 ve Hayvan Çiftliği romanlarının İngiliz yazarı
    `,

    genel: `
        PUSULA | Manyetik iğnesiyle yön bulmaya yarayan alet
        SATRANÇ | Şah ve mat hedefiyle oynanan 64 karelik strateji oyunu
        ORIGAMI | Japon kağıt katlama sanatı
        MOZAİK | Küçük renkli taş veya cam parçalarıyla yapılan süsleme sanatı
        LABİRENT | İçinden çıkılması zor karmaşık yollar bütünü
        ANSİKLOPEDİ | Tüm alanlarda veya belirli bir konuda bilgi veren başvuru eseri
        KARANTİNA | Bulaşıcı hastalıkların yayılmasını önlemek için uygulanan tecrit
        MÜZE | Sanat ve bilim eserlerinin saklanıp sergilendiği mekan
        KÜTÜPHANE | Kitapların düzenli olarak korunduğu ve okunduğu yer
        SİMYA | Değersiz madenleri altına çevirmeye uğraşan eski uğraş
        HARİTA | Yeryüzünün kuş bakışı görünümünün ölçekli çizimi
        TAKViM | Zamanı yıllara, aylara ve günlere bölen çizelge
        AMBLEM | Bir kurum veya topluluğu temsil eden görsel simge
        PATENT | Bir buluşun sahibine verilen yasal tescil belgesi
        TELİF | Fikir ve sanat eserleri üzerindeki yasal hak
        KRONOMETRE | Zamanı hassas biçimde ölçen saat
        MİKROSKOP | Çıplak gözle görülemeyecek kadar küçük cisimleri büyüten alet
    `,

    sosyoloji: `
        TOPLUM | Ortak bir kültür ve toprak üzerinde yaşayan insan topluluğu
        KÜLTÜR | Bir toplumun tarihsel süreç içinde ürettiği maddi ve manevi değerler
        NORM | Toplum içinde uyulması beklenen yazılı veya yazısız kurallar
        STATÜ | Bireyin toplum içindeki konumu ve saygınlığı
        ROL | Bireyin toplumsal konumuna göre sergilemesi beklenen davranışlar
        GÖÇ | İnsanların ekonomik veya sosyal nedenlerle yer değiştirmesi
        KENTLEŞME | Nüfusun şehirlerde toplanması ve şehir sayısının artması
        AİLE | Toplumun en küçük temel birimi
        TABAKA | Toplumda gelir ve statüye göre oluşan sosyal katman
        DAYANIŞMA | Topluluk üyelerinin birbirine destek olması durumu
        YABANCILAŞMA | Bireyin yaşadığı topluma ve çevresine uzaklaşması hissi
        ÖNYARGI | Bir kişi veya grup hakkında önceden edinilmiş peşin hüküm
        İDEOLOJİ | Siyasal veya toplumsal bir öğreti oluşturan düşünceler bütünü
        KAMUOYU | Belirli bir konuda halkın genel düşüncesi
        GELENEK | Nesilden nesile aktarılan alışkanlık ve uygulamalar
        DEMOGRAFİ | Nüfusun yapısını ve değişimlerini inceleyen bilim
        ASİMİLASYON | Azınlık kültürünün baskın kültür içinde erimesi
    `,

    tarih: `
        SÜMERLER | Yazıyı icat ederek tarih çağlarını başlatan Mezopotamya uygarlığı
        HİTİTLER | Başkenti Hattuşaş olan Anadolu uygarlığı
        URARTULAR | Van Gölü çevresinde su kanalları ve kaleleriyle tanınan uygarlık
        LİDYALILAR | Tarihte parayı ilk kez basan Anadolu uygarlığı
        FRİGLER | Başkenti Gordion olan, tarım ve dokumacılıkta gelişmiş uygarlık
        BİZANS | Doğu Roma İmparatorluğu'na verilen ad
        RÖNESANS | Avrupa'da bilim, sanat ve edebiyatta yeniden doğuş dönemi
        REFORM | 16. yüzyılda Avrupa'da Katolik Kilisesi'ne karşı başlatılan yenilik hareketi
        FEODALİTE | Orta Çağ Avrupa'sında toprak ağalığına dayalı yönetim biçimi
        İPEKYOLU | Çin'den başlayıp Anadolu üzerinden Avrupa'ya uzanan tarihi ticaret yolu
        MATBAA | Kitapların seri basımını sağlayan devrim niteliğindeki buluş
        FERMAN | Osmanlı padişahlarının yazılı emri
        DİVAN | Osmanlı Devleti'nde devlet işlerinin görüşüldüğü yüksek kurul
        TANZİMAT | Osmanlı'da 1839 yılında ilan edilen yenileşme fermanı
        MİLLİ | Kurtuluş Savaşı mücadelesini tanımlayan temel kavram
        LOZAN | Türkiye Cumhuriyeti'nin bağımsızlığını tescilleyen barış antlaşması
        ARKEOLOJİ | Kazı yoluyla eski uygarlıkları inceleyen bilim dalı
    `,

    muzik: `
        SENFONİ | Orkestra için bestelenmiş çok bölümlü büyük müzik eseri
        SOLO | Tek bir çalgı veya ses tarafından icra edilen parça
        KORO | Toplu halde şarkı söyleyen ses sanatçıları grubu
        NOTA | Müzik seslerini yazıya dökmeye yarayan işaret
        RİTİM | Müzikte seslerin düzenli aralıklarla tekrarlanması
        MELODİ | Kulağa hoş gelen uyumlu ses dizisi, ezgi
        AKOR | En az üç farklı sesin aynı anda tınlaması
        OKTAV | Bir ses ile onun iki katı frekanstaki sesi arasındaki aralık
        PİYANO | Tuşlara basıldığında tellere vuran çekiçlerle ses çıkaran çalgı
        KEMAN | Yay ile çalınan dört telli klasik çalgı
        FLÜT | Üflemeli tahta veya metal müzik aleti
        BAĞLAMA | Türk halk müziğinin en yaygın telli tezeneli çalgısı
        MAKAM | Türk müziğinde dizilerin işleniş biçimi
        OPERA | Sözlerinin tamamı veya çoğu müzikle söylenen sahne eseri
        KONÇERTO | Bir solo çalgı ile orkestra için yazılmış eser
        BESTECİ | Müzik eseri yaratan sanatçı, kompozitör
    `,

    spor: `
        MARATON | 42 kilometre 195 metrelik uzun mesafe koşusu
        OLİMPİYAT | Dört yılda bir düzenlenen dünyanın en büyük spor organizasyonu
        PENALTI | Futbolda ceza sahası içindeki faul sonrası yapılan serbest vuruş
        OFSAYT | Futbolda hücum oyuncusunun top atılmadan savunmanın arkasına geçmesi
        KORNER | Topun savunma oyuncusundan çıkmasıyla kazanılan köşe vuruşu
        DERBİ | Aynı şehrin iki büyük takımının karşılaştığı maç
        VOLEYBOL | File üzerinden elle oynanan altı kişilik takım sporu
        BASKETBOL | Topu potadan geçirerek sayı kazanılan salon sporu
        TENİS | Raket ve keçe kaplı topla kortta oynanan spor
        ESKRİM | Kılıçla yapılan olimpik savunma ve saldırı sporu
        OKÇULUK | Yay kullanarak hedefi vurmaya dayalı spor
        GÜREŞ | İki sporcunun rakibinin sırtını yere getirmeye çalıştığı ata sporu
        ATLETİZM | Koşu, atlama ve atma branşlarını kapsayan temel spor dalı
        TURNUVA | Çok sayıda takım veya sporcunun katıldığı eleme usulü yarışma
        MADALYA | Dereceye giren sporculara verilen ödül nişanı
        HAKEM | Karşılaşmaları kurallara göre yöneten görevli
    `,

    mitoloji: `
        ZEUS | Yunan mitolojisinde gökyüzü ve şimşek tanrısı, tanrıların kralı
        ATHENA | Akıl, bilgelik ve strateji tanrıçası
        APOLLON | Müzik, sanat, güneş ve kehanet tanrısı
        POSEİDON | Denizler, depremler ve atlar tanrısı
        HADES | Yer altı ve ölüler dünyasının hükümdarı
        ARTEMİS | Avcılık, vahşi doğa ve ay tanrıçası
        HERA | Evlilik ve aile tanrıçası, Olimpos kraliçesi
        HERMES | Tanrıların habercisi, ticaret ve yolculuk tanrısı
        ODYSSEUS | Truva Savaşı sonrası eve dönüşü yıllar süren destan kahramanı
        AKHİLLEUS | Truva Savaşı'nın topuğundan başka yerinden yaralanmayan kahramanı
        PEGASUS | Yunan mitolojisindeki kanatlı beyaz at
        MEDUSA | Bakışlarıyla insanları taşa çeviren yılan saçlı Gorgon
        MİNOTAUR | Girit'teki labirentte yaşayan boğa başlı mitolojik yaratık
        PROMETHEUS | Ateşi tanrılardan çalıp insanlara veren Titan
        OLİMPOS | Yunan tanrılarının yaşadığına inanılan kutsal dağ
        ANKA | Küllerinden yeniden doğan efsanevi kuş, Zümrüdüanka
    `,
	  ulkeler: `
        ALMANYA | Başkenti Berlin olan, resmî dili Almanca olan ve euro para birimini kullanan Orta Avrupa ülkesi
ANGOLA | Başkenti Luanda olan, resmî dili Portekizce olan ve kwanza para birimini kullanan Güneybatı Afrika ülkesi
ANDORRA | Başkenti Andorra la Vella olan, resmî dili Katalanca olan Batı Avrupa ülkesi
ARJANTİN | Başkenti Buenos Aires olan, resmî dili İspanyolca olan Güney Amerika ülkesi
BAHAMALAR | Başkenti Nassau olan, resmî dili İngilizce olan Karayipler'deki adalar ülkesi
BAHREYN | Başkenti Manama olan, resmî dili Arapça olan Basra Körfezi ülkesi
BANGLADEŞ | Başkenti Dakka olan, resmî dili Bengalce olan Güney Asya ülkesi
BARBADOS | Başkenti Bridgetown olan, resmî dili İngilizce olan Karayipler ülkesi
BELÇİKA | Başkenti Brüksel olan, Felemenkçe, Fransızca ve Almanca resmî dillerine sahip Orta Avrupa ülkesi
BELİZE | Başkenti Belmopan olan, resmî dili İngilizce olan Kuzey Amerika ülkesi
BENİN | Başkenti Porto-Novo olan, resmî dili Fransızca olan Batı Afrika ülkesi
BELARUS | Başkenti Minsk olan, resmî dili Rusça olan Kuzey Avrupa ülkesi
BHUTAN | Başkenti Thimphu olan, resmî dili Dzongka olan Hint Anakarası ülkesi
BOLİVYA | Başkenti Sucre olan, resmî dilleri İspanyolca ve Keçuva olan Güney Amerika ülkesi
BOTSVANA | Başkenti Gaborone olan, pula para birimini kullanan Güney Afrika ülkesi
BREZİLYA | Başkenti Brasilia olan, resmî dili Portekizce olan ve Güney Amerika'da yer alan ülke
BRUNEİ | Başkenti Bandar Seri Begavan olan, resmî dili Malayca olan Borneo Adası ülkesi
BURUNDİ | Başkenti Gitega olan, resmî dilleri Fransızca ve Rundice olan Orta Afrika ülkesi
CEZAYİR | Başkenti kendi adıyla aynı olan, resmî dili Arapça olan Kuzey Afrika ülkesi
CİBUTİ | Başkenti kendi adıyla aynı olan, Arapça ve Fransızca konuşulan Doğu Afrika ülkesi
ÇAD | Başkenti Encemine olan, Fransızca ve Arapça konuşulan Orta Afrika ülkesi.
ÇEKYA | Başkenti Prag olan, resmî dili Çekçe olan ve Çek korunası kullanan Doğu Avrupa ülkesi
ÇİN | Başkenti Pekin olan, resmî dili Çince olan ve Doğu Asya'da yer alan ülke
GABON | Başkenti Libreville olan, resmî dili Fransızca olan Orta Afrika ülkesi
GAMBİYA | Başkenti Banjul olan, resmî dili İngilizce olan Batı Afrika ülkesi
GANA | Başkenti Akra olan, cedi para birimini kullanan Batı Afrika ülkesi
GİNE | Başkenti Konakri olan, resmî dili Fransızca olan Batı Afrika ülkesi
GUYANA | Başkenti Georgetown olan, resmî dili İngilizce olan Güney Amerika ülkesi
JAPONYA | Başkenti Tokyo olan, resmî dili Japonca olan ve yen para birimini kullanan Uzak Doğu ada ülkesi.
KANADA | Başkenti Ottawa olan, İngilizce ve Fransızca konuşulan Kuzey Amerika ülkesi
    `
};

// === YARDIMCI DÖNÜŞTÜRÜCÜLER ===
function toTurkishUpper(str) {
    return str
        .replace(/i/g, 'İ')
        .replace(/ı/g, 'I')
        .toUpperCase()
        .trim();
}

function inferDifficulty(word) {
    if (word.length <= 4) return 'easy';
    if (word.length <= 6) return 'medium';
    return 'hard';
}

function buildWordBankFromRaw(rawMap) {
    const bank = [];
    const seenWords = new Set();

    for (const [category, block] of Object.entries(rawMap)) {
        if (!block) continue;
        const lines = block.split('\n');

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || line.startsWith('//') || line.startsWith('#')) continue;

            const parts = line.split('|').map(p => p.trim());
            if (parts.length < 2) continue;

            const cleanWord = toTurkishUpper(parts[0]);
            const clue = parts[1];
            const explicitDiff = parts[2] ? parts[2].toLowerCase() : null;

            // Geçerlilik kontrolü: Tek kelime, 3-9 harf, Türkçe alfabe, tekrarsız
            if (
                cleanWord.length >= 3 &&
                cleanWord.length <= 9 &&
                /^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]+$/.test(cleanWord) &&
                clue.length > 0 &&
                !seenWords.has(cleanWord)
            ) {
                seenWords.add(cleanWord);
                bank.push({
                    word: cleanWord,
                    clue,
                    category,
                    difficulty: ['easy', 'medium', 'hard'].includes(explicitDiff)
                        ? explicitDiff
                        : inferDifficulty(cleanWord)
                });
            }
        }
    }

    return bank;
}

// Yerel kelime havuzunu oluştur
let WORD_BANK = buildWordBankFromRaw(RAW_WORDS);

// Google E-Tablolar CSV bağlantısı tanımlanmışsa canlı veriyi yükle
async function loadGoogleSheetsWords() {
    if (!GOOGLE_SHEETS_CSV_URL) return WORD_BANK;

    try {
        const response = await fetch(GOOGLE_SHEETS_CSV_URL);
        if (!response.ok) return WORD_BANK;

        const csvText = await response.text();
        const rows = csvText.split(/\r?\n/).slice(1); // Başlık satırını atla
        const dynamicRaw = { ...RAW_WORDS };

        for (const row of rows) {
            if (!row.trim()) continue;
            // Basit CSV ayrıştırma (virgül veya noktalı virgül)
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c =>
                c.replace(/^"|"$/g, '').trim()
            );

            if (cols.length >= 3) {
                const catKey = cols[0].toLowerCase();
                const word = cols[1];
                const clue = cols[2];
                const diff = cols[3] || '';

                if (!CATEGORIES[catKey]) {
                    CATEGORIES[catKey] = cols[0];
                }
                if (!dynamicRaw[catKey]) {
                    dynamicRaw[catKey] = '';
                }
                dynamicRaw[catKey] += `\n${word} | ${clue}${diff ? ' | ' + diff : ''}`;
            }
        }

        WORD_BANK = buildWordBankFromRaw(dynamicRaw);
        return WORD_BANK;
    } catch (err) {
        console.warn('Google Sheets verisi alınamadı, yerel WORD_BANK kullanılıyor:', err);
        return WORD_BANK;
    }
}