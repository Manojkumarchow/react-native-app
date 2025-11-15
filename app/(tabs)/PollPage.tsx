import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PollsPage = ({ buildingId = "01" }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // For poll creation
  const [newTitle, setNewTitle] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);

  // Fetch user and all polls on mount and buildings changes
  useEffect(() => {
    fetchUserAndPolls();
  }, [buildingId]);

  const fetchUserAndPolls = async () => {
    try {
      setLoading(true);
      const userJson = await AsyncStorage.getItem("user");
      if (userJson) {
        const userObj = JSON.parse(userJson);
        setUser(userObj);
        const response = await fetch(
          `http://localhost:8080/whistleup/poll/all/${buildingId}/`
        );
        if (!response.ok) throw new Error("Failed to fetch polls");
        const allPolls = await response.json();
        setPolls(allPolls);
      } else {
        Alert.alert("User not found", "Please login again.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Poll creation handlers
  const addOption = () => setNewOptions([...newOptions, ""]);
  const removeOption = (index) =>
    setNewOptions(newOptions.filter((_, i) => i !== index));
  const updateOption = (text, index) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = text;
    setNewOptions(updatedOptions);
  };

  const createPoll = async () => {
    if (!newTitle.trim() || newOptions.some((opt) => !opt.trim())) {
      Alert.alert("Validation", "Title and all options are required");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://localhost:8080/whistleup/poll/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          options: newOptions,
          createdByUserId: user.userId,
          buildingId: buildingId,
        }),
      });
      if (response.ok) {
        Alert.alert("Poll created!");
        setNewTitle("");
        setNewOptions(["", ""]);
        fetchUserAndPolls(); // Refresh to show new poll
      } else {
        const err = await response.text();
        throw new Error(err || "Failed to create poll");
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  // Voting handler
  const voteOnPoll = async (pollId, optionId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/whistleup/poll/vote/${pollId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ optionId }),
      });
      if (response.ok) {
        Alert.alert("Vote recorded");
        fetchUserAndPolls(); // Refresh to get updated votes
      } else {
        const err = await response.text();
        throw new Error(err || "Failed to vote");
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const renderPoll = ({ item }) => {
    const maxVotes = Math.max(...item.options.map((o) => o.votes || 0));
    return (
      <View style={styles.pollContainer}>
        <Text style={styles.pollTitle}>{item.title}</Text>
        {item.options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => !item.isClosed && voteOnPoll(item.pollId, opt.id)}
            disabled={item.isClosed}
            style={[
              styles.optionButton,
              opt.votes === maxVotes && maxVotes > 0
                ? styles.optionSelected
                : styles.optionDefault,
              item.isClosed && styles.optionDisabled,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                opt.votes === maxVotes && maxVotes > 0
                  ? styles.optionTextSelected
                  : null,
              ]}
            >
              {opt.text} ({opt.votes || 0} votes)
            </Text>
          </TouchableOpacity>
        ))}
        <Text>Status: {item.isClosed ? "Closed" : "Open"}</Text>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#008C9E" />;
  }

  if (!user) {
    return <Text style={styles.centerText}>Please log in to see polls.</Text>;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.createPollBox}>
        <Text style={styles.sectionTitle}>Create New Poll</Text>
        <TextInput
          style={styles.input}
          placeholder="Poll Title"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        {newOptions.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={`Option ${index + 1}`}
              value={option}
              onChangeText={(text) => updateOption(text, index)}
            />
            {newOptions.length > 2 && (
              <TouchableOpacity
                onPress={() => removeOption(index)}
                style={styles.removeBtn}
              >
                <Text style={{ color: "red", fontWeight: "bold" }}>X</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={addOption} style={styles.addOptionBtn}>
          <Text style={{ color: "#008C9E" }}>+ Add Option</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={createPoll} style={styles.createPollBtn}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Create Poll</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Active Polls</Text>
      {polls.length === 0 ? (
        <Text style={styles.centerText}>No polls available.</Text>
      ) : (
        <FlatList
          data={polls}
          keyExtractor={(item) => item.pollId.toString()}
          renderItem={renderPoll}
          scrollEnabled={false}
          style={{ marginBottom: 20 }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  centerText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#777" },
  createPollBox: {
    backgroundColor: "#f0f8ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#008C9E",
  },
  input: {
    borderWidth: 1,
    borderColor: "#008C9E",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  removeBtn: {
    marginLeft: 8,
    padding: 4,
  },
  addOptionBtn: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  createPollBtn: {
    backgroundColor: "#008C9E",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  pollContainer: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  pollTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#111" },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  optionDefault: {
    backgroundColor: "#ddd",
  },
  optionSelected: {
    backgroundColor: "#008C9E",
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PollsPage;
