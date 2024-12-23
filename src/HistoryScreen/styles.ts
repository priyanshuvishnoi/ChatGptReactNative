import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chatItem: {
        // padding: 10,
        marginVertical: 5,
        marginHorizontal: 5,
        borderRadius: 10,
        backgroundColor: '#e7e7e7',
        height: 80,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },
    chatItemText: {
        fontSize: 25,
    },
    chatItemDate: {
        fontSize: 15,
        color: '#666666',
    },
    chatRightIcon: {
        justifyContent: 'center',
    },
    FAB: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 30,
    }
});
