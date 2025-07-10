import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import { Route, Routes } from 'react-router-dom'
import RepoPage from '../pages/gitpage'


function App() {

  return (
    <Routes>
        <Route path = "/" element={<Home />}></Route>
        <Route path = "/login" element={<Login />}></Route>
        <Route path = "/signup" element={<Signup />}></Route>
          <Route path="/:username/:reponame" element={<RepoPage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}

export default App
