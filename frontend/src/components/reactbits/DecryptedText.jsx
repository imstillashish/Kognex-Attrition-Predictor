import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export const DecryptedText = ({
  text,
  speed = 40,
  maxIterations = 15,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=",
  className = "",
  style = {},
  animateOn="view", // "hover" or "view"
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (animateOn === "view") {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isAnimating) {
            animateText();
          }
        },
        { threshold: 0.1 }
      );
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [animateOn, isAnimating, text]);

  useEffect(() => {
    if (animateOn === "hover" && isHovering && !isAnimating) {
      animateText();
    }
  }, [isHovering, animateOn, isAnimating, text]);

  const animateText = () => {
    setIsAnimating(true);
    let currentIteration = 0;
    const originalText = text;

    const interval = setInterval(() => {
      setDisplayText((prev) =>
        originalText
          .split("")
          .map((char, index) => {
            if (index < currentIteration) return originalText[index];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (currentIteration >= originalText.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }
      currentIteration += 1 / (maxIterations / originalText.length);
    }, speed);
  };

  return (
    <motion.span
      ref={containerRef}
      className={className}
      style={{ ...style, display: 'inline-block' }}
      onMouseEnter={() => animateOn === 'hover' && setIsHovering(true)}
      onMouseLeave={() => animateOn === 'hover' && setIsHovering(false)}
    >
      {displayText}
    </motion.span>
  );
};
