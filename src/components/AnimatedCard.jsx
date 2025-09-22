import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Box } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * AnimatedCard - A reusable animated card component with smooth transitions
 * 
 * This component uses Framer Motion to add animations to Material UI cards
 * It can be used throughout the application for a consistent, modern UI
 */
const AnimatedCard = ({ 
  title, 
  subtitle, 
  icon, 
  children, 
  delay = 0,
  color = 'primary',
  elevation = 3,
  onClick,
  sx = {}
}) => {
  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        delay,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.3
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover={onClick ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      variants={cardVariants}
    >
      <Card 
        elevation={elevation} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          ...sx
        }}
        onClick={onClick}
      >
        {title && (
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: `${color}.main`, 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {icon && (
              <motion.div
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.5 }}
              >
                {icon}
              </motion.div>
            )}
            <Box>
              <Typography variant="h6" component="div">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        <CardContent sx={{ p: 3 }}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

AnimatedCard.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  color: PropTypes.string,
  elevation: PropTypes.number,
  onClick: PropTypes.func,
  sx: PropTypes.object
};

export default AnimatedCard;