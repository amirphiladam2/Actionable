import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, StatusBar } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ThemeContext } from '../../context/ThemeContext'
import { useRouter } from 'expo-router'

const FAQS = [
  {
    q: 'How do I enable reminders?',
    a: 'Set due dates on tasks. The app schedules local reminders 1 hour before and at due time. For remote push, use a dev or production build.'
  },
  {
    q: 'Why Google sign-in opens a browser?',
    a: 'On mobile, OAuth flows use the system web session for security. You will be redirected back to the app automatically.'
  },
  {
    q: 'I am not seeing push notifications',
    a: 'Expo Go does not support remote push. Build a development or production app to receive push notifications.'
  }
];

export default function SupportScreen() {
  const { colors } = React.useContext(ThemeContext);
  const router = useRouter();
  const [openIdx, setOpenIdx] = useState(-1);

  const toggleIdx = (idx) => setOpenIdx((v) => (v === idx ? -1 : idx));

  const openEmail = () => Linking.openURL('mailto:amirdev37@gmail.com?subject=Support%20Request');
  const openDocs = () => Linking.openURL('https://docs.expo.dev/push-notifications/overview/');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>Find answers or contact us</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {FAQS.map((item, idx) => (
              <View key={idx} style={styles.faqItem}>
                <TouchableOpacity style={styles.faqQuestion} onPress={() => toggleIdx(idx)}>
                  <Text style={[styles.faqQText, { color: colors.text }]}>{item.q}</Text>
                  <Ionicons name={openIdx === idx ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
                </TouchableOpacity>
                {openIdx === idx && (
                  <Text style={[styles.faqAnswer, { color: colors.muted }]}>{item.a}</Text>
                )}
                {idx < FAQS.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.row} onPress={openEmail}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.2)' }]}>
                  <Ionicons name="mail-outline" size={18} color="#06b6d4" />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Email Support</Text>
                  <Text style={styles.rowSubtitle}>support@example.com</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={openDocs}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(8, 145, 178, 0.08)', borderColor: 'rgba(8, 145, 178, 0.2)' }]}>
                  <Ionicons name="book-outline" size={18} color="#0891b2" />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Push Notifications Guide</Text>
                  <Text style={styles.rowSubtitle}>Expo documentation</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  faqItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  faqQText: {
    fontSize: 16,
    fontWeight: '600',
  },
  faqAnswer: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginTop: 12,
  },
})