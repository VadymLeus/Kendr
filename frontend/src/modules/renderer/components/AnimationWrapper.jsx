// frontend/src/modules/renderer/components/AnimationWrapper.jsx
import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    none: { hidden: {}, visible: {} },
    fadeIn: { 
        hidden: { opacity: 0 }, 
        visible: { opacity: 1 } 
    },
    fadeUp: { 
        hidden: { opacity: 0, y: 50 }, 
        visible: { opacity: 1, y: 0 } 
    },
    fadeDown: { 
        hidden: { opacity: 0, y: -50 }, 
        visible: { opacity: 1, y: 0 } 
    },
    fadeLeft: { 
        hidden: { opacity: 0, x: -50 }, 
        visible: { opacity: 1, x: 0 } 
    },
    fadeRight: { 
        hidden: { opacity: 0, x: 50 }, 
        visible: { opacity: 1, x: 0 } 
    },
    zoomIn: { 
        hidden: { opacity: 0, scale: 0.8 }, 
        visible: { opacity: 1, scale: 1 } 
    }
};

const AnimationWrapper = ({ children, animationConfig }) => {
    const type = animationConfig?.type || 'none';
    const duration = parseFloat(animationConfig?.duration || 0.6);
    const delay = parseFloat(animationConfig?.delay || 0);
    const repeat = animationConfig?.repeat || false;
    if (type === 'none') {
        return <>{children}</>;
    }

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: !repeat, amount: 0.2 }} 
            transition={{ duration, delay, ease: "easeOut" }}
            variants={variants[type]}
            style={{ width: '100%' }}
        >
            {children}
        </motion.div>
    );
};

export default AnimationWrapper;