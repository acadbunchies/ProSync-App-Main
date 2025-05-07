
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const logoVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const NavbarLogo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <motion.div 
        className="text-2xl font-bold text-gradient"
        variants={logoVariants}
        initial="hidden"
        animate="visible"
      >
        ProSync
      </motion.div>
    </Link>
  );
};

export default NavbarLogo;
