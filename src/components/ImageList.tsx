import { View, Text, StyleSheet, FlatList, Image } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { IconButton } from 'react-native-paper';
import EntypoIcon from 'react-native-vector-icons/Entypo'

type Props = {
    images: string[];
    setImageUrls: React.Dispatch<React.SetStateAction<string[]>>
}

export default function ImageList(props: Props) {
    const theme = useSelector((state: RootState) => state.theme.value);

    const removeImage = (i: number) => {
        const newImages = props.images.filter((_, index) => index !== i);
        props.setImageUrls(newImages);
    }

    return (
        <View style={[styles.imageList, { backgroundColor: theme.colors.surface }]}>
            <FlatList
                data={props.images}
                horizontal={true}
                keyExtractor={item => item}
                renderItem={({ item, index }) => (
                    <View style={styles.container}>
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${item}` }}
                            style={styles.image}
                        />
                        <IconButton
                            icon={EntypoIcon.getImageSourceSync('circle-with-cross')}
                            style={styles.crossBtn}
                            onPress={() => removeImage(index)}
                            size={24}
                            iconColor={theme.colors.text}
                        />
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    imageList: {
        height: 100,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    container: {
        marginVertical: 5,
        height: '100%',
        padding: 10,
    },
    image: {
        width: 80,
        height: '100%',
        borderRadius: 10,
    },
    crossBtn: {
        position: 'absolute',
        right: -10,
        top: -10,
        padding: 0,
        margin: 0
    }
})