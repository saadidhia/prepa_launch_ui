import React, { useState } from "react";
import { authApi } from '../../apis/AuthApi';
import { handleLogError } from '../../misc/Helpers';
import { useAuth } from '../context/AuthContext';
import '../../assets/css/login.css';

export function SignUp() {
  const Auth = useAuth();
  const admin = Auth.getUser();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("BAC");
  const [field, setField] = useState("MATH");
  const [numberPhone, setNumberPhone] = useState("");
  const [gender, setGender] = useState("MALE");
  const [role, setRole] = useState("USER");
  const [duration, setDuration] = useState("ONE");
  const [startDate, setStartDate] = useState("");
  const [price, setPrice] = useState("");
  const [option, setOption] = useState("ALLEMAND");
  const [city, setCity] = useState("TUNIS");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(username && password && name && email && level && field && numberPhone && gender && role && option && price && city)) {
      return;
    }

    if (!/^[a-zA-Z]/.test(username)){
      setErrorMessage("Username must start with a letter.");
      return;
    }

    if (!/^[a-zA-Z]/.test(name)){
      setErrorMessage("Name must start with a letter.");
      return;
    }
    if (numberPhone && !/^\d{8}$/.test(numberPhone)){
      setErrorMessage("Phone number must be 8 digits.");
      return;
    }

    const user = {
      username,
      password,
      name,
      email,
      level,
      field,
      numberPhone,
      gender,
      role,
      option,
      city,
      subscriptionDto: {
        price
      }
    };

    try {
      await authApi.signup(user, admin);
      setSuccessMessage('User is created');
    } catch (error) {
      const data = error?.response?.data;
      const message = typeof data === "string"
        ? data
        : data?.message || data?.error || "An error occurred while creating the user.";
      setErrorMessage(message);
      handleLogError(error);
    }
  };

  const cities = [
    { value: "TUNIS", label: "Tunis" },
    { value: "ARIANA", label: "Ariana" },
    { value: "BEN_AROUS", label: "Ben Arous" },
    { value: "MANOUBA", label: "Manouba" },
    { value: "NABEUL", label: "Nabeul" },
    { value: "ZAGHOUAN", label: "Zaghouan" },
    { value: "BIZERTE", label: "Bizerte" },
    { value: "BEJA", label: "Béja" },
    { value: "JENDOUBA", label: "Jendouba" },
    { value: "KEF", label: "Le Kef" },
    { value: "SILIANA", label: "Siliana" },
    { value: "SOUSSE", label: "Sousse" },
    { value: "MONASTIR", label: "Monastir" },
    { value: "MAHDIA", label: "Mahdia" },
    { value: "SFAX", label: "Sfax" },
    { value: "KAIROUAN", label: "Kairouan" },
    { value: "KASSERINE", label: "Kasserine" },
    { value: "SIDI_BOUZID", label: "Sidi Bouzid" },
    { value: "GABES", label: "Gabès" },
    { value: "MEDENINE", label: "Médenine" },
    { value: "TATAOUINE", label: "Tataouine" },
    { value: "GAFSA", label: "Gafsa" },
    { value: "TOZEUR", label: "Tozeur" },
    { value: "KEBILI", label: "Kébili" },
   
  ];

  return (
    <div className="Auth-form-container">
      <form className="Auth-form" onSubmit={handleSubmit}>
        <div className="Auth-form-content">
          <h3 className="Auth-form-title">Sign Up</h3>

          <div className="form-group mt-3">
            <label>Role</label>
            <select className="form-control mt-1" onChange={(e) => setRole(e.target.value)} value={role}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="form-group mt-3">
            <label>Username</label>
            <input
              type="text"
              className="form-control mt-1"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control mt-1"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <label>Name</label>
            <input
              type="text"
              className="form-control mt-1"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control mt-1"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <label>Level</label>
            <select className="form-control mt-1" onChange={(e) => setLevel(e.target.value)} value={level}>
              <option value="troisieme">troisieme</option>
              <option value="bac">bac</option>
            </select>
          </div>
          <div className="form-group mt-3">
            <label>Field</label>
            <select className="form-control mt-1" onChange={(e) => setField(e.target.value)} value={field}>
              <option value="MATH">SECTION MATH</option>
              <option value="SCIENCE">SECTION SCIENCE</option>
              <option value="TECH">SECTION TECHNIQUE</option>
              <option value="INFO">SECTION INFORMATIQUE</option>
              <option value="ECO">SECTION ECONOMIE</option>
              <option value="LETTER">SECTION LETTER</option>
              <option value="SPORT">SECTION SPORT</option>
            </select>
          </div>
          <div className="form-group mt-3">
            <label>Option</label>
            <select className="form-control mt-1" onChange={(e) => setOption(e.target.value)} value={option}>
              <option value="ALLEMAND">Allemand</option>
              <option value="ESPAGNOL">Espagnol</option>
              <option value="ITALIEN">Italien</option>
              <option value="TURC">Turc</option>
              <option value="CHINOIS">Chinois</option>
              <option value="DESSIN">Dessin</option>
            </select>
          </div>
          <div className="form-group mt-3">
            <label>Phone Number</label>
            <input
              type="tel"
              className="form-control mt-1"
              placeholder="Phone Number"
              value={numberPhone}
              onChange={(e) => setNumberPhone(e.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <label>Gender</label>
            <select className="form-control mt-1" onChange={(e) => setGender(e.target.value)} value={gender}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* City Field */}
          <div className="form-group mt-3">
            <label>City</label>
            <select className="form-control mt-1" onChange={(e) => setCity(e.target.value)} value={city}>
              {cities.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group mt-3">
            <label>Subscription Price</label>
            <input
              type="number"
              className="form-control mt-1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              placeholder="Enter price"
            />
          </div>

          <div className="d-grid gap-2 mt-3">
            <button type="submit" className="btn btn-primary">
              Sign Up
            </button>
          </div>
          {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
        </div>
        {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
      </form>
    </div>
  );
}