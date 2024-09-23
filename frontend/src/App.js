import React from "react"
import Login from "./Login"
import {BrowserRouter , Route, Routes} from "react-router-dom"
import Signup from './Signup'
import Home from './Home'
import ForgotPassword from "./ForgotPassword"
import AddCustomer from "./AddCustomer"
import ChangePassword from "./ChangePassword"
import VerifyPassword from './VerifyPassword'
import ChangePasswordFromForget from "./ChangePasswordFromForget"


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/signup" element={<Signup/>}></Route>
        <Route path="/home" element={<Home/>}></Route>
        <Route path="/forgot" element={<ForgotPassword/>}></Route>
        <Route path="/add-customer" element={<AddCustomer/>}></Route>
        <Route path="/change-password" element={<ChangePassword/>}></Route>
        <Route path="/verify-password" element={<VerifyPassword/>}></Route>
        <Route path="/change-password-from-forget" element={<ChangePasswordFromForget/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
