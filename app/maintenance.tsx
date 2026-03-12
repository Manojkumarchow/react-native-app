import React, { useMemo, useState } from "react";
import {
  Switch,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

type Step = 1 | 2 | 3 | 4;
type WaterMode = "FIXED" | "MASTER" | "INDIVIDUAL" | "MIXED";
type WaterSubStep = "MODE" | "INDIVIDUAL" | "MIXED";
type MeterRow = { flatNumber: string; reading: string; units: string };

const ALL_FLATS = ["A-101", "A-102", "A-103", "B-101", "B-201", "B-202", "B-203", "C-301", "C-302", "C-303"];

export default function MaintenanceScreen() {
  const router = useRouter();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [step, setStep] = useState<Step>(1);
  const [waterSubStep, setWaterSubStep] = useState<WaterSubStep>("MODE");

  const years = Array.from({ length: 5 }, (_, i) => `${currentYear - i}`);
  const [selectedYear, setSelectedYear] = useState(`${currentYear}`);
  const [selectedMonth, setSelectedMonth] = useState(monthNames[currentMonthIndex]);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const [watchmanSalary, setWatchmanSalary] = useState("");
  const [garbageCollection, setGarbageCollection] = useState("");
  const [liftMaintenance, setLiftMaintenance] = useState("");
  const [electricityCommon, setElectricityCommon] = useState("");
  const [motorPump, setMotorPump] = useState("");
  const [miscellaneous, setMiscellaneous] = useState("");

  const [waterMode, setWaterMode] = useState<WaterMode>("MASTER");
  const [rememberWaterSetup, setRememberWaterSetup] = useState(false);
  const [fixedWaterBill, setFixedWaterBill] = useState("8000");
  const [masterWaterBill, setMasterWaterBill] = useState("8000");
  const [individualRatePerUnit, setIndividualRatePerUnit] = useState("29");
  const [mixedRatePerUnit, setMixedRatePerUnit] = useState("29");
  const [mixedFixedPool, setMixedFixedPool] = useState("8000");

  const [individualRows, setIndividualRows] = useState<MeterRow[]>([
    { flatNumber: "101", reading: "29", units: "29" },
    { flatNumber: "102", reading: "35", units: "29" },
    { flatNumber: "201", reading: "89", units: "29" },
    { flatNumber: "202", reading: "23", units: "29" },
    { flatNumber: "301", reading: "101", units: "29" },
    { flatNumber: "302", reading: "80", units: "29" },
    { flatNumber: "401", reading: "27", units: "29" },
  ]);

  const [selectedMixedFlats, setSelectedMixedFlats] = useState<string[]>(["A-101", "B-201", "B-202", "B-203", "C-302", "C-303"]);
  const [mixedRowsMap, setMixedRowsMap] = useState<Record<string, { reading: string; units: string }>>({
    "A-101": { reading: "29", units: "29" },
    "B-201": { reading: "89", units: "29" },
    "B-202": { reading: "80", units: "29" },
    "B-203": { reading: "27", units: "29" },
    "C-302": { reading: "41", units: "29" },
    "C-303": { reading: "58", units: "29" },
  });

  const [dueDateOpen, setDueDateOpen] = useState(false);
  const dueDateOptions = ["10 May 2025", "15 May 2025", "20 May 2025", "25 May 2025"];
  const [paymentDueDate, setPaymentDueDate] = useState(dueDateOptions[0]);

  const parseAmount = (value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    return clean ? Number(clean) : 0;
  };
  const inputFormatter = (value: string) => value.replace(/[^0-9]/g, "");
  const formatInr = (value: number) => `₹${Math.max(0, value).toLocaleString("en-IN")}`;

  const flatsCount = ALL_FLATS.length;

  const enteredExpensesTotal = useMemo(
    () =>
      parseAmount(watchmanSalary) +
      parseAmount(garbageCollection) +
      parseAmount(liftMaintenance) +
      parseAmount(electricityCommon) +
      parseAmount(motorPump) +
      parseAmount(miscellaneous),
    [watchmanSalary, garbageCollection, liftMaintenance, electricityCommon, motorPump, miscellaneous],
  );

  const expenseBreakdown = useMemo(
    () => [
      { label: "Watchman Salary", icon: "account-tie-outline", value: parseAmount(watchmanSalary) },
      { label: "Garbage Collection", icon: "delete-outline", value: parseAmount(garbageCollection) },
      { label: "Lift Maintenance", icon: "elevator", value: parseAmount(liftMaintenance) },
      { label: "Common Area Electricity", icon: "flash-outline", value: parseAmount(electricityCommon) },
      { label: "Motor Maintenance", icon: "cog-outline", value: parseAmount(motorPump) },
      { label: "Miscellaneous", icon: "text-box-outline", value: parseAmount(miscellaneous) },
    ],
    [watchmanSalary, garbageCollection, liftMaintenance, electricityCommon, motorPump, miscellaneous],
  );

  const monthSummary = useMemo(() => {
    const selectedYearNum = Number(selectedYear);
    const selectedMonthIdx = monthNames.findIndex((m) => m === selectedMonth);
    const fallback = { totalExpenses: 18000, perFlat: 1800, collection: "10 / 10 flats paid", waterMode: "Fixed Split" };
    if (selectedMonthIdx === -1) return fallback;
    const seed = selectedYearNum * 31 + selectedMonthIdx * 17;
    const totalExpenses = 15000 + (seed % 8) * 900;
    const perFlat = Math.round(totalExpenses / flatsCount);
    const paidFlats = 7 + (seed % 4);
    return {
      totalExpenses,
      perFlat,
      collection: `${paidFlats} / ${flatsCount} flats paid`,
      waterMode: "Fixed Split",
    };
  }, [selectedYear, selectedMonth, flatsCount]);

  const mixedRows = useMemo(
    () =>
      selectedMixedFlats.map((flat) => ({
        flatNumber: flat,
        reading: mixedRowsMap[flat]?.reading ?? "",
        units: mixedRowsMap[flat]?.units ?? "",
      })),
    [selectedMixedFlats, mixedRowsMap],
  );

  const waterByFlat = useMemo(() => {
    const map = new Map<string, number>();
    const fixedPerFlat = flatsCount > 0 ? Math.round(parseAmount(fixedWaterBill) / flatsCount) : 0;
    const masterPerFlat = flatsCount > 0 ? Math.round(parseAmount(masterWaterBill) / flatsCount) : 0;

    if (waterMode === "FIXED") {
      ALL_FLATS.forEach((flat) => map.set(flat, fixedPerFlat));
      return map;
    }
    if (waterMode === "MASTER") {
      ALL_FLATS.forEach((flat) => map.set(flat, masterPerFlat));
      return map;
    }
    if (waterMode === "INDIVIDUAL") {
      const rate = parseAmount(individualRatePerUnit);
      individualRows.forEach((row) => map.set(row.flatNumber, parseAmount(row.units) * rate));
      return map;
    }

    const mixedRate = parseAmount(mixedRatePerUnit);
    const nonMetered = Math.max(1, flatsCount - selectedMixedFlats.length);
    const nonMeteredShare = Math.round(parseAmount(mixedFixedPool) / nonMetered);
    ALL_FLATS.forEach((flat) => {
      if (selectedMixedFlats.includes(flat)) {
        map.set(flat, parseAmount(mixedRowsMap[flat]?.units ?? "") * mixedRate);
      } else {
        map.set(flat, nonMeteredShare);
      }
    });
    return map;
  }, [
    waterMode,
    flatsCount,
    fixedWaterBill,
    masterWaterBill,
    individualRatePerUnit,
    individualRows,
    selectedMixedFlats,
    mixedRatePerUnit,
    mixedFixedPool,
    mixedRowsMap,
  ]);

  const perFlatBase = flatsCount > 0 ? Math.round(enteredExpensesTotal / flatsCount) : 0;
  const perFlatRows = ALL_FLATS.map((flat) => {
    const water = waterByFlat.get(flat) ?? 0;
    return {
      flat,
      base: perFlatBase,
      water,
      total: perFlatBase + water,
    };
  });
  const collectionTarget = perFlatRows.reduce((sum, row) => sum + row.total, 0);

  const stepLabel = step === 1 ? "Period" : "Expenses";

  const toggleMixedFlat = (flat: string) => {
    setSelectedMixedFlats((prev) => {
      if (prev.includes(flat)) return prev.filter((f) => f !== flat);
      return [...prev, flat];
    });
    setMixedRowsMap((prev) => {
      if (prev[flat]) return prev;
      return { ...prev, [flat]: { reading: "", units: "" } };
    });
  };

  const onBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    if (step === 2) {
      setStep(1);
      return;
    }
    if (step === 3) {
      if (waterSubStep === "MODE") {
        setStep(2);
      } else if (waterSubStep === "INDIVIDUAL") {
        setWaterSubStep("MODE");
      } else {
        setWaterSubStep("INDIVIDUAL");
      }
      return;
    }
    setStep(3);
    setWaterSubStep("MIXED");
  };

  const onNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      setWaterSubStep("MODE");
      return;
    }
    if (step === 3) {
      if (waterSubStep === "MODE") {
        setWaterSubStep("INDIVIDUAL");
        setWaterMode("INDIVIDUAL");
        return;
      }
      if (waterSubStep === "INDIVIDUAL") {
        setWaterSubStep("MIXED");
        setWaterMode("MIXED");
        return;
      }
      setStep(4);
      return;
    }
  };

  const nextText = step === 4 ? "Generate and Send Bills" : "Next";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable onPress={onBack}>
              <Feather name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Monthly Maintenance</Text>
          </View>
          <Text style={styles.stepText}>{`Step ${step} of 4 \u2192 ${stepLabel}`}</Text>
          <View style={styles.progressRow}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={[styles.progressBar, item <= step ? styles.progressBarActive : styles.progressBarMuted]} />
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {step === 1 ? (
            <>
              <View style={styles.noteCard}>
                <View style={styles.noteIcon}>
                  <MaterialCommunityIcons name="calendar-month-outline" size={22} color="#EAB308" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noteTitle}>Billing Period</Text>
                  <Text style={styles.noteSub}>Which month are you raising maintenance bills for?</Text>
                </View>
              </View>

              <View style={styles.periodRow}>
                <View style={styles.periodColSmall}>
                  <Text style={styles.inputLabel}>Year</Text>
                  <Pressable
                    style={styles.selectInput}
                    onPress={() => {
                      setShowYearDropdown((v) => !v);
                      setShowMonthDropdown(false);
                    }}
                  >
                    <Text style={styles.selectText}>{selectedYear}</Text>
                    <Feather name="chevron-down" size={18} color="#64748B" />
                  </Pressable>
                  {showYearDropdown ? (
                    <View style={styles.dropdownList}>
                      {years.map((year) => (
                        <Pressable
                          key={year}
                          style={styles.dropdownItemWrap}
                          onPress={() => {
                            setSelectedYear(year);
                            setShowYearDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItem}>{year}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>

                <View style={styles.periodColLarge}>
                  <Text style={styles.inputLabel}>Month</Text>
                  <Pressable
                    style={styles.selectInput}
                    onPress={() => {
                      setShowMonthDropdown((v) => !v);
                      setShowYearDropdown(false);
                    }}
                  >
                    <Text style={styles.selectText}>{selectedMonth}</Text>
                    <Feather name="chevron-down" size={18} color="#64748B" />
                  </Pressable>
                  {showMonthDropdown ? (
                    <View style={styles.dropdownList}>
                      {monthNames.map((month) => (
                        <Pressable
                          key={month}
                          style={styles.dropdownItemWrap}
                          onPress={() => {
                            setSelectedMonth(month);
                            setShowMonthDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItem}>{month}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>{`Last Generated \u00b7 ${selectedMonth} ${selectedYear} Details`}</Text>
                <SummaryRow label="Total Expenses" value={formatInr(monthSummary.totalExpenses)} />
                <SummaryRow label="Per Flat" value={formatInr(monthSummary.perFlat)} />
                <SummaryRow label="Collection" value={monthSummary.collection} />
                <SummaryRow label="Water Mode" value={monthSummary.waterMode} isLast />
              </View>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <View style={styles.noteCard}>
                <View style={styles.noteIcon}>
                  <MaterialCommunityIcons name="cash-multiple" size={22} color="#EAB308" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noteTitle}>Shared Expenses</Text>
                  <Text style={styles.noteSub}>Enter all common building expenses. Water handled separately next.</Text>
                </View>
              </View>

              <ExpenseInput label="Watchman Salary" subLabel="Monthly guard salary" value={watchmanSalary} onChangeText={(val) => setWatchmanSalary(inputFormatter(val))} />
              <ExpenseInput label="Garbage Collection" subLabel="GHMC or private vendor" value={garbageCollection} onChangeText={(val) => setGarbageCollection(inputFormatter(val))} />
              <ExpenseInput label="Lift Maintenance" subLabel="AMC or repair charges" value={liftMaintenance} onChangeText={(val) => setLiftMaintenance(inputFormatter(val))} />
              <ExpenseInput label="Electricity Common" subLabel="Corridors, pump, lights" value={electricityCommon} onChangeText={(val) => setElectricityCommon(inputFormatter(val))} />
              <ExpenseInput label="Motor / Pump Maintenance" subLabel="Sump pump & overhead tank" value={motorPump} onChangeText={(val) => setMotorPump(inputFormatter(val))} />
              <ExpenseInput label="Miscellaneous" subLabel="Any other shared expense" value={miscellaneous} onChangeText={(val) => setMiscellaneous(inputFormatter(val))} />

              <View style={styles.totalCard}>
                <View>
                  <Text style={styles.totalMetaLabel}>Total entered so far</Text>
                  <Text style={styles.totalMainValue}>{formatInr(enteredExpensesTotal)}</Text>
                </View>
                <View>
                  <Text style={styles.totalMetaLabel}>Base per flat</Text>
                  <Text style={styles.totalSideValue}>{formatInr(perFlatBase)}</Text>
                </View>
              </View>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <View style={styles.noteCard}>
                <View style={styles.noteIcon}>
                  <MaterialCommunityIcons name="water-outline" size={22} color="#EAB308" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noteTitle}>Water Billing</Text>
                  <Text style={styles.noteSub}>Choose how water is charged. Save your preference for next month.</Text>
                </View>
              </View>

              <WaterModeCard title="Fixed Split" subTitle="One bill, divided equally" selected={waterMode === "FIXED"} onPress={() => setWaterMode("FIXED")}>
                {waterMode === "FIXED" && waterSubStep === "MODE" ? (
                  <>
                    <Text style={styles.inlineInfo}>Enter one utility bill. Each flat pays equal share.</Text>
                    <Text style={styles.fixedInputLabel}>Utility Bill Amount (₹)</Text>
                    <TextInput
                      style={styles.fixedInput}
                      value={fixedWaterBill}
                      onChangeText={(v) => setFixedWaterBill(inputFormatter(v))}
                      placeholder="eg ₹8000"
                      keyboardType="number-pad"
                      placeholderTextColor="#777"
                    />
                    <Text style={styles.fixedPerFlatText}>{`Per flat: ${formatInr(flatsCount ? Math.round(parseAmount(fixedWaterBill) / flatsCount) : 0)} — divided equally`}</Text>
                  </>
                ) : null}
              </WaterModeCard>

              <WaterModeCard title="Master Meter" subTitle="One meter for entire building" selected={waterMode === "MASTER"} onPress={() => setWaterMode("MASTER")}>
                {waterMode === "MASTER" && waterSubStep === "MODE" ? (
                  <>
                    <Text style={styles.inlineInfo}>Enter the single utility bill. Each flat pays an equal share.</Text>
                    <Text style={styles.fixedInputLabel}>Utility Bill Amount (₹)</Text>
                    <TextInput
                      style={styles.fixedInput}
                      value={masterWaterBill}
                      onChangeText={(v) => setMasterWaterBill(inputFormatter(v))}
                      placeholder="eg ₹8000"
                      keyboardType="number-pad"
                      placeholderTextColor="#777"
                    />
                    <Text style={styles.fixedPerFlatText}>{`Per flat: ${formatInr(flatsCount ? Math.round(parseAmount(masterWaterBill) / flatsCount) : 0)} — divided equally`}</Text>
                  </>
                ) : null}
              </WaterModeCard>

              <WaterModeCard title="Individual Meters" subTitle="Each flat has its own meter" selected={waterMode === "INDIVIDUAL"} onPress={() => setWaterMode("INDIVIDUAL")}>
                {waterSubStep === "INDIVIDUAL" ? (
                  <>
                    <Text style={styles.inlineInfo}>Enter current reading per flat. Charged per unit consumed.</Text>
                    <Text style={styles.fixedInputLabel}>Rate per Unit (₹)</Text>
                    <TextInput
                      style={styles.fixedInput}
                      value={individualRatePerUnit}
                      onChangeText={(v) => setIndividualRatePerUnit(inputFormatter(v))}
                      placeholder="eg ₹29"
                      keyboardType="number-pad"
                      placeholderTextColor="#777"
                    />
                    <MeterReadingsTable
                      rows={individualRows}
                      onChangeFlat={(index, value) => {
                        setIndividualRows((prev) => prev.map((row, i) => (i === index ? { ...row, flatNumber: value } : row)));
                      }}
                      onChangeReading={(index, value) => {
                        setIndividualRows((prev) => prev.map((row, i) => (i === index ? { ...row, reading: inputFormatter(value) } : row)));
                      }}
                      onChangeUnits={(index, value) => {
                        setIndividualRows((prev) => prev.map((row, i) => (i === index ? { ...row, units: inputFormatter(value) } : row)));
                      }}
                    />
                  </>
                ) : null}
              </WaterModeCard>

              <WaterModeCard title="Mixed Setup" subTitle="Some metered, some not" selected={waterMode === "MIXED"} onPress={() => setWaterMode("MIXED")}>
                {waterSubStep === "MIXED" ? (
                  <>
                    <Text style={styles.fixedInputLabel}>Tap flats that have individual meters:</Text>
                    <View style={styles.flatChipsWrap}>
                      {ALL_FLATS.map((flat) => {
                        const selected = selectedMixedFlats.includes(flat);
                        return (
                          <Pressable key={flat} style={[styles.flatChip, selected ? styles.flatChipActive : styles.flatChipInactive]} onPress={() => toggleMixedFlat(flat)}>
                            <Text style={[styles.flatChipText, selected ? styles.flatChipTextActive : styles.flatChipTextInactive]}>{flat}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={styles.inlineInfo}>Mark metered flats for unit billing. Non-metered flats share a fixed pool.</Text>
                    <Text style={styles.fixedInputLabel}>Rate per Unit (₹) - metered flats</Text>
                    <TextInput
                      style={styles.fixedInput}
                      value={mixedRatePerUnit}
                      onChangeText={(v) => setMixedRatePerUnit(inputFormatter(v))}
                      placeholder="eg ₹29"
                      keyboardType="number-pad"
                      placeholderTextColor="#777"
                    />
                    <MeterReadingsTable
                      rows={mixedRows}
                      onChangeFlat={() => {}}
                      onChangeReading={(index, value) => {
                        const flat = mixedRows[index]?.flatNumber;
                        if (!flat) return;
                        setMixedRowsMap((prev) => ({
                          ...prev,
                          [flat]: { reading: inputFormatter(value), units: prev[flat]?.units ?? "" },
                        }));
                      }}
                      onChangeUnits={(index, value) => {
                        const flat = mixedRows[index]?.flatNumber;
                        if (!flat) return;
                        setMixedRowsMap((prev) => ({
                          ...prev,
                          [flat]: { reading: prev[flat]?.reading ?? "", units: inputFormatter(value) },
                        }));
                      }}
                    />
                    <Text style={styles.fixedInputLabel}>Fixed Water Pool for Non-Metered Flats (₹)</Text>
                    <TextInput
                      style={styles.fixedInput}
                      value={mixedFixedPool}
                      onChangeText={(v) => setMixedFixedPool(inputFormatter(v))}
                      placeholder="eg ₹8000"
                      keyboardType="number-pad"
                      placeholderTextColor="#777"
                    />
                    <Text style={styles.fixedPerFlatText}>
                      {`Non-metered per flat: ${formatInr(Math.round(parseAmount(mixedFixedPool) / Math.max(1, flatsCount - selectedMixedFlats.length)))}`}
                    </Text>
                  </>
                ) : null}
              </WaterModeCard>

              <View style={styles.toggleCard}>
                <View style={styles.toggleIcon}>
                  <MaterialCommunityIcons name="account-group-outline" size={20} color="#1C98ED" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>Remember this water billing setup</Text>
                  <Text style={styles.toggleSub}>Auto-load next month. Change anytime</Text>
                </View>
                <Switch value={rememberWaterSetup} onValueChange={setRememberWaterSetup} trackColor={{ false: "#E2E8F0", true: "#1C98ED" }} thumbColor="#FFFFFF" />
              </View>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <View style={styles.reviewCard}>
                <View style={styles.reviewIcon}>
                  <MaterialCommunityIcons name="check-circle-outline" size={22} color="#16A34A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewTitle}>Review & Generate</Text>
                  <Text style={styles.reviewSub}>{`Bills for ${selectedMonth} ${selectedYear} - ${flatsCount} flats - Ready to send`}</Text>
                </View>
              </View>

              <View style={styles.heroCard}>
                <Text style={styles.heroMeta}>{`${selectedMonth} ${selectedYear} - Total Collection Target`}</Text>
                <Text style={styles.heroAmount}>{formatInr(collectionTarget)}</Text>
                <Pressable style={styles.heroPill}>
                  <Text style={styles.heroPillText}>Pay Now</Text>
                </Pressable>
              </View>

              <Text style={styles.sectionTitle}>Expense Breakdown</Text>
              <View style={styles.breakdownCard}>
                {expenseBreakdown.map((item, index) => (
                  <View key={item.label} style={[styles.breakdownRow, index > 0 && styles.breakdownRowBorder]}>
                    <View style={styles.breakdownLeft}>
                      <MaterialCommunityIcons name={item.icon as never} size={16} color="#64748B" />
                      <Text style={styles.breakdownLabel}>{item.label}</Text>
                    </View>
                    <Text style={styles.breakdownValue}>{formatInr(item.value)}</Text>
                  </View>
                ))}
                <View style={styles.breakdownTotalRow}>
                  <Text style={styles.breakdownTotalLabel}>Total Shared Expenses</Text>
                  <Text style={styles.breakdownTotalValue}>{formatInr(enteredExpensesTotal)}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Per-Flat Breakdown</Text>
              <View style={styles.perFlatCard}>
                <View style={styles.perFlatHeaderRow}>
                  <Text style={[styles.perFlatHeaderText, styles.perFlatFlatCell]}>Flat</Text>
                  <Text style={[styles.perFlatHeaderText, styles.perFlatNumCell]}>Base</Text>
                  <Text style={[styles.perFlatHeaderText, styles.perFlatNumCell]}>Water</Text>
                  <Text style={[styles.perFlatHeaderText, styles.perFlatNumCell]}>Total</Text>
                </View>
                {perFlatRows.slice(0, 5).map((row) => (
                  <View key={row.flat} style={styles.perFlatBodyRow}>
                    <Text style={[styles.perFlatBodyText, styles.perFlatFlatCell]}>{row.flat}</Text>
                    <Text style={[styles.perFlatBodyText, styles.perFlatNumCell]}>{formatInr(row.base)}</Text>
                    <Text style={[styles.perFlatBodyText, styles.perFlatNumCell]}>{formatInr(row.water)}</Text>
                    <Text style={[styles.perFlatTotalText, styles.perFlatNumCell]}>{formatInr(row.total)}</Text>
                  </View>
                ))}
                <View style={styles.perFlatFoot}>
                  <Text style={styles.perFlatFootText}>{`+ ${Math.max(0, perFlatRows.length - 5)} more flats · Grand total `}</Text>
                  <Text style={styles.perFlatFootAmount}>{formatInr(collectionTarget)}</Text>
                </View>
              </View>

              <Text style={styles.inputLabel}>Payment Due Date</Text>
              <Pressable
                style={styles.dueDateInput}
                onPress={() => setDueDateOpen((v) => !v)}
              >
                <MaterialCommunityIcons name="calendar-blank-outline" size={18} color="#64748B" />
                <Text style={styles.dueDateText}>{paymentDueDate}</Text>
                <Feather name="chevron-down" size={18} color="#64748B" />
              </Pressable>
              {dueDateOpen ? (
                <View style={styles.dropdownList}>
                  {dueDateOptions.map((date) => (
                    <Pressable
                      key={date}
                      style={styles.dropdownItemWrap}
                      onPress={() => {
                        setPaymentDueDate(date);
                        setDueDateOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItem}>{date}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <View style={styles.warningCard}>
                <MaterialCommunityIcons name="alert-outline" size={18} color="#DC2626" />
                <Text style={styles.warningText}>
                  Once generated, bills are sent to all flats via notification and Community updates. Double-check amounts before proceeding.
                </Text>
              </View>
            </>
          ) : null}
        </ScrollView>

        <View style={styles.footerRow}>
          <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.nextBtn} onPress={onNext}>
            <Text style={styles.nextBtnText}>{nextText}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

function ExpenseInput({
  label,
  subLabel,
  value,
  onChangeText,
}: {
  label: string;
  subLabel: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.expenseGroup}>
      <Text style={styles.expenseLabel}>{label}</Text>
      <Text style={styles.expenseSubLabel}>{subLabel}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        placeholder="₹ xxxxx"
        placeholderTextColor="#94A3B8"
        style={styles.expenseInput}
      />
    </View>
  );
}

function SummaryRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.summaryRow, isLast && { borderBottomWidth: 0 }]}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      <Text style={styles.summaryRowValue}>{value}</Text>
    </View>
  );
}

function MeterReadingsTable({
  rows,
  onChangeFlat,
  onChangeReading,
  onChangeUnits,
}: {
  rows: MeterRow[];
  onChangeFlat: (index: number, value: string) => void;
  onChangeReading: (index: number, value: string) => void;
  onChangeUnits: (index: number, value: string) => void;
}) {
  return (
    <View style={styles.tableWrap}>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderText, styles.tableFlat]}>Flat Number</Text>
        <Text style={[styles.tableHeaderText, styles.tableNum]}>Current Readings</Text>
        <Text style={[styles.tableHeaderText, styles.tableNum]}>Units</Text>
      </View>
      {rows.map((row, index) => (
        <View key={`${row.flatNumber}-${index}`} style={styles.tableBodyRow}>
          <TextInput
            style={[styles.tableInput, styles.tableFlat]}
            value={row.flatNumber}
            onChangeText={(value) => onChangeFlat(index, value)}
            placeholder="Flat"
            placeholderTextColor="#94A3B8"
          />
          <TextInput
            style={[styles.tableInput, styles.tableNum]}
            value={row.reading}
            onChangeText={(value) => onChangeReading(index, value)}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor="#94A3B8"
          />
          <TextInput
            style={[styles.tableInput, styles.tableNum]}
            value={row.units}
            onChangeText={(value) => onChangeUnits(index, value)}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor="#94A3B8"
          />
        </View>
      ))}
    </View>
  );
}

function WaterModeCard({
  title,
  subTitle,
  selected,
  onPress,
  children,
}: {
  title: string;
  subTitle: string;
  selected: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Pressable style={[styles.modeCard, selected && styles.modeCardSelected]} onPress={onPress}>
      <View style={styles.modeTopRow}>
        <View style={styles.modeIcon}>
          <MaterialCommunityIcons name="home-city-outline" size={20} color="#2899CF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.modeTitle}>{title}</Text>
          <Text style={styles.modeSubTitle}>{subTitle}</Text>
        </View>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>{selected ? <View style={styles.radioInner} /> : null}</View>
      </View>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: "500", color: "#000000" },
  stepText: { marginTop: 12, color: "#777", fontSize: 12 },
  progressRow: { marginTop: 12, flexDirection: "row", gap: 5 },
  progressBar: { flex: 1, height: 6, borderRadius: 8 },
  progressBarActive: { backgroundColor: "#1C98ED" },
  progressBarMuted: { backgroundColor: "#F4F4F5" },
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120, gap: 16 },
  noteCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(234,179,8,0.12)",
    borderWidth: 1,
    borderColor: "rgba(234,179,8,0.12)",
    borderRadius: 24,
    padding: 16,
  },
  noteIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(234,179,8,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  noteTitle: { color: "#09090B", fontSize: 14, fontWeight: "500" },
  noteSub: { marginTop: 2, color: "#777", fontSize: 14, fontWeight: "500", lineHeight: 20 },
  periodRow: { flexDirection: "row", gap: 12, zIndex: 10 },
  periodColSmall: { width: "37%" },
  periodColLarge: { flex: 1 },
  inputLabel: { color: "#0F172A", fontSize: 14, fontWeight: "500", marginBottom: 6 },
  selectInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { color: "#0F172A", fontSize: 16, fontWeight: "400" },
  dropdownList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#FFF",
    overflow: "hidden",
    maxHeight: 180,
  },
  dropdownItemWrap: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownItem: { fontSize: 16, color: "#334155" },
  summaryCard: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryTitle: { color: "#1A1A1A", fontSize: 18, fontWeight: "500", marginBottom: 8 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229,231,235,0.5)",
  },
  summaryRowLabel: { color: "#777", fontSize: 14, fontWeight: "500" },
  summaryRowValue: { color: "#1A1A1A", fontSize: 14, fontWeight: "500" },
  expenseGroup: { width: "100%" },
  expenseLabel: { color: "#334155", fontSize: 14, fontWeight: "500" },
  expenseSubLabel: { color: "#777", fontSize: 10, marginTop: 2, marginBottom: 8 },
  expenseInput: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  totalCard: {
    marginTop: 2,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalMetaLabel: { color: "#777", fontSize: 10 },
  totalMainValue: { marginTop: 4, color: "#1C98ED", fontSize: 18, fontWeight: "500" },
  totalSideValue: { marginTop: 4, color: "#09090B", fontSize: 14, fontWeight: "600" },
  modeCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 10,
  },
  modeCardSelected: { backgroundColor: "rgba(39,153,206,0.05)", borderColor: "#2799CE" },
  modeTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(39,153,206,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  modeTitle: { color: "#0F172A", fontSize: 16, fontWeight: "400" },
  modeSubTitle: { color: "#64748B", fontSize: 14, fontWeight: "500" },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: { borderColor: "#2799CE" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2799CE" },
  inlineInfo: { color: "#777", fontSize: 12, lineHeight: 17 },
  fixedInputLabel: { marginTop: 2, color: "#000", fontSize: 12 },
  fixedInput: {
    marginTop: 6,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    fontSize: 12,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  fixedPerFlatText: { marginTop: 6, color: "#777", fontSize: 12 },
  tableWrap: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B9B9B9",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.06)", height: 50, alignItems: "center" },
  tableHeaderText: { fontSize: 12, color: "#777", textAlign: "center" },
  tableBodyRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E4E4E7", minHeight: 42 },
  tableInput: {
    borderRightWidth: 1,
    borderRightColor: "#E4E4E7",
    paddingHorizontal: 8,
    fontSize: 13,
    color: "#09090B",
    textAlign: "center",
  },
  tableFlat: { flex: 1, paddingVertical: 10 },
  tableNum: { flex: 1, paddingVertical: 10 },
  flatChipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2 },
  flatChip: {
    height: 40,
    minWidth: 86,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  flatChipActive: { borderWidth: 1, borderColor: "#2799CE", backgroundColor: "rgba(39,153,206,0.05)" },
  flatChipInactive: { borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" },
  flatChipText: { fontSize: 14, fontWeight: "500" },
  flatChipTextActive: { color: "#2799CE" },
  flatChipTextInactive: { color: "#0F172A" },
  toggleCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(39,153,206,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTitle: { color: "#0F172A", fontSize: 14, fontWeight: "500" },
  toggleSub: { marginTop: 2, color: "#64748B", fontSize: 12 },
  reviewCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  reviewSub: { marginTop: 2, fontSize: 12, color: "#64748B" },
  heroCard: {
    borderRadius: 20,
    backgroundColor: "#1C98ED",
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: "#2899CF",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroMeta: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "500" },
  heroAmount: { marginTop: 4, color: "#FFFFFF", fontSize: 34, fontWeight: "600" },
  heroPill: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  heroPillText: { color: "#1C98ED", fontSize: 14, fontWeight: "500" },
  sectionTitle: { color: "#0F172A", fontSize: 14, fontWeight: "500", marginTop: 4 },
  breakdownCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  breakdownRow: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  breakdownRowBorder: { borderTopWidth: 1, borderTopColor: "#F8FAFC" },
  breakdownLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  breakdownLabel: { color: "#0F172A", fontSize: 14, fontWeight: "500" },
  breakdownValue: { color: "#0F172A", fontSize: 14, fontWeight: "500" },
  breakdownTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(39,153,206,0.1)",
    backgroundColor: "rgba(39,153,206,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownTotalLabel: { color: "#2799CE", fontSize: 14, fontWeight: "500" },
  breakdownTotalValue: { color: "#2799CE", fontSize: 18, fontWeight: "500" },
  perFlatCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  perFlatHeaderRow: { flexDirection: "row", backgroundColor: "#F8FAFC", paddingVertical: 10, paddingHorizontal: 8 },
  perFlatHeaderText: { color: "#64748B", fontSize: 12, fontWeight: "500" },
  perFlatBodyRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#F8FAFC", paddingVertical: 10, paddingHorizontal: 8 },
  perFlatBodyText: { color: "#0F172A", fontSize: 13, fontWeight: "500" },
  perFlatTotalText: { color: "#2799CE", fontSize: 13, fontWeight: "600" },
  perFlatFlatCell: { flex: 1.2 },
  perFlatNumCell: { flex: 1, textAlign: "right" },
  perFlatFoot: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  perFlatFootText: { color: "#64748B", fontSize: 12 },
  perFlatFootAmount: { color: "#1C98ED", fontSize: 14, fontWeight: "600" },
  dueDateInput: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dueDateText: { flex: 1, color: "#0F172A", fontSize: 14, fontWeight: "500" },
  warningCard: {
    marginTop: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  warningText: { flex: 1, color: "#92400E", fontSize: 13, lineHeight: 21, fontWeight: "500" },
  footerRow: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#F4F4F5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { color: "#777", fontSize: 14, fontWeight: "500" },
  nextBtn: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: { color: "#FAFAFA", fontSize: 14, fontWeight: "500" },
});
