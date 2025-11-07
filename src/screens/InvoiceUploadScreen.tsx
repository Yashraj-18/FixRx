import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { invoiceService } from '../services/invoiceService';

const InvoiceUploadScreen: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadInvoice = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setUploading(true);

    try {
      const response = await invoiceService.uploadInvoice({
        uri: selectedFile.uri,
        name: selectedFile.name ?? `invoice-${Date.now()}`,
        type: selectedFile.mimeType ?? 'application/octet-stream',
        description: 'Service Invoice',
      });

      if (response.success) {
        Alert.alert('Success', 'Invoice uploaded successfully!');
        setSelectedFile(null);
      } else {
        Alert.alert('Error', 'Upload failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Invoice</Text>

      <TouchableOpacity style={styles.pickButton} onPress={pickDocument}>
        <Text style={styles.buttonText}>
          {selectedFile ? selectedFile.name : 'Select Invoice File'}
        </Text>
      </TouchableOpacity>

      {selectedFile && (
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.disabled]}
          onPress={uploadInvoice}
          disabled={uploading}>
          <Text style={styles.buttonText}>
            {uploading ? 'Uploading...' : 'Upload Invoice'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  pickButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default InvoiceUploadScreen;