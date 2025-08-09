import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import axios from 'axios';
import { API_BASE } from '../config';
import { AuthContext } from '../utils/auth';

/**
 * ShiftTracker screen. Lists today's scheduled shifts and allows the user to start or end a shift.
 * For simplicity, it does not include geolocation logic here.
 */
export default function ShiftTracker() {
  const { token } = useContext(AuthContext);
  const [shifts, setShifts] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const loadShifts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/shifts/scheduled/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShifts(res.data || []);
    } catch (err) {
      Alert.alert('Error', 'Unable to load shifts');
    }
  };

  useEffect(() => {
    if (token) {
      loadShifts();
    }
  }, [token]);

  const startShift = async (id) => {
    try {
      await axios.post(`${API_BASE}/shifts/${id}/start`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setTracking(true);
      setSelectedShift(id);
      setStartTime(new Date());
    } catch (err) {
      Alert.alert('Error', 'Could not start shift');
    }
  };

  const endShift = async (id) => {
    try {
      await axios.post(`${API_BASE}/shifts/${id}/end`, { breakMinutes: 0, createInvoice: true }, { headers: { Authorization: `Bearer ${token}` } });
      setTracking(false);
      setSelectedShift(null);
      setStartTime(null);
      Alert.alert('Shift ended', 'Invoice created');
      loadShifts();
    } catch (err) {
      Alert.alert('Error', 'Could not end shift');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      {tracking && selectedShift ? (
        <>
          <Text style={{ fontSize: 18 }}>Shift in progress</Text>
          <Text>Started at: {startTime && startTime.toLocaleTimeString()}</Text>
          <Button title="End Shift" onPress={() => endShift(selectedShift)} />
        </>
      ) : (
        <>
          <Button title="Refresh Shifts" onPress={loadShifts} />
          <FlatList
            data={shifts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 8, borderBottomWidth: 1 }}>
                <Text>{item.clientName}</Text>
                <Text>{new Date(item.scheduledStart).toLocaleString()}</Text>
                <Button title="Start Shift" onPress={() => startShift(item.id)} />
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}
