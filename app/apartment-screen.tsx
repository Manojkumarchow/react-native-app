import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function ApartmentScreen() {
  const router = useRouter();

  // DROPDOWN STATES
  const [locationOpen, setLocationOpen] = useState(false);
  const [apartmentOpen, setApartmentOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [flatOpen, setFlatOpen] = useState(false);

  const [locationValue, setLocationValue] = useState(null);
  const [apartmentValue, setApartmentValue] = useState(null);
  const [floorValue, setFloorValue] = useState(null);
  const [flatValue, setFlatValue] = useState(null);

  // STATIC DATA
  const data = {
    Khammam: { apartments: 4, floors: 6, flats: 4 },
    Hyderabad: { apartments: 10, floors: 12, flats: 8 },
    Vijayawada: { apartments: 5, floors: 8, flats: 6 },
    Bangalore: { apartments: 8, floors: 15, flats: 10 },
  };

  const locationList = [
    { label: "Khammam", value: "Khammam" },
    { label: "Hyderabad", value: "Hyderabad" },
    { label: "Vijayawada", value: "Vijayawada" },
    { label: "Bangalore", value: "Bangalore" },
  ];

  const [apartmentList, setApartmentList] = useState([]);
  const [floorList, setFloorList] = useState([]);
  const [flatList, setFlatList] = useState([]);

  // UPDATE APARTMENTS WHEN LOCATION CHANGES
  useEffect(() => {
    if (locationValue) {
      const count = data[locationValue].apartments;
      let arr = [];
      for (let i = 1; i <= count; i++) {
        arr.push({ label: `${locationValue} Apt ${i}`, value: i });
      }
      setApartmentList(arr);

      setApartmentValue(null);
      setFloorValue(null);
      setFlatValue(null);
      setFloorList([]);
      setFlatList([]);
    }
  }, [locationValue]);

  // UPDATE FLOORS
  useEffect(() => {
    if (apartmentValue && locationValue) {
      const count = data[locationValue].floors;
      let arr = [];
      for (let i = 1; i <= count; i++) {
        arr.push({ label: `Floor ${i}`, value: i });
      }
      setFloorList(arr);

      setFloorValue(null);
      setFlatValue(null);
      setFlatList([]);
    }
  }, [apartmentValue]);

  // UPDATE FLATS
  useEffect(() => {
    if (floorValue && locationValue) {
      const count = data[locationValue].flats;
      let arr = [];
      for (let i = 1; i <= count; i++) {
        arr.push({ label: `Flat ${i}`, value: i });
      }
      setFlatList(arr);

      setFlatValue(null);
    }
  }, [floorValue]);

  return (
    <LinearGradient colors={["#A9D8FF", "#7DB7FF"]} style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 80 }}
        nestedScrollEnabled={true}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Select Apartment</Text>
          <Text style={styles.sub}>Search Apar</Text>

          {/* LOCATION */}
          <Text style={styles.label}>Select Location</Text>
          <View style={[styles.relative, { zIndex: 4000 }]}>
            <DropDownPicker
              open={locationOpen}
              value={locationValue}
              items={locationList}
              setOpen={setLocationOpen}
              setValue={setLocationValue}
              placeholder="Select Location"
              listMode="SCROLLVIEW"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          {/* APARTMENT */}
          <Text style={styles.label}>Select Apartment</Text>
          <View style={[styles.relative, { zIndex: 3000 }]}>
            <DropDownPicker
              open={apartmentOpen}
              value={apartmentValue}
              items={apartmentList}
              setOpen={setApartmentOpen}
              setValue={setApartmentValue}
              placeholder="Select Apartment"
              disabled={!locationValue}
              listMode="SCROLLVIEW"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          {/* FLOOR */}
          <Text style={styles.label}>Select Floor</Text>
          <View style={[styles.relative, { zIndex: 2000 }]}>
            <DropDownPicker
              open={floorOpen}
              value={floorValue}
              items={floorList}
              setOpen={setFloorOpen}
              setValue={setFloorValue}
              placeholder="Select Floor"
              disabled={!apartmentValue}
              listMode="SCROLLVIEW"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          {/* FLAT */}
          <Text style={styles.label}>Select Flat</Text>
          <View style={[styles.relative, { zIndex: 1000 }]}>
            <DropDownPicker
              open={flatOpen}
              value={flatValue}
              items={flatList}
              setOpen={setFlatOpen}
              setValue={setFlatValue}
              placeholder="Select Flat"
              disabled={!floorValue}
              listMode="SCROLLVIEW"
              style={styles.dropdown}
              dropDownContainerStyle={[styles.dropdownContainer, { zIndex: 9999 }]}
            />
          </View>

          {/* SUBMIT BUTTON WITH NAVIGATION */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push({
                pathname: "/apartment-details",
                params: {
                  location: locationValue,
                  apartment: apartmentValue,
                  floor: floorValue,
                  flat: flatValue,
                },
              });
            }}
          >
            <LinearGradient colors={["#0E7BFF", "#3DA0FF"]} style={styles.buttonInner}>
              <Text style={styles.buttonText}>Submit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    width: "85%",
    backgroundColor: "white",
    padding: 25,
    borderRadius: 20,
    elevation: 5,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#1F1F1F" },
  sub: { marginTop: -5, marginBottom: 15, color: "#777" },
  label: { marginTop: 15, marginBottom: 5, color: "#666", fontSize: 13 },
  dropdown: { borderColor: "#B5C8E6", marginBottom: 10 },
  dropdownContainer: { borderColor: "#B5C8E6", backgroundColor: "white" },
  relative: { position: "relative" },
  button: { marginTop: 20 },
  buttonInner: {
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "700" },
});
