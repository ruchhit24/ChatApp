import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Home from "./pages/Home"; 
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./pages/NotFound";
import Groups from "./pages/Groups";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios'
import { userExists, userNotExists } from "./redux/reducers/auth";
import { server } from "./constants/config";

import {Toaster} from 'react-hot-toast'
import { SocketProvider } from "./socket";
import VerifyEmail from "./pages/VerifyEmail";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// let user = true;

const App = () => { 

    const { user, loader } = useSelector((state) => state.auth);
    
    const [loading, setLoading] = useState(true);
  
    const dispatch = useDispatch();
  
    useEffect(() => {
      axios
        .get(`${server}/api/v1/user/me`, { withCredentials: true })
        .then(({ data }) => dispatch(userExists(data.user)))
        .catch((err) => dispatch(userNotExists()))
        .finally(() => setLoading(false));
    }, [dispatch]);
    
    if (loading || loader) {
      return    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Set height to full viewport height
      }}
    >
      <CircularProgress color="success" size={100} thickness={2} /> {/* Set size and thickness */}
    </Box>
  }

    return  (
    <>
      <BrowserRouter> 
        <Routes>
          <Route element={<SocketProvider>
                <PrivateRoute user={user} />
              </SocketProvider>}>
            <Route path="/" element={<Home/>} />
            <Route path="/chat/:chatId" element={<Chat/>} />
            <Route path="/groups" element={<Groups/>}/>
          </Route>

          <Route
            path="/login"
            element={
              <PrivateRoute user={!user} redirect="/">
                <Login />
              </PrivateRoute>
            }
          />
           <Route
            path="/verify-email"
            element={<PrivateRoute user={user} redirect="/verify-email"> {/* Redirect user to VerifyEmail if not verified */}
              <VerifyEmail />
            </PrivateRoute>}
          />







          <Route path="*" element={<NotFound/>}/> 
        </Routes>
        <Toaster position="bottom-center"/>
      </BrowserRouter>
    </>
  ); 
};

export default App;
