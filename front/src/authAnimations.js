// src/animations/authAnimations.js

export const pageFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 }
};

export const cardSlide = {
  initial: { y: -50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { delay: 0.2, duration: 0.6 }
};

export const buttonMotion = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
};
