import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STORAGE_KEY = 'penny_pal_tour_completed';

interface UseTourProps {
    setTab?: (tab: string) => void;
}

export const useTour = ({ setTab }: UseTourProps = {}) => {
    const driverObj = useRef<any>(null);

    useEffect(() => {
        const isDesktop = window.innerWidth >= 768;

        driverObj.current = driver({
            showProgress: true,
            animate: true,
            steps: [
                {
                    element: '#tour-welcome',
                    popover: {
                        title: 'Welcome to Penny Pal! 👋',
                        description: 'I\'m Penny, your personal finance guide! Let me show you around your new command center.',
                        side: "bottom",
                        align: 'start'
                    }
                },
                {
                    element: '#tour-balance',
                    popover: {
                        title: 'Your Command Center 💰',
                        description: 'See your total balance and quick summary of your income and expenses here.',
                        side: "bottom",
                        align: 'center'
                    }
                },
                {
                    element: isDesktop ? '#tour-quick-actions-desktop' : '#tour-quick-actions-mobile',
                    popover: {
                        title: 'Quick Actions ⚡',
                        description: 'Received money? Bought something? Quickly add transactions here with just a tap.',
                        side: isDesktop ? "bottom" : "top",
                        align: 'center'
                    }
                },
                {
                    element: '#tour-vibes',
                    popover: {
                        title: 'Vibes & Goals 🎯',
                        description: 'Swipe through to see your financial vibes and stay motivated on your wealth building journey.',
                        side: "bottom",
                        align: 'center'
                    }
                },
                {
                    element: isDesktop ? '#tour-nav' : '#tour-nav-mobile',
                    popover: {
                        title: 'Explore More 🗺️',
                        description: 'Switch tabs to view detailed Transactions, deep-dive Analytics, and customize your Settings.',
                        side: "top",
                        align: 'center'
                    }
                },
                {
                    element: '#tour-mascot',
                    popover: {
                        title: 'I\'m Always Here! 🌟',
                        description: 'Click me anytime you need a dash of motivation or want to take this tour again!',
                        side: "bottom",
                        align: 'center'
                    }
                }
            ],
            onDestroyed: () => {
                if (setTab) setTab('overview'); // Return to overview on finish
                localStorage.setItem(TOUR_STORAGE_KEY, 'true');
            }
        });
    }, [setTab]);

    const startTour = (force = false) => {
        const isCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
        if (force || !isCompleted) {
            // Small timeout to ensure DOM is ready if called on mount
            setTimeout(() => {
                driverObj.current?.drive();
            }, 500);
        }
    };

    return { startTour };
};
