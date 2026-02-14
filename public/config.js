/*----- Player name -----*/
window.playername = "My Xtream Player"; // Emri i player-it që shfaqet në UI

/*----- DNS Configuration -----*/
window.dns = ""; // DNS do të vendoset nga user (p.sh., "http://example.com:8080")
// Formati i pritur: "http://domain.com:port" ose "https://domain.com"

/*----- CORS Proxy Settings -----*/
window.cors = false; 
// true = përdor proxy.php për të anashkaluar CORS
// false = lidhet direkt me serverin (nëse lejon CORS)

/*----- HTTPS Redirection -----*/
window.https = false;
// true = detyron përdorimin e HTTPS
// false = lejon HTTP
// Përdoret për redirect automatik te protokolli i sigurt

/*----- TMDB API Configuration [OPTIONAL] -----*/
window.tmdb = ""; 
// API Key për The Movie Database
// Përdoret për të marrë informacion shtesë të filmave (postera, përshkrime, etj.)
// Merrni API Key nga: https://www.themoviedb.org/documentation/api

/*----- Default Settings [OPTIONAL] -----*/
window.defaultSettings = {
    theme: "dark", // "dark" ose "light"
    language: "sq", // Kodi i gjuhës (sq, en, it, etj.)
    autoplay: true, // Autoplay për kanalet live
    preferredPlayer: "hls.js" // "hls.js", "video.js", ose "native"
};

/*----- Debug Mode [OPTIONAL] -----*/
window.debug = false;
// true = aktivizon logging për debugging
// false = çaktivizon logging-in

/*----- Version Info -----*/
window.appVersion = "1.0.0"; // Versioni i aplikacionit

/*----- Player Buffer Settings [OPTIONAL] -----*/
window.playerConfig = {
    bufferSize: 30, // Madhësia e buffer-it në sekonda
    maxBufferSize: 60, // Buffer maksimal
    lowLatency: false // Përdor modalitetin low latency për streaming
};
