import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';


export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/user.png')}
          style={styles.profileImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>RAMANA</Text>
          <Text style={styles.apartment}>CSK</Text>
          <Text style={styles.flat}>Flat, 007</Text>
        </View>
        <View style={styles.headerIcons}>
          <Ionicons name="notifications" size={22} color="#fff" />
          <Ionicons name="menu" size={22} color="#fff" style={{ marginLeft: 10 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product</Text>
          <View style={styles.iconGrid}>
            {[
              { name: 'Residents', icon: 'home' },
              { name: 'Maintenance', icon: 'build' },
              { name: 'Whistle up', icon: 'megaphone' },
              { name: 'Rise Ticket', icon: 'clipboard' },
              { name: 'Chat', icon: 'chatbubbles' },
              { name: 'Watch Man', icon: 'shield' },
              { name: 'Home services', icon: 'people' },
              { name: 'Renting', icon: 'business' },
              { name: 'CC Tv', icon: 'videocam' },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.iconCard}
                onPress={() => alert(`${item.name} clicked`)}
              >
                <Ionicons name={item.icon} size={28} color="#fff" />
                <Text style={styles.iconLabel}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Best Sales Section */}
        <View style={styles.salesSection}>
          <Text style={styles.sectionTitle}>Best Sales</Text>
          <View style={styles.salesRow}>
            <View style={styles.saleCard}>
              <Image
                source={require('../../assets/images/sofa1.png')}
                style={styles.sofaImage}
              />
              <Text style={styles.price}>7,000</Text>
              <Text style={styles.itemName}>Borcell Sofa</Text>
              <Text style={styles.subTitle}>Luxury / Premium Tone</Text>
              <TouchableOpacity style={styles.addBtn}>
                <Text style={styles.addText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.saleCard}>
              <Image
                source={require('../../assets/images/sofa2.png')}
                style={styles.sofaImage}
              />
              <Text style={styles.price}>3,000</Text>
              <Text style={styles.itemName}>Fauget Sofa</Text>
              <Text style={styles.subTitle}>Comfort meets style</Text>
              <TouchableOpacity style={styles.addBtn}>
                <Text style={styles.addText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}


      <View style={styles.bottomNav}>
        {[
          { name: 'Profile', icon: 'person' },
          { name: 'Market Place', icon: 'storefront' },
          { name: 'Home', icon: 'home' },
          { name: 'Cart', icon: 'cart' },
          { name: 'Ledger', icon: 'book' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => {
              if (item.name === 'Profile') {
                router.push('/(tabs)/profile');
              } else {
                alert(`${item.name} clicked`);
              }
            }}
          >
            <Ionicons name={item.icon} size={22} color="#000" />
            <Text style={styles.navText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
}

// same styles as before
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#008C9E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  profileImage: { width: 60, height: 60, borderRadius: 30 },
  userInfo: { flex: 1, marginLeft: 10 },
  userName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  apartment: { color: '#fff', fontSize: 13 },
  flat: { color: '#fff', fontSize: 13 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },

  section: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#3A2D2D', marginBottom: 10 },

  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconCard: {
    backgroundColor: '#F89C1C',
    width: '30%',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 12,
  },
  iconLabel: { color: '#fff', marginTop: 6, fontSize: 13, textAlign: 'center' },

  salesSection: { padding: 16, backgroundColor: '#fff' },
  salesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  saleCard: {
    width: '48%',
    backgroundColor: '#008C9E',
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: 15,
  },
  sofaImage: { width: 100, height: 80, resizeMode: 'contain' },
  price: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  itemName: { color: '#fff', fontSize: 13 },
  subTitle: { color: '#fff', fontSize: 12, fontStyle: 'italic' },
  addBtn: {
    marginTop: 8,
    backgroundColor: '#000',
    width: 25,
    height: 25,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F89C1C',
    paddingVertical: 10,
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 11, color: '#000', marginTop: 2 },
});
