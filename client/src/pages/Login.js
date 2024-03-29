import React, { useState } from "react";
import { useFileHandler, useInputValidation} from '6pp'
import { usernameValidator } from "../utils/validator";
import { useStrongPassword } from "6pp"; 
import { server } from '../constants/config'
import axios from "axios";
import { userExists } from "../redux/reducers/auth";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

 

const Login = () => {
  const [isSignedin, setIsSignedin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const[showAvatar,setShowAvatar] = useState(false)

  const dispatch = useDispatch();

  const username = useInputValidation("",usernameValidator ); 
  const name = useInputValidation( "" );
  const bio = useInputValidation( "" );
  const password = useStrongPassword();
  const avatar = useFileHandler("single")

  const navigate = useNavigate()

  const handleClick = () => {
    setIsSignedin(!isSignedin);
  };

 const handleLogin = async(e) => {
    e.preventDefault();

    setIsLoading(true);

    const config = {
      withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
     }
 
    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/login`,
        {
          username: username.value,
          password: password.value,
        },
        config,
      );
      dispatch(userExists(data.user));
      toast.success(data.message);
      navigate("/")
    } catch (error) {
     toast.error(error?.response?.data?.message || "Something Went Wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); 

    const formData = new FormData();
    formData.append("avatar", avatar.file);
    formData.append("name", name.value);
    formData.append("bio", bio.value);
    formData.append("username", username.value);
    formData.append("password", password.value);

    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/new`,
        formData,
        config
      );

      dispatch(userExists(data.user));
      toast.success(data.message);
      navigate("/")

    } catch (error) {
     toast.error(error?.response?.data?.message || "Something Went Wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="w-[400px] border border-gray-400 shadow-2xl rounded-lg p-6">
        {isSignedin ? (
          <>
            <h2 className="text-center mt-8 text-3xl font-bold">L o G i N</h2>
            <form className="flex flex-col items-center pt-4 gap-4" onSubmit={handleLogin}>
              <input
                type="text"
                id="username"
                placeholder="Enter Your Username"
                className="border border-black p-2 w-full rounded-lg"
                value={username.value}
                onChange={username.changeHandler}
              />
              <input
                type="password"
                id="password"
                placeholder="Enter Your Password"
                className="border border-black p-2 w-full rounded-lg"
                value={password.value}
                onChange={password.changeHandler}
              />
              <div className="flex justify-center items-center mt-6">
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-700 rounded-lg cursor-pointer font-semibold text-white ">
                LOGIN
              </button>
            </div>
            </form>
             
            <h3 className="text-center mt-4 text-sm font-semibold">OR</h3>
            <h2
              className="text-center mt-4 text-sm font-semibold text-cyan-700 hover:underline cursor-pointer"
              onClick={handleClick}
            >
              Sign Up Instead
            </h2>
          </>
        ) : (
          <>
            <h2 className="text-center mt-8 text-3xl font-bold">
              R e G i S t E r
            </h2>
            {
                username.error && (
                    <div className="text-center bg-red-600 rounded-lg mt-4">
                        <h2 className="text-sm text-white p-3">{username.error}</h2>
                    </div>
                )
              }
              {
                password.error && (
                    <div className="text-center bg-red-600 rounded-lg mt-4">
                        <h2 className="text-sm text-white p-3">{password.error}</h2>
                    </div>
                )
              }
              {
                avatar.error && (
                    <div className="text-center bg-red-600 rounded-lg mt-4">
                        <h2 className="text-sm text-white p-3">{avatar.error}</h2>
                    </div>
                )
              }
              
            <form className="flex flex-col items-center pt-4 gap-4" onSubmit={handleSignUp}>
              
              <input
                type="text"
                id="name"
                placeholder="Enter Your Full Name"
                className="border border-black p-2 w-full rounded-lg"
                value={name.value}
                onChange={name.changeHandler}
              />
              <input
                type="text"
                id="username"
                placeholder="Enter Your Username"
                className="border border-black p-2 w-full rounded-lg"
                value={username.value}
                onChange={username.changeHandler}
              />
              
               <input
                type="text"
                id="bio"
                placeholder="Enter Your Bio"
                className="border border-black p-2 w-full rounded-lg"
                value={bio.value}
                onChange={bio.changeHandler}
              />
              <input
                type="password"
                id="password"
                placeholder="Enter Your Password"
                className="border border-black p-2 w-full rounded-lg"
                value={password.value}
                onChange={password.changeHandler}
              />
              <div className="flex items-center justify-center">
              <input type="file" accept="image/*" className="p-3 text-xs" onChange={avatar.changeHandler}  />
              <button className=" px-2 py-2 bg-gradient-to-r from-cyan-500 to-cyan-800 rounded-lg text-xs text-white" onClick={() => setShowAvatar(true)}>
                Upload Image
              </button>
              
            </div>
            <div className="flex items-center justify-center">
           {
            showAvatar && (
              <img src={avatar.preview} width={300} height={250} className="object-cover"/>
            )
           }
           

            </div>
            <div className="flex justify-center items-center mt-6">
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-700 rounded-lg cursor-pointer font-semibold text-white ">
                REGISTER
              </button>
            </div>
            </form>
             
            <h3 className="text-center mt-4 text-sm font-semibold">OR</h3>
            <h2
              className="text-center mt-4 text-sm font-semibold text-cyan-700 hover:underline cursor-pointer"
              onClick={handleClick}
            >
              Login Instead
            </h2>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
