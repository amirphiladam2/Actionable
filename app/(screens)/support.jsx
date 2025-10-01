import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ThemeContext } from '../../context/ThemeContext'

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
  const openDocs = () => Linking.openURL('https://beacons.ai/amir.adam');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>Find answers or contact us</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>FAQs</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>Contact</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.row} onPress={openEmail}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}>
                  <Ionicons name="mail-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Email Support</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.muted }]}>Click to send an email</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={openDocs}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: colors.accent + '20', borderColor: colors.accent + '40' }]}>
                  <Ionicons name="code-outline" size={18} color={colors.accent} />
                </View>
                
                <View>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Developer</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.muted }]}>Amir Adam</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color={colors.muted} />
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
  },
  rowSubtitle: {
    fontSize: 12,
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