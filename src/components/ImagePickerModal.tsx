import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';

type Props = {
  imageModalVisible: boolean;
  setImageModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>
};

export function ImagePickerModal({
  imageModalVisible,
  setImageModalVisible,
  setImageUrls
}: Props) {
  const handleImagePicker = async (source: 'camera' | 'gallery') => {
    try {
      switch (source) {
        case 'camera': {
          const response = await launchCamera({
            mediaType: 'photo',
            quality: 1,
            includeBase64: true,
          })
          handleImagePickerResponse(response);
        }
          break;
        case 'gallery': {
          const response = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
            includeBase64: true,
            selectionLimit: 3
          })
          handleImagePickerResponse(response);
        }
          break;
      }
    } catch (e) {
      console.log(e);
    } finally {
      setImageModalVisible(false);
    }
  }

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled camera');
    } else if (response.errorCode) {
      console.error('Camera error:', response.errorMessage);
    } else
      if (response && response.assets && response.assets.length > 0) {
        const imageUrls = response.assets.map(asset => asset.base64!).filter(u => !!u);
        setImageUrls(prevUrls => prevUrls.concat(imageUrls));
      }
  }


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={imageModalVisible}
      onRequestClose={() => setImageModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalButton} onPress={() => handleImagePicker('camera')}>
            <Text style={styles.modalButtonText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => handleImagePicker('gallery')}>
            <Text style={styles.modalButtonText}>Select from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setImageModalVisible(false)}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  modalButtonText: {
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
});
