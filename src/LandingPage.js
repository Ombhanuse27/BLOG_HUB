// src/LandingPage.js
import React, { useEffect } from "react";
import "./LandingPage.css"; // Assuming you put the styles in a separate CSS file
import chess from "./images/chess.mp4"; // Adjust with your actual filenames
import cooking from "./images/cooking.mp4";
import cr7 from "./images/cr7.mp4";
import central from "./images/central bucharest.mp4";
import whether from "./images/whether.mp4";
import vegies from "./images/vegies.mp4";
import sachin from "./images/sachin.mp4";
import news from "./images/news.mp4";
import frying from "./images/frying.mp4";
import facebook from "./images/facebook.png";
import youtube from "./images/youtube.png";
import twitter from "./images/twitter.png";
import instagram from "./images/instagram.png";
import g2 from "./images/g2.jpg";
import g3 from "./images/g3.jpg";
import g4 from "./images/g4.jpg";
import g5 from "./images/g5.jpg";
import g6 from "./images/g6.jpg";
import s1 from "./images/s1.jpg";
import s2 from "./images/s2.jpg";

import m1 from "./images/m1.jpg";
import m2 from "./images/m2.jpg";
import m3 from "./images/m3.jpg";
import m4 from "./images/m4.jpg";
import m5 from "./images/m5.jpg";
import m6 from "./images/m6.jpg";
import m7 from "./images/m7.jpg";
import m8 from "./images/m8.jpg";
import m9 from "./images/m9.jpg";
import m10 from "./images/m10.jpg";
import jai from "./images/jai.s.webp";
import r2 from "./images/r2.jpg";
import mr3 from "./images/r3.jpg";
import r4 from "./images/r4.jpg";

const LandingPage = () => {
  useEffect(() => {
    const initImageSlider = (sliderId) => {
      const images = document.querySelectorAll(`#${sliderId} img`);
      let currentIndex = 0;

      const changeImage = () => {
        images[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add("active");
      };

      setInterval(changeImage, 5000); // Change image every 5 seconds
    };

    initImageSlider("imageSlider1");
    initImageSlider("imageSlider2");

    const videos = document.querySelectorAll(".chef-video");

    videos.forEach((video) => {
      video.addEventListener("mouseover", () => {
        video.play();
      });
      video.addEventListener("mouseout", () => {
        video.pause();
        video.currentTime = 0;
      });
    });

    return () => {
      videos.forEach((video) => {
        video.removeEventListener("mouseover", () => {});
        video.removeEventListener("mouseout", () => {});
      });
    };
  }, []);

  return (
    <div>
      {/* Navbar Section */}

      {/* Landing Section */}
      <div className="landing">
        <div className="left-content">
          <h1>A Passionate Blogging Experience Awaits</h1>
          <p>
            Discover delicious recipes, insightful posts, and more in our unique
            categories, crafted by passionate bloggers like you. Share your
            passion and inspire others.
          </p>

          {/* Gallery of videos */}
          <div className="gallery">
            <video src={cooking} muted loop className="chef-video"></video>
            <video src={frying} muted loop className="chef-video"></video>
            <video src={vegies} muted loop className="chef-video"></video>
          </div>

          <h2>More Than Just Blogging</h2>
          <p className="extra-text">
            Join our community of writers and share your unique voice with the
            world. We offer insightful tips, exciting categories, and more to
            help you on your blogging journey.
          </p>
          <button>Explore More</button>
        </div>

        <div className="divider"></div>

        <div className="image-container" id="imageSlider2">
          <img src={m1} alt="Image 1" className="active" />
          <img src={m2} alt="Image 2" />
          <img src={m3} alt="Image 3" />
          <img src={m4} alt="Image 4" />
          <img src={m5} alt="Image 5" />
          <img src={m6} alt="Image 6" />
        </div>
      </div>

      {/* Second Section */}
      <div className="landing">
        <div className="image-container" id="imageSlider1">
          <img src={jai} alt="Image 1" className="active" />
          <img src={g2} alt="Image 2" />
          <img src={g3} alt="Image 3" />
          <img src={g4} alt="Image 4" />
          <img src={g5} alt="Image 5" />
          <img src={g6} alt="Image 6" />
        </div>
        <div className="divider"></div>

        <div className="left-content3">
          <h1>A Journey Through Culinary Delights and Inspiring Stories</h1>
          <p>
            Explore a vibrant world of flavors and creativity with passionate
            bloggers sharing their favorite recipes and unique perspectives.
            Whether you're a seasoned cook or a beginner, our curated categories
            have something for everyone. Join us in celebrating the joy of
            cooking and the art of storytelling!
          </p>

          <div className="gallery">
            <video src={central} muted loop className="chef-video"></video>
            <video src={news} muted loop className="chef-video"></video>
            <video src={whether} muted loop className="chef-video"></video>
          </div>

          <h2>More Than Just Blogging</h2>
          <p className="extra-text">
            Join our community of writers and share your unique voice with the
            world. We offer insightful tips, exciting categories, and more to
            help you on your blogging journey.
          </p>
          <button>Explore More</button>
        </div>
      </div>

      <div className="landing3">
        <div className="image-container3" id="imageSlider">
          <img src={s1} alt="Image 1" className="active" />
          <img src={s2} alt="Image 2" />
          {/*<img src={s3} alt="Image 3" />
                    <img src={s4} alt="Image 4" />
                    <img src={s5} alt="Image 5" />
                    <img src={s6} alt="Image 6" /> */}
        </div>

        <div className="left-content">
          <h1>A Journey Through Culinary Delights and Inspiring Stories</h1>
          <p>
            Explore a vibrant world of flavors and creativity with passionate
            bloggers sharing their favorite recipes and unique perspectives.
            Whether you're a seasoned cook or a beginner, our curated categories
            have something for everyone. Join us in celebrating the joy of
            cooking and the art of storytelling!
          </p>

          <div className="gallery">
            <video src={chess} muted loop className="chef-video"></video>
            <video src={cr7} muted loop className="chef-video"></video>
            <video src={sachin} muted loop className="chef-video"></video>
          </div>

          <h2>More Than Just Blogging</h2>
          <p className="extra-text">
            Join our community of writers and share your unique voice with the
            world. We offer insightful tips, exciting categories, and more to
            help you on your blogging journey.
          </p>
          <button>Explore More</button>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section about">
            <h2>About Us</h2>
            <p>
              We are a passionate community of bloggers sharing unique recipes,
              stories, and insights. Join us on our journey to inspire others
              through food and creativity!
            </p>
          </div>

          <div className="footer-section links">
            <h2>Quick Links</h2>
            <ul>
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">Categories</a>
              </li>
              <li>
                <a href="#">Write</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
            </ul>
          </div>

          <div className="footer-section social">
            <h2>Follow Us</h2>
            <div className="social-icons">
              <a href="#">
                <img src={facebook} alt="Facebook" />
              </a>
              <a href="#">
                <img src={twitter} alt="Twitter" />
              </a>
              <a href="#">
                <img src={instagram} alt="Instagram" />
              </a>
              <a href="#">
                <img src={youtube} alt="YouTube" />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 My Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
