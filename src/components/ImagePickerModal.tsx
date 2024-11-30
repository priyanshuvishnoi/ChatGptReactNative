import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

type Props = {
  imageModalVisible: boolean;
  setImageModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleCamera: () => void;
  handleGallery: () => void;
};

export function ImagePickerModal({
  imageModalVisible,
  setImageModalVisible,
  handleCamera,
  handleGallery,
}: Props) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={imageModalVisible}
      onRequestClose={() => setImageModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalButton} onPress={handleCamera}>
            <Text style={styles.modalButtonText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={handleGallery}>
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
