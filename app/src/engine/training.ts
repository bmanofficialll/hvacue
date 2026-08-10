// Training literature. Each lesson is real, field-oriented HVAC content —
// enough to actually teach the concept, not lorem ipsum. Kept vendor-neutral;
// where manufacturer procedures differ, the text says so.

export interface LessonSection {
  heading: string;
  body: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: number;
  progress: number;
  tone: 'green' | 'amber' | 'red';
  minutes: number;
  summary: string;
  sections: LessonSection[];
  takeaways: string[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'refrigeration',
    title: 'Refrigeration fundamentals',
    level: 1,
    progress: 92,
    tone: 'green',
    minutes: 8,
    summary: 'The vapor-compression cycle, and why pressure and temperature are the same story.',
    sections: [
      { heading: 'The four components', body: 'Every DX system is the same loop: compressor, condenser, metering device, evaporator. The compressor raises pressure and temperature of the vapor; the condenser rejects heat and the refrigerant becomes liquid; the metering device drops the pressure; the evaporator absorbs heat and the refrigerant boils back to vapor. Follow the refrigerant around that loop and every symptom has a place to live.' },
      { heading: 'Pressure follows temperature', body: 'For a saturated refrigerant — liquid and vapor together — pressure and temperature are locked to each other. That is why a PT chart exists: read the pressure, look up the saturation temperature. High head pressure is not a pressure problem, it is a temperature problem: the refrigerant is condensing too hot, and something is stopping it from rejecting heat.' },
      { heading: 'Superheat and subcooling', body: 'Superheat is how many degrees the vapor leaving the evaporator is above its saturation temperature — proof the last of the liquid has boiled off and no liquid is heading to the compressor. Subcooling is how many degrees the liquid leaving the condenser is below its saturation temperature — proof the condenser is making solid liquid. Superheat reads the evaporator; subcooling reads the condenser. You need both before you touch the charge.' },
      { heading: 'Zeotropic blends and glide', body: 'Single-component refrigerants (R-22, R-134a) boil and condense at one temperature for a given pressure. Blends like R-407C or R-448A "glide" — they change temperature as they evaporate, sometimes 5–10 °F. That is why HVACue refuses to give you a single saturation number for those: you must use the manufacturer PT chart with the correct bubble or dew point.' },
    ],
    takeaways: [
      'Compressor → condenser → metering → evaporator, every time.',
      'For a saturated refrigerant, pressure and temperature are the same fact.',
      'Superheat reads the evaporator; subcooling reads the condenser.',
      'Blends have glide — do not trust a single PT value.',
    ],
  },
  {
    id: 'chiller',
    title: 'Chiller diagnostics',
    level: 3,
    progress: 78,
    tone: 'green',
    minutes: 9,
    summary: 'Approach, condenser ΔT, and why a chiller alarm often starts outside the chiller.',
    sections: [
      { heading: 'Condenser ΔT tells you about water', body: 'Entering and leaving condenser water give you ΔT. At design flow a water-cooled chiller usually shows roughly 8–12 °F. A high ΔT with high head says not enough water is moving — strainer, valve, or pump. A normal ΔT with high head says the water is moving but the heat is not crossing the tube wall.' },
      { heading: 'Approach is the condenser report card', body: 'Approach is the refrigerant condensing temperature minus the leaving water temperature. Convert discharge pressure to a saturation temperature, subtract leaving water. A clean condenser at design is a few degrees. A climbing approach with good flow is fouling — scale, biofilm, or mud on the tubes. This single number tells you whether to clean, not guess.' },
      { heading: 'Non-condensables', body: 'Air or nitrogen that got into the refrigerant never condenses. It sits on top of the refrigerant pressure and adds its own, so head pressure reads high even with clean tubes and good flow. A standing pressure test — equalize to the condenser water temperature and compare to saturation — separates air from fouling.' },
      { heading: 'Look upstream', body: 'A chiller that alarms on high head is often the victim, not the culprit. High entering water means the cooling tower is not doing its job: fan, sump level, fill condition, wet-bulb. Diagnose the plant, not just the box — and read the service history, because a fault that recurs every few months is a water-treatment story, not a chiller story.' },
    ],
    takeaways: [
      'Condenser ΔT separates a flow problem from a heat-transfer problem.',
      'Approach = condensing temp − leaving water. Rising approach = fouling.',
      'Standing pressure test finds non-condensables.',
      'Check the tower and the history before condemning the chiller.',
    ],
  },
  {
    id: 'electrical',
    title: 'Electrical troubleshooting',
    level: 4,
    progress: 64,
    tone: 'amber',
    minutes: 7,
    summary: 'Reading current, voltage drop, and the difference between a control and a load fault.',
    sections: [
      { heading: 'Amps confirm what pressure suggests', body: 'A clamp on the compressor legs corroborates the refrigerant side. High head should come with elevated current as the compressor works against the lift. If pressure reads high but current is normal, suspect the transducer before the condenser — the machine may not actually be under high head at all.' },
      { heading: 'Voltage drop under load', body: 'Measure voltage at the contactor with the compressor running, not just at rest. A connection that reads fine open can drop badly under load. More than about 3% drop across a closed contactor or a lug means heat, and heat means an eventual failure. Compare all three legs — imbalance over 2% shortens motor life fast.' },
      { heading: 'Control circuit vs load circuit', body: 'Split the problem: is the 24 V control circuit calling, and is the load circuit answering? If you have a call at the contactor coil but the contacts are not pulling in, that is a coil or control fault. If the coil is energized and contacts are closed but the compressor is not running, that is a load-side fault — windings, capacitor, or the compressor itself.' },
      { heading: 'Capacitors and hard starts', body: 'A weak run capacitor drops motor torque and raises current. Measure microfarads against the rating, not just "it reads something." A compressor that draws locked-rotor amps and trips is telling you it cannot start under load — capacitor, start components, or mechanical seizure, in that order.' },
    ],
    takeaways: [
      'Current corroborates the pressure story — mismatches point at the sensor.',
      'Measure voltage drop under load, and check leg imbalance.',
      'Separate the 24 V control circuit from the load circuit.',
      'Test capacitors in microfarads against the nameplate.',
    ],
  },
  {
    id: 'controls',
    title: 'Controls & BAS',
    level: 5,
    progress: 55,
    tone: 'amber',
    minutes: 6,
    summary: 'Sensors, setpoints, and reading a sequence of operations before you touch anything.',
    sections: [
      { heading: 'Trust, then verify, the sensor', body: 'A building automation system is only as honest as its sensors. Before you chase a comfort complaint, confirm the sensor against a calibrated instrument. A space temperature that reads three degrees off will drive the whole sequence wrong, and no amount of mechanical work fixes a lying input.' },
      { heading: 'Read the sequence of operations', body: 'Every controlled system has an intended sequence — what enables, in what order, against what setpoints and interlocks. Get it before you troubleshoot. Half of "the system is broken" calls are the system doing exactly what it was told: a setpoint someone changed, an occupancy schedule, an interlock holding a unit off on purpose.' },
      { heading: 'Setpoint, deadband, and hunting', body: 'A control that cannot settle — hunting between heating and cooling, or short-cycling — usually has a deadband too narrow for the equipment, or two loops fighting. Widen the deadband, check for simultaneous heating and cooling, and confirm the actuator actually strokes the full range it is being commanded to.' },
    ],
    takeaways: [
      'Verify the sensor before trusting the sequence.',
      'Read the sequence of operations first — it explains most "faults".',
      'Hunting and short-cycling are usually deadband or fighting loops.',
    ],
  },
  {
    id: 'airside',
    title: 'Airside / ductwork',
    level: 6,
    progress: 47,
    tone: 'amber',
    minutes: 7,
    summary: 'Airflow, static pressure, and why low airflow looks exactly like a low charge.',
    sections: [
      { heading: 'The air split', body: 'Return air minus supply air across the evaporator is your quickest honest read on capacity. A typical cooling split is 16–22 °F at normal indoor humidity. A narrow split with normal refrigerant numbers is an airflow or load story. A wide split with low airflow is a coil about to freeze — do not add refrigerant to it.' },
      { heading: 'Total external static pressure', body: 'ESP is the blower fighting the duct system — supply static plus return static, measured before and after the air handler. Compare it to the blower table for the selected speed. High ESP means restriction: dirty filter, dirty coil, undersized or crushed duct, closed dampers. Low airflow drags suction pressure down and mimics a low charge exactly.' },
      { heading: 'Diagnose the whole path', body: 'Airflow problems live somewhere along the path: filter, coil face, blower wheel condition and speed, duct sizing, register and grille free area. Walk it in order. A blower wheel packed with dirt moves a fraction of its rated air and no charge adjustment will fix the symptom it creates.' },
    ],
    takeaways: [
      'A 16–22 °F air split is the fast capacity check.',
      'Total external static vs the blower table finds restriction.',
      'Low airflow mimics low charge — measure air before touching refrigerant.',
    ],
  },
  {
    id: 'vrf',
    title: 'VRF systems',
    level: 7,
    progress: 22,
    tone: 'red',
    minutes: 9,
    summary: 'Branch controllers, addressing, and why manufacturer procedures are not interchangeable.',
    sections: [
      { heading: 'It is not just a big split', body: 'Variable refrigerant flow runs many indoor units off one outdoor unit, modulating compressor speed and electronic expansion valves to match load. The refrigerant management, oil return, and mode control are far more complex than a single split, and each manufacturer does it differently. Your R-410A split intuition gets you started and then stops being enough.' },
      { heading: 'Addressing and communication', body: 'Every indoor unit, branch controller, and remote has an address on a communication bus. A large share of VRF "faults" are addressing conflicts, a miswired comm pair, or a terminating resistor in the wrong place — not a refrigerant fault at all. Get the network map before the gauges.' },
      { heading: 'Branch controllers and EEV faults', body: 'In heat-recovery systems the branch controller decides which indoor units heat and which cool, routing refrigerant with its own valves. A stuck electronic expansion valve or a branch controller fault shows up as one zone that will not condition while its neighbors are fine — a pattern a whole-system charge check will never explain.' },
      { heading: 'Follow the manufacturer', body: 'This is the one place where "generic HVAC knowledge" is genuinely dangerous. Charge by the manufacturer method for the exact line lengths, use their service tool to read EEV positions and error histories, and follow their fault-code tree. HVACue flags VRF procedures as manufacturer-specific for exactly this reason.' },
    ],
    takeaways: [
      'VRF is a different animal — do not port split-system habits wholesale.',
      'Check addressing and the comm bus before the refrigerant circuit.',
      'One dead zone with healthy neighbors points at a branch controller / EEV.',
      'Use the manufacturer tool and procedure — they are not interchangeable.',
    ],
  },
];

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
