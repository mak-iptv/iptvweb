import React, { useState, useContext, createContext, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import * as axios from "./axios";
import { setInfo } from "./user_info";
import Cookies from "js-cookie";
import { initDb } from "./local-db";

const authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};

export function useProvideAuth() {
  const [auth, setAuth] = useState(0);
  const [loading, setLoading] = useState(false);

  // Kontrollo nëse përdoruesi është i loguar në ngarkimin fillestar
  useEffect(() => {
    const savedAuth = Cookies.get("auth");
    if (savedAuth === "1") {
      setAuth(1);
    }
  }, []);

  const signin = (dns, username, password, successFallback, failFallback) => {
    setLoading(true);
    
    // Konfiguro DNS-in
    if (dns) {
      axios.setDns(dns);
      Cookies.set("dns", dns, { expires: 365 });
    }

    // Ruaj kredencialet
    Cookies.set("username", username.trim(), { expires: 365 });
    Cookies.set("password", password.trim(), { expires: 365 });

    axios
      .post("player_api.php", {
        username: username.trim(),
        password: password.trim(),
      })
      .then((result) => {
        setLoading(false);
        
        // Normalizimi i përgjigjes
        const response = result.data || result.response?.data || result;
        
        if (response?.user_info) {
          handleLoginResponse(response, successFallback, failFallback);
        } else if (response?.title) {
          failFallback?.(response.title, response.body || "Gabim i panjohur");
        } else {
          failFallback?.("Gabim serveri", "Serveri nuk u përgjigj. Provo përsëri më vonë.");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("Login error:", err);
        
        // Trajtimi i gabimeve të ndryshme
        const errorData = err.response?.data;
        if (errorData?.user_info?.auth === 0) {
          failFallback?.("Llogaria nuk u gjet", getNoAccountMessage());
        } else {
          failFallback?.("Gabim serveri", "Serveri nuk u përgjigj. Provo përsëri më vonë.");
        }
      });
  };

  const handleLoginResponse = (result, successFallback, failFallback) => {
    // Trajtimi i IPTVEditor
    if (result.iptveditor) {
      axios.setDns(`${process.env.REACT_APP_IPTVEDITOR_API}webplayer`);
    }

    // Kontrollo autentifikimin
    if (result.user_info.auth === 0) {
      failFallback?.("Llogaria nuk u gjet", getNoAccountMessage());
      return;
    }

    // Kontrollo statusin e llogarisë
    if (result.user_info.status !== "Active") {
      const expDate = result.user_info.exp_date 
        ? new Date(parseInt(result.user_info.exp_date + "000")).toGMTString()
        : "data e panjohur";
      failFallback?.("Llogaria e skaduar", `Llogaria skadoi më ${expDate}`);
      return;
    }

    // Login i suksesshëm
    setAuth(1);
    Cookies.set("auth", "1", { expires: 365 });
    setInfo(result.user_info, result.server_info);
    initDb();
    successFallback?.();
  };

  const getNoAccountMessage = () => {
    let message = "Nuk u gjet asnjë llogari me këto kredenciale.";
    if (window.location.host.includes("iptveditor.com")) {
      message += "<br/>Për t'u identifikuar, përdor emrin e përdoruesit dhe fjalëkalimin e playlist-it të IPTVEditor, jo email-in tënd.";
    }
    return message;
  };

  const authLogin = (fallback) => {
    // Merr DNS nga cookie ose nga window.dns
    let dns = Cookies.get("dns");
    if (!dns && window.dns && window.dns.length > 0) {
      dns = window.dns;
    }

    const username = Cookies.get("username");
    const password = Cookies.get("password");

    if (username && password) {
      signin(dns, username, password, fallback);
    } else {
      console.log("No saved credentials found");
    }
  };

  const signout = (callback) => {
    setAuth(0);
    Cookies.remove("auth");
    // Opsionale: hiq edhe kredencialet nëse dëshironi
    // Cookies.remove("username");
    // Cookies.remove("password");
    // Cookies.remove("dns");
    callback?.();
  };

  const isAuth = () => {
    return auth === 1;
  };

  return {
    signin,
    signout,
    isAuth,
    authLogin,
    loading, // Ekspozo loading për UI
  };
}

export function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();
  
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.isAuth() ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login/",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}
