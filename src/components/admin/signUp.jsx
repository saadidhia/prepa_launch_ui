import React, { useState } from "react"
//import AuthContext from "./context/AuthContext"
import { authApi } from '../../apis/AuthApi'
import { handleLogError } from '../../misc/Helpers'
//import { errors } from '../constants'
//import { Navigate } from "react-router-dom"
import { useAuth } from '../context/AuthContext'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-calendar/dist/Calendar.css";

import '../../assets/css/login.css'



export function SignUp() {
  const Auth = useAuth()
  const admin = Auth.getUser()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [level, setLevel] = useState("PREMIERE");
  const [field, setField] = useState("MP")
  const [startDate, setStartDate] = useState(new Date()); // Initialize with the current date
  const [months, setMonths] = useState(0);
  const [numberPhone, setNumberPhone] = useState(0);
  const [gender, setGender] = useState("MALE")


  const [successmessage, setSuccessMessage] = useState("")

  const handleMonthsChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setMonths(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!(username && password && name && email && level && field && startDate && months && numberPhone && gender)) {

      return
    }


    const user = { username, password, name, email, level, field, startDate, months, numberPhone, gender  }
    console.log("user", user)

    try {

      await authApi.signup(user, admin)
      setSuccessMessage('User Is Created')


    } catch (error) {
      handleLogError(error)
      /*if (error.response && error.response.data) {
        const errorData = error.response.data
        let errorMessage = 'Invalid fields'
        if (errorData.status === 409) {
          errorMessage = errorData.message
        } else if (errorData.status === 400) {
          errorMessage = errorData.errors[0].defaultMessage
        }
       
        
      }*/
    }
  }

  return (
    (
      <div className="Auth-form-container">
        <form className="Auth-form" onSubmit={handleSubmit}>
          <div className="Auth-form-content">
            <h3 className="Auth-form-title">
              <img /*src={logo}*/ height="350" weight="400" alt="Prepa Launch Logo" />
            </h3>

            <div className="form-group mt-3">
              <label >User name</label>
              <input
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                className="form-control mt-1"
                placeholder="User Name"
              />
            </div>
            <div className="form-group mt-3">
              <label >mot de passe</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="text"
                className="form-control mt-1"
                placeholder="Mot de passe"
              />
            </div>
            <div className="form-group mt-3">
              <label >nom</label>
              <input
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="form-control mt-1"
                placeholder="Nom"
              />
            </div>
            <div className="form-group mt-3">
              <label >Email</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="form-control mt-1"
                placeholder="Email"
              />
            </div>
            <div className="form-group mt-3">
              <label >Gender</label>
              <select className="form-control mt-1"
                name="gender"
                id="gender"
                onChange={(e) => setGender(e.target.value)}
                value={gender}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div className="form-group mt-3">
              <label>Téléphone</label>
              <input
                onChange={(e) => setNumberPhone(e.target.value)}
                type="tel"
                className="form-control mt-1"
                placeholder="Téléphone"
              />
            </div>
            <div className="form-group mt-3">
              <label >Niveau</label>
              <select className="form-control mt-1"
                name="level"
                id="level"
                onChange={(e) => setLevel(e.target.value)}
                value={level}>
                <option value="PREMIERE">Premiere</option>
                <option value="DEUXIEME">Deuxieme</option>
              </select>
            </div>
            <div className="form-group mt-3">
              <label >Branche</label>
              <select className="form-control mt-1"
                name="field"
                id="field"
                onChange={(e) => setField(e.target.value)}
                value={field} >
                <option value="MP">Math Physique</option>
                <option value="PC">Physique Chimie</option>
                <option value="PT">Physique technique</option>
                <option value="BG">Biologie Geologie</option>

              </select>
            </div>
            <div className="form-group mt-3">
              <label>Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="form-group mt-3">
              <label>Months</label>
              <input
                type="number"
                value={months}
                onChange={handleMonthsChange}
                className="form-control mt-1"
                placeholder="Months"
              />
            </div>


            <div className="d-grid gap-2 mt-3">
              <button type="submit" className="btn btn-primary" >
                Sign up
              </button>
              <div className="d-grid gap-2 mt-3">
                {// isError && <h5>{errors.LOGIN_ERROR}</h5>
                }
                <h3> {successmessage} </h3>
              </div>

            </div>
          </div>
        </form>
      </div>
    )
  )
}
