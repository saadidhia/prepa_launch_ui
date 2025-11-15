import React, { useState, useEffect } from "react";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { Features } from "./components/features";
import { About } from "./components/about";
import { Services } from "./components/services";
import { Books } from "./components/books";
import { Testimonials } from "./components/testimonials";
import { Team } from "./components/Team";
import { Contact } from "./components/contact";
import { AuthProvider } from './components/context/AuthContext';
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Connexion } from './components/connexion';
import { Profile } from './components/user/Profile'
import InterestedForm from './components/interestedForm';
import Dashboard from "./components/dashboard";
import PrivateRoute from './PrivateRoute';
import navigations from "./Navigations";
import subjects from "./subjects"
import points from "./points"
import concours from "./concours"

import "./App.css";
import { ChronometerProvider } from "./components/context/ChronometerContext";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});


  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  return (
    <AuthProvider>
    <ChronometerProvider>
    
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <Navigation />
                <Header data={landingPageData.Header} />
                <Features data={landingPageData.Features} />
                <About data={landingPageData.About} />
                <Services data={landingPageData.Services} />
                <Books data={landingPageData.Gallery} />
                <Testimonials data={landingPageData.Testimonials} />
                <Team data={landingPageData.Team} />
                <Contact data={landingPageData.Contact} />
              </div>
            }
          />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/interested/form" element={<InterestedForm />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} >
            <Route path="/dashboard/profile" exact element={<Profile />} />
            {navigations.map((navElement, index) => (
              <Route
                key={index}
                exact
                path={navElement.link}
                element={
                  <PrivateRoute requiredRole={navElement.role.toUpperCase()}>
                    <navElement.component />
                  </PrivateRoute>
                } />
            ))}
            {subjects.map((subject, index) => (
              <Route
                key={index}
                exact
                path={`/dashboard/cours/${subject.links}`}
                element={<PrivateRoute requiredRole="USER">{subject.components}</PrivateRoute>}
              />
            ))}
            {points.map((point) =>
              subjects.map((subject, index) => (
                <Route
                  key={`${point.links}-${index}`}
                  exact
                  path={`/dashboard/series/${point.link}/${subject.links}`}
                  element={<PrivateRoute requiredRole="USER">{subject.components}</PrivateRoute>}
                />
              ))
            )
            }
            {subjects.map((subject, index) => (
              <Route
                key={index}
                exact
                path={`/dashboard/exams/ds/${subject.links}`}
                element={<PrivateRoute requiredRole="USER">{subject.components}</PrivateRoute>}
              />
            ))}

            {subjects.map((subject, index) => (
              <Route
                key={index}
                exact
                path={`/dashboard/exams/exam/${subject.links}`}
                element={<PrivateRoute requiredRole="USER">{subject.components}</PrivateRoute>}
              />
            ))}

            {subjects.map((subject, index) => (
              <Route
                key={index}
                exact
                path={`/dashboard/resumes/${subject.links}`}
                element={<PrivateRoute requiredRole="USER">{subject.components}</PrivateRoute>}
              />
            ))}
            {concours.map((concour) =>
              subjects.map((subject, index) => (
                <Route
                  key={`${concour.link}-${index}`}
                  exact
                  path={`/dashboard/concours/${concour.link}/${subject.links}`}
                  element={<PrivateRoute requiredRole="USER">{subject.components}</PrivateRoute>}
                />
              ))
            )
            }
          </Route>
        </Routes>
      </Router>
      </ChronometerProvider>
    </AuthProvider>
    
  );
};

export default App;
