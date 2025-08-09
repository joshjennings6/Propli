import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { API_BASE } from '../config';
import { AuthContext } from '../utils/auth';

/**
 * Clients screen. Allows the user to view existing clients and add new ones.
 */
export default function ClientsScreen() {
  const { token } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    ndisNumber: '',
    hourlyRate: '',
    kmRate: '',
    homeAddress: '',
    invoiceAddress: ''
  });

  const loadClients = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data || []);
    } catch (err) {
      Alert.alert('Error', 'Unable to load clients');
    }
  };

  useEffect(() => {
    if (token) {
      loadClients();
    }
  }, [token]);

  const addClient = async () => {
    const { name, hourlyRate, kmRate } = form;
    if (!name) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    try {
      await axios.post(`${API_BASE}/clients`, {
        ...form,
        hourlyRate: parseFloat(hourlyRate),
        kmRate: parseFloat(kmRate)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({
        name: '',
        ndisNumber: '',
        hourlyRate: '',
        kmRate: '',
        homeAddress: '',
        invoiceAddress: ''
      });
      setShowForm(false);
      loadClients();
    } catch (err) {
      Alert.alert('Error', 'Unable to add client');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      {showForm ? (
        <>
          <Text style={{ fontSize: 18 }}>New Client</Text>
          <TextInput
            placeholder="Name"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            style={{ borderWidth: 1, marginVertical: 4, padding: 6 }}
          />
          <TextInput
            placeholder="NDIS Number"
            value={form.ndisNumber}
            onChangeText={(text) => setForm({ ...form, ndisNumber: text })}
            style={{ borderWidth: 1, marginVertical: 4, padding: 6 }}
          />
          <TextInput
            placeholder="Hourly Rate"
            value={form.hourlyRate}
            onChangeText={(text) => setForm({ ...form, hourlyRate: text })}
            keyboardType="numeric"
            style={{ borderWidth: 1, marginVertical: 4, padding: 6 }}
          />
          <TextInput
            placeholder="Km Rate"
            value={form.kmRate}
            onChangeText={(text) => setForm({ ...form, kmRate: text })}
            keyboardType="numeric"
            style={{ borderWidth: 1, marginVertical: 4, padding: 6 }}
          />
          <TextInput
            placeholder="Home Address"
            value={form.homeAddress}
            onChangeText={(text) => setForm({ ...form, homeAddress: text })}
            style={{ borderWidth: 1, marginVertical: 4, padding: 6 }}
          />
          <TextInput
            placeholder="Invoice Address"
            value={form.invoiceAddress}
            onChangeText={(text) => setForm({ ...form, invoiceAddress: text })}
            style={{ borderWidth: 1, marginVertical: 4, padding: 6 }}
          />
          <Button title="Save Client" onPress={addClient} />
          <Button title="Cancel" onPress={() => setShowForm(false)} />
        </>
      ) : (
        <>
          <Button title="Add Client" onPress={() => setShowForm(true)} />
          <FlatList
            data={clients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 8, borderBottomWidth: 1 }}>
                <Text>{item.name}</Text>
                <Text>Hourly Rate: ${item.hourlyRate}, Km Rate: ${item.kmRate}</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}
