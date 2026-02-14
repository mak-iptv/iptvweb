import Axios from "axios";
import Cookies from 'js-cookie';
import qs from "qs";

let dns = null;
let proxyRequired = window.cors === true; // Kontroll më i saktë

// Inicializimi i DNS nëse ekziston
if (window.dns) {
    setDns(window.dns);
}

/* --------- GET REQUEST --------- */
export async function get(url, options = {}) {
    if (!dns) {
        console.error('DNS not configured');
        return { error: true, message: 'DNS not configured' };
    }

    let uri = buildUrl(url);
    
    try {
        const response = await Axios.get(uri, { 
            timeout: options.timeout || 25000,
            ...options
        });
        return { data: response.data, error: false };
    } catch (err) {
        console.error('GET request failed:', err);
        return { 
            error: true, 
            message: err.message,
            response: err.response,
            status: err.response?.status 
        };
    }
}

/* --------- POST REQUEST (Xtream Login) --------- */
export async function post(url, params = {}, useProxy = false) {
    if (!dns) {
        console.error('DNS not configured');
        return { error: true, message: 'DNS not configured' };
    }

    let uri = buildUrl(url, useProxy);
    
    try {
        const response = await Axios.post(
            uri,
            qs.stringify(params),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                timeout: 25000
            }
        );
        
        return { data: response.data, error: false };
    } catch (err) {
        console.error('POST request failed:', err);
        
        // Përpjekje pa proxy nëse dështoi me proxy
        if (!useProxy && !proxyRequired && !err.response) {
            console.log('Retrying without proxy...');
            return post(url, params, true);
        }
        
        return { 
            error: true, 
            message: err.message,
            response: err.response,
            status: err.response?.status 
        };
    }
}

/* --------- Helper për ndërtimin e URL-së --------- */
function buildUrl(url, forceProxy = false) {
    if (!dns) return null;
    
    let uri = dns + url;
    
    if (proxyRequired || forceProxy) {
        uri = "/proxy.php?url=" + encodeURIComponent(uri);
    }
    
    return uri;
}

/* --------- SET DNS --------- */
export function setDns(data) {
    if (!data) return false;

    // Pastro hapësirat dhe shto slash në fund
    data = data.trim();
    if (data[data.length - 1] !== "/") {
        data += "/";
    }

    dns = data;
    
    try {
        Cookies.set("dns", data, { expires: 365 });
        return true;
    } catch (err) {
        console.error('Failed to set DNS cookie:', err);
        return false;
    }
}

/* --------- GET DNS --------- */
export function getDns() {
    return dns;
}

/* --------- GET DNS FROM COOKIE --------- */
export function getDnsFromCookie() {
    return Cookies.get("dns") || null;
}

/* --------- LOAD DNS FROM COOKIE --------- */
export function loadDnsFromCookie() {
    const cookieDns = Cookies.get("dns");
    if (cookieDns) {
        setDns(cookieDns);
        return true;
    }
    return false;
}

/* --------- CHECK IF DNS IS CONFIGURED --------- */
export function isDnsConfigured() {
    return dns !== null;
}

/* --------- GET IPTVEDITOR FLAG (always false) --------- */
export function getIsIptveditor() {
    return false;
}

/* --------- CLEAR DNS --------- */
export function clearDns() {
    dns = null;
    Cookies.remove("dns");
}
