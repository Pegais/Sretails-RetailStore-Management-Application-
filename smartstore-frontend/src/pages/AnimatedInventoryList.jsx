import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import InventoryItemCard from '../components/layouts/inventoryCard';

const CARD_HEIGHT = 240;
const CARD_GAP = 16; // reduced gap for tighter spacing
const VISIBLE_CARDS = 3;
const ANIMATION_DURATION = 3; // seconds

const AnimatedInventoryList = ({ items }) => {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || items.length <= VISIBLE_CARDS) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % items.length);
        }, ANIMATION_DURATION * 1000);
        return () => clearInterval(timer);
    }, [paused, items]);

    const getVisibleItems = () => {
        if (items.length < VISIBLE_CARDS) return items;
        const visible = items.slice(index, index + VISIBLE_CARDS);
        if (visible.length < VISIBLE_CARDS) {
            return [...visible, ...items.slice(0, VISIBLE_CARDS - visible.length)];
        }
        return visible;
    };

    const visibleItems = getVisibleItems();

    return (
        <Box
            sx={{
                height: paused
                    ? 'auto'
                    : `${CARD_HEIGHT * VISIBLE_CARDS + CARD_GAP * (VISIBLE_CARDS - 1)}px`,
                overflow: 'hidden',
                position: 'relative',
                py: 2,
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <AnimatePresence initial={false}>
                {paused
                    ? items.map((item, i) => {
                        // Center card for styling reference
                        const center = Math.floor(items.length / 2);
                        const distanceFromCenter = Math.abs(i - center);
                        const scale = 1;
                        const blur = 'none';
                        const opacity = 1;


                        return (
                            <Box
                                key={`static-${item._id}-${i}`}
                                sx={{
                                    position: 'relative',
                                    mb: i !== items.length - 1 ? `${CARD_GAP}px` : 0,
                                    zIndex: items.length - i,
                                    transform: `scale(${scale})`,
                                    filter: `blur(${blur})`,
                                    opacity,
                                    transition: 'all 0.3s ease-in-out',
                                }}
                            >
                                <InventoryItemCard item={item} />
                            </Box>
                        );
                    })
                    : visibleItems.map((item, i) => {
                        const isCenter = i === 1;
                        const isTop = i === 0;
                        const isBottom = i === 2;

                        const scale = isCenter ? 1.05 : 0.95;
                        const blur = isCenter ? 'none' : '1px';
                        const opacity = isCenter ? 1 : 0.7;

                        return (
                            <motion.div
                                key={`motion-${item._id}-${index}`}
                                initial={{
                                    opacity: 0,
                                    y: isBottom ? 60 : isTop ? -60 : 0,
                                    scale: 0.9,
                                }}
                                animate={{
                                    opacity,
                                    y: 0,
                                    scale,
                                    filter: `blur(${blur})`,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: isTop ? -100 : 100,
                                    scale: 0.85,
                                }}
                                transition={{ duration: 0.6 }}
                                style={{
                                    position: 'absolute',
                                    top: `${(i - 1) * (CARD_HEIGHT + CARD_GAP)}px`,
                                    width: '100%',
                                    zIndex: isCenter ? 2 : 1,
                                }}
                            >
                                <InventoryItemCard item={item} />
                            </motion.div>
                        );
                    })}
            </AnimatePresence>
        </Box>
    );
};

export default AnimatedInventoryList;
