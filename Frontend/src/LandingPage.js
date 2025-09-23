import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./LandingPage.css";

// --- Asset Imports (ensure these paths are correct for your project) ---
// Videos
import cooking from "./images/cooking.mp4";
import frying from "./images/frying.mp4";
import vegies from "./images/vegies.mp4";
import central from "./images/central bucharest.mp4";
import news from "./images/news.mp4";
import whether from "./images/whether.mp4";
import chess from "./images/chess.mp4";
import cr7 from "./images/cr7.mp4";
import sachin from "./images/sachin.mp4";

// Images
import facebook from "./images/facebook.png";
import youtube from "./images/youtube.png";
import twitter from "./images/twitter.png";
import instagram from "./images/instagram.png";

// Image Sets for Sliders
const sliderImages1 = [
  require("./images/m1.jpg"),
  require("./images/m2.jpg"),
  require("./images/m3.jpg"),
  require("./images/m4.jpg"),
  require("./images/m5.jpg"),
  require("./images/m6.jpg"),
];

const sliderImages2 = [
  require("./images/jai.s.webp"),
  require("./images/g2.jpg"),
  require("./images/g3.jpg"),
  require("./images/g4.jpg"),
  require("./images/g5.jpg"),
  require("./images/g6.jpg"),
];

const sliderImages3 = [
  require("./images/s1.jpg"),
  require("./images/s2.jpg"),
  // Add more sports images if you have them
];
// --------------------------------------------------------------------

// Reusable component for the animated video thumbnails
const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);

  const handleMouseEnter = () => videoRef.current?.play();
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      className="video-wrapper"
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video ref={videoRef} src={src} muted loop playsInline className="gallery-video" />
    </motion.div>
  );
};

// Reusable component for the image slider
const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [images.length]);

  return (
    <div className="image-slider">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>
    </div>
  );
};


// Reusable component for the main content sections
const ContentSection = ({
  title,
  paragraph,
  videos,
  images,
  imagePosition = "right",
  buttonText,
}) => {
  const navigate = useNavigate();
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      className={`content-section ${imagePosition === "left" ? "reverse" : ""}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
    >
      <div className="text-content">
        <h2>{title}</h2>
        <p>{paragraph}</p>
        <div className="gallery">
          {videos.map((video, index) => (
            <VideoPlayer key={index} src={video} />
          ))}
        </div>
        <motion.button
          onClick={() => navigate("/signin")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {buttonText}
        </motion.button>
      </div>
      <div className="media-content">
        <ImageSlider images={images} />
      </div>
    </motion.section>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            A Passionate Blogging Experience Awaits
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Share your story, discover new passions, and connect with a community of creators.
          </motion.p>
          <motion.button
            onClick={() => navigate("/signin")}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.95 }}
            className="hero-button"
          >
            Get Started
          </motion.button>
        </div>
      </header>

      <main>
        {/* Section 1: Culinary */}
        <ContentSection
          title="Culinary Delights & Delicious Recipes"
          paragraph="Discover a vibrant world of flavors. Our passionate food bloggers share their favorite recipes, cooking tips, and unique culinary perspectives to inspire your next meal."
          videos={[cooking, frying, vegies]}
          images={sliderImages1}
          imagePosition="right"
          buttonText="Explore Food Blogs"
        />

        {/* Section 2: Travel & News */}
        <ContentSection
          title="Journeys, Insights & Global Stories"
          paragraph="From bustling city streets to serene landscapes, explore the world through the eyes of our travel writers. Stay informed with insightful posts on current events and trending news."
          videos={[central, news, whether]}
          images={sliderImages2}
          imagePosition="left"
          buttonText="Discover New Places"
        />

        {/* Section 3: Sports & Strategy */}
        <ContentSection
          title="The Thrill of the Game & Winning Strategies"
          paragraph="Dive into the world of sports. Celebrate legendary athletes, analyze game-winning plays, and sharpen your mind with strategic insights from the world of chess and beyond."
          videos={[chess, cr7, sachin]}
          images={sliderImages3}
          imagePosition="right"
          buttonText="Join the Game"
        />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h2>About Us</h2>
            <p>A passionate community of bloggers sharing unique recipes, stories, and insights. Join us to inspire and be inspired!</p>
          </div>
          <div className="footer-section">
            <h2>Quick Links</h2>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Categories</a></li>
              <li><a href="#">Write</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h2>Follow Us</h2>
            <div className="social-icons">
              <a href="#"><img src={facebook} alt="Facebook" /></a>
              <a href="#"><img src={twitter} alt="Twitter" /></a>
              <a href="#"><img src={instagram} alt="Instagram" /></a>
              <a href="#"><img src={youtube} alt="YouTube" /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BlogHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;