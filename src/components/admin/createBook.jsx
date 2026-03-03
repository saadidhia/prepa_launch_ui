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
                            <label >Link picture: https://imgbb.com/</label>
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
                                    value="TROISIEME"
                                />
                                <label className="form-check-label" htmlFor="premiereCheckbox">
                                    TROISIEME
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setLevels(e.target.checked ? [...levels, e.target.value] : levels.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="deuxiemeCheckbox"
                                    value="BAC"
                                />
                                <label className="form-check-label" htmlFor="secondaireCheckbox">
                                    BAC
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
                                    value="SCIENCE"
                                />
                                <label className="form-check-label" htmlFor="pcCheckbox">
                                    SCIENCE
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setFields(e.target.checked ? [...fields, e.target.value] : fields.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="mpCheckbox"
                                    value="MATH"
                                />
                                <label className="form-check-label" htmlFor="mpCheckbox">
                                    MATH
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setFields(e.target.checked ? [...fields, e.target.value] : fields.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="ptCheckbox"
                                    value="TECH"
                                />
                                <label className="form-check-label" htmlFor="ptCheckbox">
                                    TECH
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setFields(e.target.checked ? [...fields, e.target.value] : fields.filter(item => item !== e.target.value))}
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
                            <label>Subjects: </label>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="math1Checkbox"
                                    value="MATH"
                                />
                                <label className="form-check-label" htmlFor="math1Checkbox">
                                    MATH
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="math2Checkbox"
                                    value="SCIENCE"
                                />
                                <label className="form-check-label" htmlFor="math2Checkbox">
                                    SCIENCE
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
                                    value="ECONOMIE"
                                />
                                <label className="form-check-label" htmlFor="chimieCheckbox">
                                    ECONOMIE
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
                                    value="TECHNIQUE"
                                />
                                <label className="form-check-label" htmlFor="staCheckbox">
                                    TECHNIQUE
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="infoCheckbox"
                                    value="INFORMATIQUE"
                                />
                                <label className="form-check-label" htmlFor="infoCheckbox">
                                    INFORMATIQUE
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="arabeCheckbox"
                                    value="ARABE"
                                />
                                <label className="form-check-label" htmlFor="arabeCheckbox">
                                    ARABE
                                </label>
                            </div>
                             <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="bases_DE_DONNEESCheckbox"
                                    value="BASES_DE_DONNEES"
                                />
                                <label className="form-check-label" htmlFor="bases_DE_DONNEESCheckbox">
                                    BASES_DE_DONNEES
                                </label>
                            </div>

                             <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="algorithmesCheckbox"
                                    value="ALGORITHMES"
                                />
                                <label className="form-check-label" htmlFor="algorithmesCheckbox">
                                    ALGORITHMES
                                </label>
                            </div>
                              <div className="form-check">
                                <input
                                    onChange={(e) => setSubjects(e.target.checked ? [...subjects, e.target.value] : subjects.filter(item => item !== e.target.value))}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="gestionCheckbox"
                                    value="GESTION"
                                />
                                <label className="form-check-label" htmlFor="gestionCheckbox">
                                    GESTION
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