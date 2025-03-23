import { extractDomain } from "./functions";

type Platform = {
    name: string; // Nazwa strony/platformy
    url: string; // Adres strony
    logo: string; // Ścieżka do logo lub URL favicon
  };
  
  const platforms: Platform[] = [
    // Polska - popularne serwisy
    { name: "Google", url: "google.pl", logo: "https://www.google.com/favicon.ico" },
    { name: "YouTube", url: "youtube.com", logo: "https://www.youtube.com/favicon.ico" },
    { name: "Facebook", url: "facebook.com", logo: "https://www.facebook.com/favicon.ico" },
    { name: "Allegro", url: "allegro.pl", logo: "https://www.allegro.pl/favicon.ico" },
    { name: "Onet", url: "onet.pl", logo: "https://www.onet.pl/favicon.ico" },
    { name: "WP", url: "wp.pl", logo: "https://www.wp.pl/favicon.ico" },
    { name: "OLX", url: "olx.pl", logo: "https://www.olx.pl/favicon.ico" },
    { name: "Instagram", url: "instagram.com", logo: "https://www.instagram.com/favicon.ico" },
    { name: "Twitter (X)", url: "twitter.com", logo: "https://www.twitter.com/favicon.ico" },
    { name: "X", url: "x.com", logo: "https://www.twitter.com/favicon.ico" },
    { name: "LinkedIn", url: "linkedin.com", logo: "https://www.linkedin.com/favicon.ico" },
    { name: "Ceneo", url: "ceneo.pl", logo: "https://www.ceneo.pl/favicon.ico" },
    { name: "Interia", url: "interia.pl", logo: "https://www.interia.pl/favicon.ico" },
    { name: "Gazeta.pl", url: "gazeta.pl", logo: "https://www.gazeta.pl/favicon.ico" },
    { name: "TVN24", url: "tvn24.pl", logo: "https://www.tvn24.pl/favicon.ico" },
    { name: "mBank", url: "mbank.pl", logo: "https://www.mbank.pl/asset/dolphin_404_mass.svg" },
    { name: "PKO BP", url: "pkobp.pl", logo: "https://www.pkobp.pl/static/redesign/_front/_img/_layout/favicon_new.png" },
    { name: "ING Bank", url: "ing.pl", logo: "https://www.ing.pl/favicon.ico" },
    { name: "Zalando", url: "zalando.pl", logo: "https://www.zalando.pl/favicon.ico" },
    { name: "Empik", url: "empik.com", logo: "https://www.empik.com/favicon.ico" },
    { name: "Rossmann", url: "rossmann.pl", logo: "https://www.rossmann.pl/favicon.ico" },
    { name: "Pepco", url: "pepco.pl", logo: "https://www.pepco.pl/favicon.ico" },
    { name: "Lidl", url: "lidl.pl", logo: "https://www.lidl.pl/cdn/assets/logos/1.0.1/lidl-logo-shop-cdn.svg" },
    { name: "Media Expert", url: "mediaexpert.pl", logo: "https://www.mediaexpert.pl/favicon.ico" },
    { name: "RTV Euro AGD", url: "euro.com.pl", logo: "https://www.euro.com.pl/favicon.ico" },
    { name: "Pyszne.pl", url: "pyszne.pl", logo: "https://www.pyszne.pl/favicon.ico" },
    { name: "Filmweb", url: "filmweb.pl", logo: "https://www.filmweb.pl/favicon.ico" },
    { name: "Player", url: "player.pl", logo: "https://www.player.pl/favicon.ico" },
    { name: "VOD.pl", url: "vod.pl", logo: "https://www.vod.pl/favicon.ico" },
    { name: "Santander", url: "santander.pl", logo: "https://www.santander.pl/favicon.ico" },
    { name: "AliExpress", url: "aliexpress.com", logo: "https://www.aliexpress.com/favicon.ico" },
  
    // Globalne platformy
    { name: "Amazon", url: "amazon.com", logo: "https://www.amazon.com/favicon.ico" },
    { name: "Wikipedia", url: "wikipedia.org", logo: "https://www.wikipedia.org/favicon.ico" },
    { name: "Reddit", url: "reddit.com", logo: "https://www.reddit.com/favicon.ico" },
    { name: "Netflix", url: "netflix.com", logo: "https://www.netflix.com/favicon.ico" },
    { name: "TikTok", url: "tiktok.com", logo: "https://www.tiktok.com/favicon.ico" },
    { name: "WhatsApp", url: "whatsapp.com", logo: "https://www.whatsapp.com/favicon.ico" },
    { name: "Pinterest", url: "pinterest.com", logo: "https://www.pinterest.com/favicon.ico" },
    { name: "eBay", url: "ebay.com", logo: "https://www.ebay.com/favicon.ico" },
    { name: "Gmail", url: "https://mail.google.com", logo: "https://mail.google.com/favicon.ico" },
    { name: "Microsoft", url: "microsoft.com", logo: "https://www.microsoft.com/favicon.ico" },
    { name: "Yahoo", url: "yahoo.com", logo: "https://www.yahoo.com/favicon.ico" },
    { name: "Spotify", url: "spotify.com", logo: "https://www.spotify.com/favicon.ico" },
    { name: "Twitch", url: "twitch.tv", logo: "https://www.twitch.tv/favicon.ico" },
    { name: "Discord", url: "discord.com", logo: "https://www.discord.com/favicon.ico" },
    { name: "GitHub", url: "github.com", logo: "https://www.github.com/favicon.ico" },
    { name: "PayPal", url: "paypal.com", logo: "https://www.paypal.com/favicon.ico" },
    { name: "Dropbox", url: "dropbox.com", logo: "https://www.dropbox.com/favicon.ico" },
    { name: "Slack", url: "slack.com", logo: "https://www.slack.com/favicon.ico" },
    { name: "Zoom", url: "zoom.us", logo: "https://www.zoom.us/favicon.ico" },
    { name: "Apple", url: "apple.com", logo: "https://www.apple.com/favicon.ico" },
    { name: "Adobe", url: "adobe.com", logo: "https://www.adobe.com/favicon.ico" },
    { name: "Trello", url: "trello.com", logo: "https://www.trello.com/favicon.ico" },
    { name: "Canva", url: "canva.com", logo: "https://www.canva.com/favicon.ico" },
    { name: "Figma", url: "figma.com", logo: "https://www.figma.com/favicon.ico" },
    { name: "Booking.com", url: "booking.com", logo: "https://www.booking.com/favicon.ico" },
    { name: "Airbnb", url: "airbnb.com", logo: "https://www.airbnb.com/favicon.ico" },
    { name: "Uber", url: "uber.com", logo: "https://www.uber.com/favicon.ico" },
    { name: "Steam", url: "https://store.steampowered.com", logo: "https://store.steampowered.com/favicon.ico" },
    { name: "Vimeo", url: "vimeo.com", logo: "https://www.vimeo.com/favicon.ico" },
    { name: "SoundCloud", url: "soundcloud.com", logo: "https://www.soundcloud.com/favicon.ico" },
    { name: "Hulu", url: "hulu.com", logo: "https://www.hulu.com/favicon.ico" },
    { name: "Disney+", url: "disneyplus.com", logo: "https://www.disneyplus.com/favicon.ico" },
    { name: "HBO Max", url: "hbomax.com", logo: "https://www.hbomax.com/favicon.ico" },
    { name: "Etsy", url: "etsy.com", logo: "https://www.etsy.com/favicon.ico" },
    { name: "Walmart", url: "walmart.com", logo: "https://www.walmart.com/favicon.ico" },
    { name: "Target", url: "target.com", logo: "https://www.target.com/favicon.ico" },
    { name: "Shopify", url: "shopify.com", logo: "https://www.shopify.com/favicon.ico" },
    { name: "Patreon", url: "patreon.com", logo: "https://www.patreon.com/favicon.ico" },
    { name: "Medium", url: "medium.com", logo: "https://www.medium.com/favicon.ico" },
    { name: "Notion", url: "notion.so", logo: "https://www.notion.so/favicon.ico" },
    { name: "Asana", url: "asana.com", logo: "https://www.asana.com/favicon.ico" },
    { name: "Evernote", url: "evernote.com", logo: "https://www.evernote.com/favicon.ico" },
    { name: "Dribbble", url: "dribbble.com", logo: "https://www.dribbble.com/favicon.ico" },
    { name: "Behance", url: "behance.net", logo: "https://www.behance.net/favicon.ico" },
    { name: "Skype", url: "skype.com", logo: "https://www.skype.com/favicon.ico" },
    { name: "Telegram", url: "telegram.org", logo: "https://www.telegram.org/favicon.ico" },
    { name: "Signal", url: "signal.org", logo: "https://www.signal.org/favicon.ico" },
    { name: "WeChat", url: "wechat.com", logo: "https://www.wechat.com/favicon.ico" },
    { name: "Viber", url: "viber.com", logo: "https://www.viber.com/favicon.ico" },
    { name: "Snapchat", url: "snapchat.com", logo: "https://www.snapchat.com/favicon.ico" },
    { name: "Quora", url: "quora.com", logo: "https://www.quora.com/favicon.ico" },
    { name: "Tumblr", url: "tumblr.com", logo: "https://www.tumblr.com/favicon.ico" },
    { name: "WordPress", url: "wordpress.com", logo: "https://www.wordpress.com/favicon.ico" },
    { name: "Squarespace", url: "squarespace.com", logo: "https://www.squarespace.com/favicon.ico" },
    { name: "Wix", url: "wix.com", logo: "https://www.wix.com/favicon.ico" },
    { name: "Coursera", url: "coursera.org", logo: "https://www.coursera.org/favicon.ico" },
    { name: "Udemy", url: "udemy.com", logo: "https://www.udemy.com/favicon.ico" },
    { name: "Khan Academy", url: "khanacademy.org", logo: "https://www.khanacademy.org/favicon.ico" },
    { name: "Duolingo", url: "duolingo.com", logo: "https://www.duolingo.com/favicon.ico" },
    { name: "Robinhood", url: "robinhood.com", logo: "https://www.robinhood.com/favicon.ico" },
    { name: "Binance", url: "binance.com", logo: "https://www.binance.com/favicon.ico" },
    { name: "Coinbase", url: "coinbase.com", logo: "https://www.coinbase.com/favicon.ico" },
    { name: "Stripe", url: "stripe.com", logo: "https://www.stripe.com/favicon.ico" },
    { name: "Venmo", url: "venmo.com", logo: "https://www.venmo.com/favicon.ico" },
    { name: "TripAdvisor", url: "tripadvisor.com", logo: "https://www.tripadvisor.com/favicon.ico" },
    { name: "Expedia", url: "expedia.com", logo: "https://www.expedia.com/favicon.ico" },
    { name: "Reddit", url: "reddit.com", logo: "https://www.reddit.com/favicon.ico" },
    { name: "BBC", url: "bbc.com", logo: "https://www.bbc.com/favicon.ico" },
    { name: "CNN", url: "cnn.com", logo: "https://www.cnn.com/favicon.ico" },
    { name: "int", url: "int.pl", logo: "https://poczta.iplsc.com/n/public/images/skins/int/favicons/favicon.ico" },
  ];

  export const findIconUrl = (input: string): string => {
    // Usuń spacje i zmień na małe litery dla niewrażliwości na wielkość liter
    const normalizedInput = extractDomain(input.replace(/\s+/g, "").toLowerCase());
    
    // Znajdź pasującą platformę na podstawie nazwy lub URL
    const matchedPlatform = platforms.find((platform) => {
      const normalizedName = platform.name.replace(/\s+/g, "").toLowerCase();
      const normalizedUrl = platform.url.replace(/\s+/g, "").toLowerCase();
      return normalizedName.includes(normalizedInput) || normalizedUrl.includes(normalizedInput);
    });
  
    // Zwróć URL ikony lub domyślną ikonę, jeśli nie znaleziono
    return matchedPlatform ? matchedPlatform.logo : "";
  };