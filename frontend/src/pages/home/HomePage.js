import React from 'react';
import { motion } from 'framer-motion';
import './HomePage.css';
import kocLogo from '../../assets/images/koc_finans_logo.png';

const HomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div
      className="home-page-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.img
        src={kocLogo}
        alt="Koç Finans Logo"
        className="koc-finans-logo"
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      />
      <motion.h2
        variants={itemVariants}
      >
        Hoş Geldiniz
      </motion.h2>
      <motion.p
        variants={itemVariants}
      >
        Yapacağınız işlemi menüden seçebilirsiniz.
      </motion.p>
    </motion.div>
  );
};

export default HomePage;