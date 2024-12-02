import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chatArea: {
        padding: 10,
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
    messageContainer: {
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#0066cc',
    },
    botMessage: {
        alignSelf: 'flex-start',
    },
    messageText: {
        color: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        paddingBottom: 10
    },
    cameraIcon: {
        marginHorizontal: 5,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 20,
    },
    sendButton: {
        marginLeft: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    markdownContainer: {
        maxWidth: '100%',
        flexShrink: 1,
    },
    markdown: {
        body: {
            color: '#000',
        },
    } as any,
});
