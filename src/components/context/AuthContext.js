import React, { Component, useContext } from "react";
import { authApi } from "../../apis/AuthApi";
import { candidatsApi } from "../../apis/candidatsApi";

const AuthContext = React.createContext();

class AuthProvider extends Component {
  state = {
    user: null,
    tokenCheckInterval: null,
    hasAgendaReminder: false, // new flag
  };

   componentDidMount() {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      this.setState({ user: parsedUser });
      this.startTokenExpiryCheck();
      this.checkAgendaReminder(parsedUser); // check agenda when app loads
    }
  }

  componentWillUnmount() {
    // Clear the interval when component unmounts
    clearInterval(this.state.tokenCheckInterval);
  }

  startTokenExpiryCheck = () => {
    // Initial check
    this.checkTokenExpiry();

    // Check every minute
    const tokenCheckInterval = setInterval(this.checkTokenExpiry, 60000); // 1 minute interval
    this.setState({ tokenCheckInterval });
  };

  checkTokenExpiry = () => {
    let user = localStorage.getItem("user");
    if (!user) {
      return;
    }
    user = JSON.parse(user);

    if (Date.now() > user.data.exp * 1000) {
      this.userLogout();
    }
  };

  getUser = () => {
    return JSON.parse(localStorage.getItem("user"));
  };

  isUserAlertedToRenewSubscription = ()=> {
    let user = localStorage.getItem("user");
    if (!user) {
      return;
    }
    user = JSON.parse(user);
    const expiration = new Date(user.data.lock_date);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    return expiration <= threeDaysFromNow;
    
  }

  userIsAuthenticated = () => {
    let user = localStorage.getItem("user");
    if (!user) {
      return false;
    }
    user = JSON.parse(user);

    return true;
  };

  userLogin = async (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    this.setState({ user });
    this.startTokenExpiryCheck();
    await this.checkAgendaReminder(user);
  };

    checkAgendaReminder = async (user) => {
    try {
      const agendas = await candidatsApi.getAgendas(user);
      console.log("Agendas fetched for reminder check:", agendas);
      const now = new Date();

      const hasReminder = agendas.data.some((agenda) => {
        const firstReminder = new Date(agenda.remindTime);
        const eventTime = new Date(agenda.eventTime);
        console.log("Checking agenda:", agenda, "First Reminder:", firstReminder, "Event Time:", eventTime, "Now:", now);
        return now >= firstReminder && now < eventTime;
      });

      this.setState({ hasAgendaReminder: hasReminder });
    } catch (error) {
      console.error("Error checking agenda reminder:", error);
    }
  };

  userLogout = () => {
    let user = localStorage.getItem("user");
    user = JSON.parse(user);
 
      authApi.logout(user);
      localStorage.removeItem("user");
      localStorage.removeItem("chronometerId");
      localStorage.removeItem("filter_stat")
      
      this.setState({ user: null }, () => {
        clearInterval(this.state.tokenCheckInterval);
      });
      return true;
    
    

    // Clear the token expiry check interval on logout
  };

  userIsAdmin = () => {
    let user = localStorage.getItem("user");
    user = JSON.parse(user);
    console.log(user);
    if (user.data.rol[0] === "ADMIN") {
      return true;
    }
    return false;
  };

  userIsCandidate = () => {
    let user = localStorage.getItem("user");
    if (user.data.sub[0] === "USER") {
      return true;
    }
    return false;
  };

  userHasRole = (role) => {
    const user = this.getUser();
    return user && user.data.rol.includes(role);
  };

  render() {
    const { children } = this.props;
    const { user ,  hasAgendaReminder } = this.state;
    const { getUser, userIsAuthenticated, userIsAdmin, userLogin, userLogout, userHasRole, isUserAlertedToRenewSubscription,  } =
      this;

    return (
      <AuthContext.Provider
        value={{
          user,
          getUser,
          userIsAuthenticated,
          userIsAdmin,
          userLogin,
          userLogout,
          userHasRole,
          isUserAlertedToRenewSubscription,
          hasAgendaReminder
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
}

export default AuthContext;

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider };
