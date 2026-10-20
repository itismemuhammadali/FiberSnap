import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { RADIUS, SHADOWS } from '../constants/theme';

export const ContactScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, profile } = useApp();

  const [category, setCategory] = useState<'feedback' | 'bug' | 'feature' | 'question'>('feedback');
  const [email, setEmail] = useState(profile.email || '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const categories = [
    { id: 'feedback', label: 'General Feedback', icon: 'chatbubble-ellipses-outline' },
    { id: 'bug', label: 'Report a Bug', icon: 'bug-outline' },
    { id: 'feature', label: 'Feature Request', icon: 'bulb-outline' },
    { id: 'question', label: 'Question', icon: 'help-circle-outline' },
  ];

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert('Message Required', 'Please enter your message or feedback.');
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 900);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 20) + 8,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Contact & Feedback</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 36 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {sent ? (
            <View style={[styles.card, styles.successCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.successCircle, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="checkmark-done" size={36} color={colors.accentDeep} />
              </View>
              <Text style={[styles.successTitle, { color: colors.ink }]}>Message Received!</Text>
              <Text style={[styles.successSub, { color: colors.inkSoft }]}>
                Thank you for helping us improve FiberSnap. Our team will review your message and reach out if necessary.
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.accent, marginTop: 20 }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.primaryBtnText, { color: colors.accentInk }]}>Back to Profile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.ink }]}>We'd Love Your Input</Text>
              <Text style={[styles.cardSub, { color: colors.inkSoft }]}>
                Have an idea for a feature, discovered an issue with a food item, or need help? Send us a note.
              </Text>

              {/* Category Chips */}
              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>TOPIC</Text>
              <View style={styles.catGrid}>
                {categories.map((c) => {
                  const isSelected = category === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.catChip,
                        {
                          backgroundColor: isSelected ? colors.accent : colors.surface2,
                          borderColor: isSelected ? colors.accentDeep : colors.border,
                        },
                      ]}
                      onPress={() => setCategory(c.id as any)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={c.icon as any}
                        size={16}
                        color={isSelected ? colors.accentInk : colors.inkSoft}
                      />
                      <Text
                        style={[
                          styles.catChipText,
                          {
                            color: isSelected ? colors.accentInk : colors.ink,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Email Address */}
              <Text style={[styles.fieldLabel, { color: colors.inkSoft, marginTop: 16 }]}>YOUR EMAIL</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink },
                ]}
                placeholder="you@example.com"
                placeholderTextColor={colors.inkFaint}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              {/* Message Box */}
              <Text style={[styles.fieldLabel, { color: colors.inkSoft, marginTop: 16 }]}>MESSAGE *</Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink },
                ]}
                placeholder="Tell us what's on your mind..."
                placeholderTextColor={colors.inkFaint}
                multiline
                numberOfLines={6}
                value={message}
                onChangeText={setMessage}
              />

              {/* Send Button */}
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.accent, marginTop: 22 }]}
                onPress={handleSend}
                disabled={sending}
                activeOpacity={0.88}
              >
                <Ionicons name="send" size={17} color={colors.accentInk} />
                <Text style={[styles.primaryBtnText, { color: colors.accentInk }]}>
                  {sending ? 'Sending...' : 'Send Message'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 22,
    ...SHADOWS.card,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12.5,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    height: 50,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.card,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  successCard: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
