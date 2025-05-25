import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationModal from '../components/NotificationModal';

interface NotificationContextType {
    showNotification: (title: string, message: string, type?: 'alert' | 'update') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [notification, setNotification] = useState({
        title: '',
        message: '',
        type: 'update' as 'alert' | 'update'
    });

    const showNotification = useCallback((title: string, message: string, type: 'alert' | 'update' = 'update') => {
        setNotification({ title, message, type });
        setVisible(true);
    }, []);

    const hideNotification = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <NotificationModal
                visible={visible}
                title={notification.title}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}; 