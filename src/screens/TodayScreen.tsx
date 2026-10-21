import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { ProgressRing } from '../components/ProgressRing';
import { SplitBar } from '../components/SplitBar';
import { FoodRow } from '../components/FoodRow';
import { SearchModal } from '../components/SearchModal';
import { QuickLogModal } from '../components/QuickLogModal';
import { ScanResultModal } from '../components/ScanResultModal';
import { PaywallModal } from '../components/PaywallModal';
import { AiConsentModal } from '../components/AiConsentModal';
import { EditEntryModal } from '../components/EditEntryModal';
import { ConfettiCelebration } from '../components/ConfettiCelebration';
import { scanMealPhoto } from '../services/geminiVision';
import { FoodEntry, GeminiScanResult } from '../types';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';

export const TodayScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    colors,
    dailyGoal,
    entries,
    todayEntries,
    todayTotal,
    todaySoluble,
    todayInsoluble,
    addEntry,
    updateEntry,
    deleteEntry,
    profile,
    updateProfile,
    paywallVisible,
    setPaywallVisible,
    upgradeToPlus,
    setAiConsent,
  } = useApp();

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<GeminiScanResult | null>(null);
  const [logChoiceModalVisible, setLogChoiceModalVisible] = useState(false);
  const [aiConsentModalVisible, setAiConsentModalVisible] = useState(false);
  const [pendingScanSource, setPendingScanSource] = useState<'camera' | 'gallery' | null>(null);

  // Goal hit celebration confetti
  const [showCelebration, setShowCelebration] = useState(false);
  const prevTotalRef = useRef(todayTotal);

  useEffect(() => {
    if (todayTotal >= dailyGoal && prevTotalRef.current < dailyGoal && dailyGoal > 0) {
      setShowCelebration(true);
    }
    prevTotalRef.current = todayTotal;
  }, [todayTotal, dailyGoal]);

  // Edit logged meal modal state
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleOpenEdit = (entry: FoodEntry) => {
    setEditingEntry(entry);
    setEditModalVisible(true);
  };

  // Search query for Today's Log Card (filters today's entries and searches past meals)
  const [mealSearchQuery, setMealSearchQuery] = useState('');

  // 1. Filtered today entries based on inner search bar
  const filteredTodayEntries = useMemo(() => {
    const q = mealSearchQuery.trim().toLowerCase();
    if (!q) return todayEntries;
    return todayEntries.filter((e) => e.name.toLowerCase().includes(q));
  }, [todayEntries, mealSearchQuery]);

  // 2. Previously logged meals matching the search query (to easily re-log)
  const pastHistoryMatches = useMemo(() => {
    const q = mealSearchQuery.trim().toLowerCase();
    if (!q) return [];
    const todayIds = new Set(todayEntries.map((e) => e.id));
    const seenNames = new Set(filteredTodayEntries.map((e) => e.name.toLowerCase()));
    const matches: FoodEntry[] = [];

    for (const e of entries) {
      if (todayIds.has(e.id)) continue;
      const lower = e.name.toLowerCase();
      if (lower.includes(q) && !seenNames.has(lower)) {
        seenNames.add(lower);
        matches.push(e);
      }
    }
    return matches;
  }, [entries, todayEntries, filteredTodayEntries, mealSearchQuery]);

  // AI Camera Scan Handler (Direct camera launch)
  const handleScanCamera = async () => {
    setLogChoiceModalVisible(false);

    // Apple Guideline: Check AI consent first
    if (!profile.hasGivenAiConsent) {
      setPendingScanSource('camera');
      setAiConsentModalVisible(true);
      return;
    }

    // Allow choice modal dismiss animation to complete on iOS
    await new Promise((r) => setTimeout(r, 280));

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Needed',
          'Please allow camera access in your device settings to scan your meal photo.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!pickerResult.canceled && pickerResult.assets?.[0]) {
        const asset = pickerResult.assets[0];
        setScanLoading(true);

        try {
          const result = await scanMealPhoto(asset.base64 || '', asset.uri);
          updateProfile({ aiScanCount: (profile.aiScanCount || 0) + 1 });
          setScanResult(result);
          setScanLoading(false);
          // Allow in-tree loading overlay to dismiss before presenting ScanResultModal
          setTimeout(() => {
            setScanModalVisible(true);
          }, 150);
        } catch {
          setScanLoading(false);
          Alert.alert(
            'Analysis Error',
            'Could not analyze photo. Please try again or log manually.'
          );
        }
      }
    } catch {
      setScanLoading(false);
      Alert.alert('Camera Error', 'Could not open camera.');
    }
  };

  // AI Gallery Scan Handler (Direct gallery launch)
  const handleScanGallery = async () => {
    setLogChoiceModalVisible(false);

    // Apple Guideline: Check AI consent first
    if (!profile.hasGivenAiConsent) {
      setPendingScanSource('gallery');
      setAiConsentModalVisible(true);
      return;
    }

    // Allow choice modal dismiss animation to complete on iOS
    await new Promise((r) => setTimeout(r, 280));

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photos Permission Needed',
          'Please allow photo library access in your device settings to select a meal photo.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const galleryResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (!galleryResult.canceled && galleryResult.assets?.[0]) {
        const asset = galleryResult.assets[0];
        setScanLoading(true);
        try {
          const result = await scanMealPhoto(asset.base64 || '', asset.uri);
          updateProfile({ aiScanCount: (profile.aiScanCount || 0) + 1 });
          setScanResult(result);
          setScanLoading(false);
          // Allow in-tree loading overlay to dismiss before presenting ScanResultModal
          setTimeout(() => {
            setScanModalVisible(true);
          }, 150);
        } catch {
          setScanLoading(false);
          Alert.alert('Analysis Error', 'Could not process meal image.');
        }
      }
    } catch {
      setScanLoading(false);
      Alert.alert('Gallery Error', 'Could not open photo gallery.');
    }
  };

  const handleConsentAgree = async () => {
    await setAiConsent(true);
    setAiConsentModalVisible(false);
    const source = pendingScanSource;
    setPendingScanSource(null);
    if (source === 'camera') {
      setTimeout(() => handleScanCamera(), 250);
    } else if (source === 'gallery') {
      setTimeout(() => handleScanGallery(), 250);
    }
  };

  const handleConsentDecline = () => {
    setAiConsentModalVisible(false);
    setPendingScanSource(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Topbar with exact green background and safe-area padding */}
      <TopBar title="FiberSnap" subtitle="Track dietary fiber, in a snap." showGoalBadge={true} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 90, // guarantees scrollable above the elevated bottom tab bar
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Ring Card matching fibersnap.html */}
        <View style={styles.sectionSpacer}>
          <TouchableOpacity
            activeOpacity={todayTotal >= dailyGoal ? 0.8 : 1}
            onPress={() => {
              if (todayTotal >= dailyGoal) {
                setShowCelebration(true);
              }
            }}
          >
            <ProgressRing currentGrams={todayTotal} goalGrams={dailyGoal} />
          </TouchableOpacity>
        </View>

        {/* Buttons Row matching Screenshot 1 */}
        <View style={styles.btnRow}>
          {/* AI Log Food Button (opens camera/gallery popup) */}
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, { backgroundColor: colors.accent, borderColor: colors.accent }]}
            onPress={() => setLogChoiceModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={14} color={colors.accentInk} style={{ marginRight: 6 }} />
            <Text style={[styles.btnPrimaryText, { color: colors.accentInk }]}>+ Log a food</Text>
          </TouchableOpacity>

          {/* Custom Amount */}
          <TouchableOpacity
            style={[styles.btn, styles.btnCustom, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            onPress={() => setQuickLogVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnCustomText, { color: colors.ink }]}>+ Custom amount</Text>
          </TouchableOpacity>
        </View>

        {/* Outer Search Bar: Search USDA Food Database to log new items (outside card, below action buttons) */}
        <TouchableOpacity
          style={[styles.outerSearchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setSearchModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="search" size={17} color={colors.accentDeep} style={styles.searchIcon} />
          <Text style={[styles.outerSearchPlaceholder, { color: colors.inkSoft }]}>
            Search USDA food database to log...
          </Text>
          <View style={[styles.usdaBadge, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.usdaBadgeText, { color: colors.accentDeep }]}>USDA</Text>
          </View>
        </TouchableOpacity>

        {/* Today's Log Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.logHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Today's Log</Text>
            {todayEntries.length > 0 && (
              <Text style={[styles.logCount, { color: colors.inkSoft }]}>
                {todayEntries.length} {todayEntries.length === 1 ? 'item' : 'items'}
              </Text>
            )}
          </View>

          {/* Inner Search Bar: Filter today's meals and search user's meal history */}
          <View style={[styles.innerSearchWrap, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Ionicons name="filter-outline" size={15} color={colors.inkSoft} style={styles.searchIcon} />
            <TextInput
              style={[styles.innerSearchInput, { color: colors.ink }]}
              placeholder="Search today's meals or history..."
              placeholderTextColor={colors.inkFaint}
              value={mealSearchQuery}
              onChangeText={setMealSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {mealSearchQuery.trim() !== '' && (
              <TouchableOpacity onPress={() => setMealSearchQuery('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={16} color={colors.inkFaint} />
              </TouchableOpacity>
            )}
          </View>

          {/* When actively searching */}
          {mealSearchQuery.trim() !== '' ? (
            <View>
              {filteredTodayEntries.length > 0 && (
                <View>
                  <Text style={[styles.filterSubheader, { color: colors.inkFaint }]}>
                    TODAY'S MATCHES ({filteredTodayEntries.length})
                  </Text>
                  {filteredTodayEntries.map((entry) => (
                    <FoodRow
                      key={entry.id}
                      entry={entry}
                      onEdit={handleOpenEdit}
                      onDelete={(id) => {
                        Alert.alert('Remove Entry', `Remove "${entry.name}" from today?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Remove', style: 'destructive', onPress: () => deleteEntry(id) },
                        ]);
                      }}
                    />
                  ))}
                </View>
              )}

              {/* Matching meals from user's history that can be re-logged */}
              {pastHistoryMatches.length > 0 && (
                <View style={{ marginTop: filteredTodayEntries.length > 0 ? 16 : 0 }}>
                  <Text style={[styles.filterSubheader, { color: colors.accentDeep }]}>
                    PAST LOGGED MEALS (TAP TO RE-LOG):
                  </Text>
                  {pastHistoryMatches.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.historyMatchRow,
                        { backgroundColor: colors.surface2, borderColor: colors.border },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.historyMatchName, { color: colors.ink }]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.historyMatchSub, { color: colors.inkSoft }]}>
                          {item.portion} · {item.totalGrams}g fiber
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.reLogBtn, { backgroundColor: colors.accent }]}
                        onPress={() => {
                          addEntry({
                            name: item.name,
                            portion: item.portion,
                            totalGrams: item.totalGrams,
                            solubleGrams: item.solubleGrams,
                            insolubleGrams: item.insolubleGrams,
                            source: item.source,
                            tag: item.tag,
                            imageUri: item.imageUri,
                          });
                          Alert.alert('Meal Logged', `Logged "${item.name}" (${item.totalGrams}g) for today!`);
                          setMealSearchQuery('');
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="add" size={14} color={colors.accentInk} />
                        <Text style={[styles.reLogBtnText, { color: colors.accentInk }]}>Log again</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {filteredTodayEntries.length === 0 && pastHistoryMatches.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyHint, { color: colors.inkSoft }]}>
                    No meal matches "{mealSearchQuery}" in today's log or past history.
                  </Text>
                  <TouchableOpacity
                    style={[styles.searchUsdaPromptBtn, { backgroundColor: colors.accentSoft }]}
                    onPress={() => {
                      setSearchModalVisible(true);
                    }}
                  >
                    <Ionicons name="search" size={14} color={colors.accentDeep} style={{ marginRight: 6 }} />
                    <Text style={[styles.searchUsdaPromptText, { color: colors.accentDeep }]}>
                      Search USDA Database for "{mealSearchQuery}"
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* Normal today log view when no search active */
            todayEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyHint, { color: colors.inkSoft }]}>
                  Nothing logged yet today — search above or tap "+ Log a food" to add your first meal.
                </Text>
              </View>
            ) : (
              todayEntries.map((entry) => (
                <FoodRow
                  key={entry.id}
                  entry={entry}
                  onEdit={handleOpenEdit}
                  onDelete={(id) => {
                    Alert.alert('Remove Entry', `Remove "${entry.name}" from today?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => deleteEntry(id) },
                    ]);
                  }}
                />
              ))
            )
          )}
        </View>
      </ScrollView>

      {/* Modals - conditionally mounted to prevent iOS UIKit modal touch interception */}
      {searchModalVisible && (
        <SearchModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
          onSelectFood={(data) => {
            addEntry({ ...data, source: 'usda' });
          }}
        />
      )}

      {quickLogVisible && (
        <QuickLogModal
          visible={quickLogVisible}
          onClose={() => setQuickLogVisible(false)}
          onSave={(data) => {
            addEntry({ ...data, source: 'manual' });
          }}
        />
      )}

      {scanModalVisible && (
        <ScanResultModal
          visible={scanModalVisible}
          result={scanResult}
          onClose={() => setScanModalVisible(false)}
          onConfirm={(confirmed) => {
            addEntry({
              name: confirmed.name,
              portion: confirmed.portion,
              totalGrams: confirmed.totalGrams,
              solubleGrams: confirmed.solubleGrams,
              insolubleGrams: confirmed.insolubleGrams,
              source: 'ai_scan',
              imageUri: confirmed.imageUri,
            });
            Alert.alert('Meal Logged', `Logged "${confirmed.name}" (${confirmed.totalGrams}g fiber) for today!`);
          }}
        />
      )}

      {paywallVisible && (
        <PaywallModal
          visible={paywallVisible}
          onClose={() => setPaywallVisible(false)}
          onUpgradeSuccess={() => {
            upgradeToPlus();
            Alert.alert('FiberSnap Plus Active', 'Enjoy unlimited AI meal vision scans!');
          }}
        />
      )}

      {editModalVisible && (
        <EditEntryModal
          visible={editModalVisible}
          entry={editingEntry}
          onClose={() => {
            setEditModalVisible(false);
            setEditingEntry(null);
          }}
          onSave={async (id, updates) => {
            await updateEntry(id, updates);
          }}
          onDelete={(id) => deleteEntry(id)}
        />
      )}

      {/* Log Food Choice Popup Modal (Camera vs Gallery vs Database) */}
      {logChoiceModalVisible && (
        <Modal
          visible={logChoiceModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setLogChoiceModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setLogChoiceModalVisible(false)}
            />
            <View
              style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {/* Header Icon & Title */}
              <View style={[styles.modalIconWrap, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="sparkles" size={26} color={colors.accentDeep} />
              </View>

              <Text style={[styles.modalTitle, { color: colors.ink }]}>
                Log a Food with AI
              </Text>

              <Text style={[styles.modalSub, { color: colors.inkSoft }]}>
                Snap or select a meal photo to calculate dietary fiber automatically using Gemini AI Vision.
              </Text>

              {/* Option 1: Take Photo / Camera */}
              <TouchableOpacity
                style={[styles.choiceBtn, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}
                onPress={handleScanCamera}
                activeOpacity={0.85}
              >
                <View style={[styles.choiceIconWrap, { backgroundColor: colors.accent }]}>
                  <Ionicons name="camera" size={20} color={colors.accentInk} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.choiceTitle, { color: colors.ink }]}>Take Photo (Camera)</Text>
                  <Text style={[styles.choiceSub, { color: colors.inkSoft }]}>
                    Snap your plate to scan fiber instantly
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
              </TouchableOpacity>

              {/* Option 2: Upload from Gallery */}
              <TouchableOpacity
                style={[styles.choiceBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
                onPress={handleScanGallery}
                activeOpacity={0.85}
              >
                <View style={[styles.choiceIconWrap, { backgroundColor: colors.surface }]}>
                  <Ionicons name="images" size={20} color={colors.accentDeep} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.choiceTitle, { color: colors.ink }]}>Select from Gallery</Text>
                  <Text style={[styles.choiceSub, { color: colors.inkSoft }]}>
                    Upload an existing meal photo
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
              </TouchableOpacity>

              {/* Option 3: Search USDA Database (Manual) */}
              <TouchableOpacity
                style={[styles.choiceBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
                onPress={() => {
                  setLogChoiceModalVisible(false);
                  setSearchModalVisible(true);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.choiceIconWrap, { backgroundColor: colors.surface }]}>
                  <Ionicons name="search" size={19} color={colors.inkSoft} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.choiceTitle, { color: colors.ink }]}>Search USDA Database</Text>
                  <Text style={[styles.choiceSub, { color: colors.inkSoft }]}>
                    Find 300,000+ foods without a photo
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: colors.surface2 }]}
                onPress={() => setLogChoiceModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={[styles.cancelBtnText, { color: colors.inkSoft }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* AI Vision Processing In-Tree Overlay (prevents iOS UIKit modal conflicts) */}
      {scanLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay, { zIndex: 99999 }]}>
          <View style={[styles.loadingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.accentDeep} style={{ marginBottom: 14 }} />
            <Text style={[styles.loadingTitle, { color: colors.ink }]}>
              Scanning Meal with Gemini AI...
            </Text>
            <Text style={[styles.loadingSub, { color: colors.inkSoft }]}>
              Detecting ingredients and calculating soluble & insoluble fiber split
            </Text>
          </View>
        </View>
      )}

      {/* Apple App Store AI Scanning Consent Modal */}
      {aiConsentModalVisible && (
        <AiConsentModal
          visible={aiConsentModalVisible}
          onAgree={handleConsentAgree}
          onDecline={handleConsentDecline}
        />
      )}

      {/* Goal Hit Celebration Confetti */}
      <ConfettiCelebration
        visible={showCelebration}
        goalGrams={dailyGoal}
        onDismiss={() => setShowCelebration(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  sectionSpacer: {
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  btnPrimary: {
    ...SHADOWS.soft,
  },
  btnPrimaryText: {
    fontWeight: '700',
    fontSize: 13,
  },
  btnAi: {
    borderWidth: 0,
    ...SHADOWS.soft,
  },
  btnAiText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  btnCustom: {
    borderWidth: 1,
  },
  btnCustomText: {
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    marginHorizontal: 16,
    ...SHADOWS.card,
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: FONTS.serif,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
  },
  logCount: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  outerSearchWrap: {
    marginHorizontal: 16,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    ...SHADOWS.soft,
  },
  outerSearchPlaceholder: {
    fontSize: 13.5,
    flex: 1,
  },
  usdaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  usdaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  innerSearchWrap: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 14,
  },
  innerSearchInput: {
    flex: 1,
    fontSize: 13.5,
    paddingVertical: 0,
  },
  filterSubheader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 6,
  },
  historyMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyMatchName: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyMatchSub: {
    fontSize: 12,
    marginTop: 2,
  },
  reLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  reLogBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchUsdaPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    marginTop: 10,
  },
  searchUsdaPromptText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchWrap: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 13.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 26,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 22,
    gap: 12,
    ...SHADOWS.card,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: FONTS.serif,
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  choiceIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  choiceSub: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelBtn: {
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 26,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  loadingSub: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 17,
  },
});
