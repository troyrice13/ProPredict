import React from "react";
import { useNavigate } from "react-router-dom";
import './Header.css'

export default function Header() {
    const navigate = useNavigate()
    return (
        <div className="container">
            <h2 onClick={() => navigate('/players')}>
            Home
            </h2>
        </div>
    )
}