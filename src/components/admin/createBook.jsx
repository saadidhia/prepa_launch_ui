import React, { useState } from "react"
import { adminApi } from '../../apis/adminApi'
import { handleLogError } from '../../misc/Helpers'
import { useAuth } from '../context/AuthContext'
import "react-datepicker/dist/react-datepicker.css";
import "react-calendar/dist/Calendar.css";

import '../../assets/css/login.css'




export function CreateBook() {
    const Auth = useAuth()
    const admin = Auth.getUser()
    const [name, setName] = useState("")
    const [levels, setLevels] = useState([])
    const [fields, setFields] = useState([])
    const [description, setDescription] = useState("")
    const [link, setLink] = useState("")
    const [subjects, setSubjects] = useState([]);
    const [price, setPrice] = useState(0.0);
    const [percentagePromotion, setPercentagePromotion] = useState(0.0);



    const [successmessage, setSuccessMessage] = useState("")



    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!(name && description && link && price && percentagePromotion && subjects && levels && fields)) {

            return;
        }


        const book = { name, description, link, price, percentagePromotion, subjects, levels, fields }

        try {

            await adminApi.createBook(book, admin)
            setSuccessMessage('Book Is Created')


        } catch (error) {
            handleLogError(error)
        }
    }

    return (
        (
            <div className="Auth-form-container">
                <form className="Auth-form" onSubmit={handleSubmit}>
                    <div className="Auth-form-content">


                        <div className="form-group mt-3">
                            <label >Book name</label>
                            <input
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                className="form-control mt-1"
                                placeholder="Book name"
                            />
                        </div>

                        <div className="form-group mt-3">
                            <label >Description</label>
                            <input
                                onChange={(e) => setDescription(e.target.value)}
                                type="text"
                                className="form-control mt-1"
                                placeholder="Description"
                            />
                        </div>

                        <div className="form-group mt-3">
                            <label >Link picture</label>
                            <input
                                onChange={(e) => setLink(e.target.value)}
                                type="text"
                                className="form-control mt-1"
                                placeholder="Link picture"
                            />
                        </div>

                        <div className="form-group mt-3">
                            <label>Levels: </label>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setLevels(e.target.checked ? [...levels, e.target.value] : levels.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="premiereCheckbox"
                                    value="PREMIERE"
                                />
                                <label className="form-check-label" htmlFor="premiereCheckbox">
                                    PREMIERE
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setLevels(e.target.checked ? [...levels, e.target.value] : levels.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="deuxiemeCheckbox"
                                    value="DEUXIEME"
                                />
                                <label className="form-check-label" htmlFor="secondaireCheckbox">
                                    DEUXIEME
                                </label>
                            </div>
                        </div>

                        <div className="form-group mt-3">
                            <label>Fields: </label>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setFields(e.target.checked ? [...fields, e.target.value] : fields.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="pcCheckbox"
                                    value="PC"
                                />
                                <label className="form-check-label" htmlFor="pcCheckbox">
                                    PC
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setFields(e.target.checked ? [...fields, e.target.value] : fields.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="mpCheckbox"
                                    value="MP"
                                />
                                <label className="form-check-label" htmlFor="mpCheckbox">
                                    MP
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setFields(e.target.checked ? [...fields, e.target.value] : fields.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="ptCheckbox"
                                    value="PT"
                                />
                                <label className="form-check-label" htmlFor="ptCheckbox">
                                    PT
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setFields(e.target.checked ? [...fields, e.target.value] : fields.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="bgCheckbox"
                                    value="BG"
                                />
                                <label className="form-check-label" htmlFor="bgCheckbox">
                                    BG
                                </label>
                            </div>
                        </div>

                        <div className="form-group mt-3">
                            <label>Subjects: </label>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="math1Checkbox"
                                    value="MATH1"
                                />
                                <label className="form-check-label" htmlFor="math1Checkbox">
                                    MATH1
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="math2Checkbox"
                                    value="MATH2"
                                />
                                <label className="form-check-label" htmlFor="math2Checkbox">
                                    MATH2
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="physiqueCheckbox"
                                    value="PHYSIQUE"
                                />
                                <label className="form-check-label" htmlFor="physiqueCheckbox">
                                    PHYSIQUE
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="chimieCheckbox"
                                    value="CHIMIE"
                                />
                                <label className="form-check-label" htmlFor="chimieCheckbox">
                                    CHIMIE
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="francaisCheckbox"
                                    value="FRANCAIS"
                                />
                                <label className="form-check-label" htmlFor="francaisCheckbox">
                                    FRANCAIS
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="anglaisCheckbox"
                                    value="ANGLAIS"
                                />
                                <label className="form-check-label" htmlFor="anglaisCheckbox">
                                    ANGLAIS
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="staCheckbox"
                                    value="STA"
                                />
                                <label className="form-check-label" htmlFor="staCheckbox">
                                    STA
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="infoCheckbox"
                                    value="INFO"
                                />
                                <label className="form-check-label" htmlFor="infoCheckbox">
                                    INFO
                                </label>
                            </div>
                        </div>
                        <div className="form-group mt-3">
                            <label>Price</label>
                            <input
                                onChange={(e) => setPrice(e.target.value)}
                                type="text"
                                pattern="^\d*\.?\d*$"
                                className="form-control mt-1"
                                placeholder="Price"
                            />
                        </div>

                        <div className="form-group mt-3">
                            <label>Percentage Promotion %: </label>
                            <input
                                onChange={(e) => setPercentagePromotion(e.target.value)}
                                type="number"
                                className="form-control mt-1"
                                placeholder="Percentage"
                            />
                        </div>


                        <div className="d-grid gap-2 mt-3">
                            <button type="submit" className="btn btn-primary" >
                                Create Book
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