import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  saveDialogVisible: boolean;
  setSaveDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
  chatTitle: string;
  setChatTitle: React.Dispatch<React.SetStateAction<string>>;
  saveChat: () => void;
  theme: any;
};

export default function SaveChatDialog(props: Props) {
  return (
    <KeyboardAvoidingView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={props.saveDialogVisible}
        onRequestClose={() => props.setSaveDialogVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Chat</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: props.theme.colors.surface,
                  color: props.theme.colors.text,
                },
              ]}
              placeholder="Enter title here"
              placeholderTextColor={props.theme.colors.text}
              value={props.chatTitle}
              onChangeText={props.setChatTitle}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => props.setSaveDialogVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton]}
                onPress={props.saveChat}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    height: 180,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#0066cc',
    borderRadius: 20,
    width: 100,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#ee0000',
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#ccc',
  },
});
