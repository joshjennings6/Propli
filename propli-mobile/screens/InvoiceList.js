import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert, Linking } from 'react-native';
import axios from 'axios';
import { API_BASE } from '../config';
import { AuthContext } from '../utils/auth';

/**
 * Invoice list screen. Displays invoices with options to view PDF and send reminder.
 */
export default function InvoiceList() {
  const { token } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [status, setStatus] = useState('');

  const loadInvoices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: status ? { status } : {}
      });
      setInvoices(res.data || []);
    } catch (err) {
      Alert.alert('Error', 'Unable to load invoices');
    }
  };

  useEffect(() => {
    if (token) {
      loadInvoices();
    }
  }, [token, status]);

  const openPdf = async (id) => {
    const url = `${API_BASE}/invoices/${id}/pdf`;
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Error', 'Unable to open PDF');
    }
  };

  const sendReminder = async (id) => {
    try {
      const res = await axios.post(`${API_BASE}/invoices/${id}/reminder`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Reminder', res.data.message || 'Reminder sent');
    } catch (err) {
      Alert.alert('Error', 'Unable to send reminder');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Button title="Refresh" onPress={loadInvoices} />
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1 }}>
            <Text>{item.invoiceNumber} — ${item.totalAmount} — {item.status}</Text>
            <Button title="View PDF" onPress={() => openPdf(item.id)} />
            <Button title="Send Reminder" onPress={() => sendReminder(item.id)} />
          </View>
        )}
      />
    </View>
  );
}
