import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import axios from 'axios';
import { API_BASE } from '../config';
import { AuthContext } from '../utils/auth';

/**
 * Dashboard screen. Displays year-to-date earnings and today's scheduled shifts.
 */
export default function Dashboard({ navigation }) {
  const { token } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const invRes = await axios.get(`${API_BASE}/invoices`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvoices(invRes.data || []);
      } catch (err) {}
      try {
        const shiftRes = await axios.get(`${API_BASE}/shifts/scheduled/today`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShifts(shiftRes.data || []);
      } catch (err) {}
    };
    loadData();
  }, [token]);

  const ytd = invoices.reduce((sum, i) => sum + parseFloat(i.totalAmount || 0), 0).toFixed(2);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20 }}>Year-to-date earnings: ${ytd}</Text>
      <Text style={{ marginTop: 12, fontSize: 18 }}>Today's Shifts</Text>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1 }}>
            <Text>{item.clientName}</Text>
            <Text>{new Date(item.scheduledStart).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}
