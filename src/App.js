import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from "./components/register";
import Profile from './components/profile';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { auth } from './components/firebase';
import HomePage from './components/HomePage';
import AddPost from './components/AddPost';
import CategoryPage from './components/CategoryPage';
// import { BackgroundBeamsWithCollisionDemo } from './components/BackgroundBeamsWithCollisionDemo';
// import { BackgroundBeamsWithCollision } from './components/  ui/background-beams-with-collision';
import PostDetail from './components/PostDetail';
import LandingPage from './LandingPage';


const Home = () => (
  <div className='h-20 px-5 flex items-center justify-between'>
    <h2 className="text-black font-bold">My Blog</h2>
    <div className='flex gap-8'>
      <h4 className="text-black cursor-pointer">Our Story</h4>
      
      <Link to="/signin">
        <h4 className='cursor-pointer text-black'>Sign In</h4>
      </Link>
    </div>
  </div>

  
);

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Router>
     
      <Routes>
        <Route path="/" element={<div><Home/><LandingPage/></div>} />

       
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/addpost" element={<AddPost />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/categorypage" element={<CategoryPage />} />

        
        <Route path="/signin" element={
         
            <div className="flex justify-center items-center h-screen">
              <div className="bg-white shadow-md rounded-lg p-8 w-96">
                <SignIn />
              </div>
            </div>
        }/>
        
        <Route path="/register" element={
          <div className="flex justify-center items-center h-screen">
            <div className="bg-white shadow-md rounded-lg p-8 w-96">
              <SignUp />
            </div>
          </div>
        } />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
