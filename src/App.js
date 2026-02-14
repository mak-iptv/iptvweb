import React, { useEffect } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { PrivateRoute, ProvideAuth } from "./other/auth";
import "./App.css";

import NavBar from "./components/NavBar";
import MainMenu from "./components/MainMenu/MainMenu";
import AccountInfo from "./components/AccountInfo";
import Login from "./components/Login";

import LateralBar from "./components/LateralBar/LateralBar";

import MainLive from "./components/Live/MainLive";
import Groups from "./components/Group/Groups";
import Search from "./components/Search/Search";
import EpgFullListing from "./components/Epg-Fullscreen/EpgFullListing";

import MainVod from "./components/Vod/MainVod";

import { useDispatch } from "react-redux";
import { setTimer60 } from "./actions/timer60";
import { setTimer5 } from "./actions/timer5";

function App() {
  const dispatch = useDispatch();

  // Timer intervals in useEffect to avoid Hooks warnings
  useEffect(() => {
    const interval60 = setInterval(() => dispatch(setTimer60()), 50000);
    const interval5 = setInterval(() => dispatch(setTimer5()), 5000);

    return () => {
      clearInterval(interval60);
      clearInterval(interval5);
    };
  }, [dispatch]);

  // HTTPS redirect logic in useEffect
  useEffect(() => {
    if (typeof window.https !== "undefined") {
      if (window.location.protocol !== "https:" && window.https === true) {
        window.location.href = window.location.href.replace("http", "https");
      } else if (
        window.location.protocol === "https:" &&
        window.https === false
      ) {
        window.location.href = window.location.href.replace("https", "http");
      }
    }
  }, []);

  // Get hash URL for Login component
  const url = window.location.hash.replace("#", "");

  return (
    <ProvideAuth>
      <Router>
        <Switch>
          {/* Rrugët publike */}
          <Route path="/login">
            <Login url={url} />
          </Route>
          
          {/* Rrugët private */}
          <PrivateRoute exact path="/">
            <MainMenu />
          </PrivateRoute>
          
          <PrivateRoute exact path="/info">
            <AccountInfo />
          </PrivateRoute>
          
          {/* Rrugët me NavBar dhe LateralBar */}
          <Route path="/:playingMode">
            <NavBar />
            <LateralBar />
            
            <Switch>
              {/* Rrugët për EPG Fullscreen */}
              <PrivateRoute exact path="/live/category/:category/tvguide">
                <EpgFullListing />
              </PrivateRoute>
              <PrivateRoute exact path="/live/category/:category/tvguide/:date">
                <EpgFullListing />
              </PrivateRoute>
              
              {/* Rrugët për Search */}
              <PrivateRoute exact path="/:playingMode/category/:category/search">
                <Search />
              </PrivateRoute>
              <PrivateRoute exact path="/:playingMode/search">
                <Search />
              </PrivateRoute>
              
              {/* Rrugët për Groups */}
              <PrivateRoute exact path="/:playingMode/category">
                <Groups />
              </PrivateRoute>
              
              {/* Rrugët për Live */}
              <PrivateRoute path="/live/category/:category">
                <MainLive />
              </PrivateRoute>
              <PrivateRoute path="/live">
                <MainLive />
              </PrivateRoute>
              
              {/* Rrugët për Vod */}
              <PrivateRoute path="/:playingMode/category/:category">
                <MainVod />
              </PrivateRoute>
              <PrivateRoute path="/:playingMode">
                <MainVod />
              </PrivateRoute>
            </Switch>
          </Route>
        </Switch>
      </Router>
    </ProvideAuth>
  );
}

export default App;
