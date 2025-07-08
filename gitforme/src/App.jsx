import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import { Route, Routes } from 'react-router-dom'


function App() {

  return (
    <Routes>
        <Route path = "/" element={<Home />}></Route>
        <Route path = "/login" element={<Login />}></Route>
        <Route path = "/signup" element={<Signup />}></Route>
    </Routes>
  )
}

export default App
