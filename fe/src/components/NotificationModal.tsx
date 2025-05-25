import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface NotificationModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    type?: 'alert' | 'update';
}

const NotificationModal: React.FC<NotificationModalProps> = ({
    visible,
    title,
    message,
    onClose,
    type = 'update'
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[
                    styles.modalContainer,
                    type === 'alert' ? styles.alertContainer : styles.updateContainer
                ]}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            type === 'alert' ? styles.alertButton : styles.updateButton
                        ]}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        maxWidth: 400,
        padding: 20,
        borderRadius: 10,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
            default: {
                elevation: 5,
            },
        }),
    },
    alertContainer: {
        backgroundColor: '#fff3f3',
        borderLeftWidth: 4,
        borderLeftColor: '#ff4444',
    },
    updateContainer: {
        backgroundColor: '#f0f8ff',
        borderLeftWidth: 4,
        borderLeftColor: '#2196f3',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    message: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    button: {
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    alertButton: {
        backgroundColor: '#ff4444',
    },
    updateButton: {
        backgroundColor: '#2196f3',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default NotificationModal; 