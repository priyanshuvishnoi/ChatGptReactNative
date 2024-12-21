import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export type InputDialogProps = {
    title: string;
    visible: boolean;
    onClose?: () => void;
    onSubmit: (value: string) => void;
};


export function InputDialog(props: InputDialogProps) {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        AsyncStorage.getItem('OPENAI_API_KEY')
            .then(apiKey => {
                if (apiKey) {
                    setInputValue(apiKey);
                }
            })
    }, []);

    return (
        <Modal transparent visible={props.visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{props.title}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Type here..."
                        value={inputValue}
                        onChangeText={setInputValue}
                    />
                    <View style={styles.buttons}>
                        {props.onClose && (
                            <TouchableOpacity onPress={props.onClose}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => props.onSubmit(inputValue)}>
                            <Text style={[styles.buttonText, styles.submit]}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    dialog: {
        width: 300,
        padding: 20,
        backgroundColor: '#ffffffdd',
        borderRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    buttonText: {
        fontSize: 16,
        color: '#007AFF',
        textAlign: 'center',
    },
    submit: {
        fontWeight: '600',
    },
});

