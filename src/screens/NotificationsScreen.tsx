import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';

interface TimeOption {
  value: string;
  label: string;
  period: string;
}

const TIME_OPTIONS: TimeOption[] = [
  { value: '6:00 AM', label: '6:00 AM', period: 'Early Morning' },
  { value: '9:00 AM', label: '9:00 AM', period: 'Morning' },
  { value: '12:00 PM', label: '12:00 PM', period: 'Lunch / Midday' },
  { value: '2:00 PM', label: '2:00 PM', period: 'Afternoon' },
  { value: '5:00 PM', label: '5:00 PM', period: 'Late Afternoon' },
  { value: '7:00 PM', label: '7:00 PM', period: 'Evening' },
];

export const NotificationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, profile, updateProfile } = useApp();

  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(
    profile.dailyRemindersEnabled ?? true
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    profile.reminderTime || '7:00 PM'
  );
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const handleToggle = async (val: boolean) => {
    setRemindersEnabled(val);
    await updateProfile({
      dailyRemindersEnabled: val,
      reminderTime: selectedTime,
    });
  };

  const handleSelectTime = async (time: string) => {
    setSelectedTime(time);
    setDropdownVisible(false);
    await updateProfile({
      dailyRemindersEnabled: true,
      reminderTime: time,
    });
  };

  const currentTimeOption =
    TIME_OPTIONS.find((t) => t.value === selectedTime) || TIME_OPTIONS[5];

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
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Notifications</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Daily Reminder Row */}
          <View style={styles.toggleRow}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surface2 }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.accentDeep} />
            </View>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.itemTitle, { color: colors.ink }]}>Daily Reminders</Text>
              <Text style={[styles.itemSubtitle, { color: colors.inkSoft }]}>
                Receive a daily alert to log your fiber intake and stay consistent
              </Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={handleToggle}
              trackColor={{
                false: colors.isDark ? '#4A4A3E' : '#D1CEBF',
                true: colors.accent,
              }}
              thumbColor={
                remindersEnabled
                  ? '#FFFFFF'
                  : (colors.isDark ? '#A9A88F' : '#8A8778')
              }
              ios_backgroundColor={colors.isDark ? '#4A4A3E' : '#D1CEBF'}
            />
          </View>

          {/* Time Selector Row (Visible when enabled) */}
          {remindersEnabled && (
            <View style={[styles.timeSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>REMINDER TIME</Text>
              <TouchableOpacity
                style={[
                  styles.timeDropdownBtn,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
                onPress={() => setDropdownVisible(true)}
                activeOpacity={0.8}
              >
                <View style={styles.timeInfoCol}>
                  <Text style={[styles.timeValueText, { color: colors.ink }]}>
                    {currentTimeOption.label}
                  </Text>
                  <Text style={[styles.timePeriodText, { color: colors.inkSoft }]}>
                    {currentTimeOption.period}
                  </Text>
                </View>
                <View style={[styles.chevronWrap, { backgroundColor: colors.surface }]}>
                  <Ionicons name="chevron-down" size={16} color={colors.accentDeep} />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Informative Guidance Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="time-outline" size={18} color={colors.accentDeep} style={{ marginRight: 6 }} />
            <Text style={[styles.infoCardTitle, { color: colors.ink }]}>Why Daily Reminders Work</Text>
          </View>
          <Text style={[styles.infoCardText, { color: colors.inkSoft }]}>
            Consistency is the single biggest factor in improving dietary fiber intake. Setting a reminder near your evening meal or midday routine makes logging a natural daily habit.
          </Text>
          <View style={[styles.noteBox, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.accentDeep} style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={[styles.noteBoxText, { color: colors.accentDeep }]}>
              FiberSnap notifications are delivered locally on your device and will never spam you.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Time Selection Modal / Dropdown */}
      {dropdownVisible && (
        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          >
            <View
              style={[
                styles.modalCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.ink }]}>Select Reminder Time</Text>
                <TouchableOpacity
                  onPress={() => setDropdownVisible(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={22} color={colors.inkFaint} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalHint, { color: colors.inkSoft }]}>
                Choose when you would like FiberSnap to remind you each day:
              </Text>

              {TIME_OPTIONS.map((opt) => {
                const isSelected = opt.value === selectedTime;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isSelected ? colors.accentSoft : colors.surface2,
                        borderColor: isSelected ? colors.accentDeep : colors.border,
                      },
                    ]}
                    onPress={() => handleSelectTime(opt.value)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.radioDotWrap}>
                      <View
                        style={[
                          styles.radioOuter,
                          { borderColor: isSelected ? colors.accentDeep : colors.inkFaint },
                        ]}
                      >
                        {isSelected && (
                          <View
                            style={[
                              styles.radioInner,
                              { backgroundColor: colors.accentDeep },
                            ]}
                          />
                        )}
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: isSelected ? colors.accentDeep : colors.ink, fontWeight: isSelected ? '700' : '600' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={[styles.optionPeriod, { color: colors.inkSoft }]}>
                        {opt.period}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={colors.accentDeep} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONTS.serif,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 18,
    ...SHADOWS.card,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12.5,
    lineHeight: 16.5,
  },
  timeSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  timeDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  timeInfoCol: {
    flex: 1,
  },
  timeValueText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  timePeriodText: {
    fontSize: 12,
  },
  chevronWrap: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  infoCardText: {
    fontSize: 13,
    lineHeight: 18.5,
    marginBottom: 12,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: RADIUS.md,
  },
  noteBoxText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16.5,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONTS.serif,
  },
  modalHint: {
    fontSize: 12.5,
    marginBottom: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  radioDotWrap: {
    marginRight: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionLabel: {
    fontSize: 14.5,
  },
  optionPeriod: {
    fontSize: 11.5,
    marginTop: 1,
  },
});
