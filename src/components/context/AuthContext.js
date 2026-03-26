import React, { Component, useContext } from "react";
import { authApi } from "../../apis/AuthApi";
import { candidatsApi } from "../../apis/candidatsApi";

const AuthContext = React.createContext();

class AuthProvider extends Component {
  state = {
    user: null,
    tokenCheckInterval: null,
    hasAgendaReminder: false,
    isChronometerOpen: false,
    // Global unread messages count — readable by Dashboard (badge),
    // writable by Messages / MessagesAdmin via updateUnreadMessages().
    unreadMessagesCount: 0,
  };

  componentDidMount() {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      this.setState({ user: parsedUser });
      this.startTokenExpiryCheck();
      this.checkAgendaReminder(parsedUser);
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.tokenCheckInterval);
  }

  startTokenExpiryCheck = () => {
    this.checkTokenExpiry();
    const tokenCheckInterval = setInterval(this.checkTokenExpiry, 60000);
    this.setState({ tokenCheckInterval });
  };

  checkTokenExpiry = () => {
    let user = localStorage.getItem("user");
    if (!user) return;
    user = JSON.parse(user);
    if (Date.now() > user.data.exp * 1000) {
      this.userLogout();
    }
  };

  getUser = () => {
    return JSON.parse(localStorage.getItem("user"));
  };

  isUserAlertedToRenewSubscription = () => {
    let user = localStorage.getItem("user");
    if (!user) return;
    user = JSON.parse(user);
    const expiration = new Date(user.data.lock_date);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return expiration <= threeDaysFromNow;
  };

  userIsAuthenticated = () => {
    let user = localStorage.getItem("user");
    if (!user) return false;
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
      const matchingAgendas = agendas.data.filter((agenda) => {
        const firstReminder = new Date(agenda.remindTime);
        const eventTime = new Date(agenda.eventTime);
        return now >= firstReminder && now < eventTime;
      });
      const hasReminder = matchingAgendas.length > 0;
      this.setState({ hasAgendaReminder: hasReminder, reminderAgendas: matchingAgendas });
    } catch (error) {
      console.error("Error checking agenda reminder:", error);
    }
  };

  userLogout = () => {
    let user = localStorage.getItem("user");
    user = JSON.parse(user);

    if (localStorage.getItem("chronometerId")) {
      this.setState({ isChronometerOpen: true });
      setTimeout(() => {
        this.setState({ isChronometerOpen: false });
      }, 5000);
      return;
    }

    authApi.logout(user);
    localStorage.removeItem("user");
    localStorage.removeItem("chronometerId");
    localStorage.removeItem("filter_stat");

    this.setState({ user: null, unreadMessagesCount: 0 }, () => {
      clearInterval(this.state.tokenCheckInterval);
    });
    return true;
  };

  userIsAdmin = () => {
    let user = localStorage.getItem("user");
    user = JSON.parse(user);
    if (user.data.rol[0] === "ADMIN") return true;
    return false;
  };

  userIsCandidate = () => {
    let user = localStorage.getItem("user");
    if (user.data.sub[0] === "USER") return true;
    return false;
  };

  userHasRole = (role) => {
    const user = this.getUser();
    return user && user.data.rol.includes(role);
  };

  // ─── New: called by Messages / MessagesAdmin to keep the badge in sync ────────
  // Pass a number to set an exact count, or pass a function (prevCount) => newCount
  // for incremental updates (e.g. when SSE fires before a REST refresh completes).
  updateUnreadMessages = (valueOrUpdater) => {
    this.setState((prevState) => ({
      unreadMessagesCount:
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(prevState.unreadMessagesCount)
          : valueOrUpdater,
    }));
  };

  render() {
    const { children } = this.props;
    const {
      user,
      hasAgendaReminder,
      isChronometerOpen,
      reminderAgendas,
      unreadMessagesCount,
    } = this.state;
    const {
      getUser,
      userIsAuthenticated,
      userIsAdmin,
      userLogin,
      userLogout,
      userHasRole,
      isUserAlertedToRenewSubscription,
      updateUnreadMessages,
    } = this;

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
          hasAgendaReminder,
          isChronometerOpen,
          reminderAgendas,
          // Shared unread count — Dashboard reads, message pages write
          unreadMessagesCount,
          updateUnreadMessages,
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