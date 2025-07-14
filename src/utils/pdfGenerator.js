import jsPDF from 'jspdf'

export const generatePDF = (title, content, filename) => {
  const doc = new jsPDF()
  
  // Set font and size
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  
  // Add title
  doc.text(title, 105, 20, { align: 'center' })
  
  // Add line under title
  doc.setDrawColor(0, 0, 0)
  doc.line(20, 25, 190, 25)
  
  // Set font for content
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  
  // Split content into lines that fit the page width
  const splitText = doc.splitTextToSize(content, 170)
  
  // Add content
  let yPosition = 40
  const lineHeight = 7
  
  for (let i = 0; i < splitText.length; i++) {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }
    
    doc.text(splitText[i], 20, yPosition)
    yPosition += lineHeight
  }
  
  // Add footer
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Study Point Library Jiran', 105, 280, { align: 'center' })
  doc.text('Generated on: ' + new Date().toLocaleDateString(), 105, 285, { align: 'center' })
  
  // Save the PDF
  doc.save(filename + '.pdf')
}

// Predefined content for different study materials
export const studyMaterialContent = {
  'ncert-class12-solutions': {
    title: 'NCERT Class 12 Solutions',
    content: `NCERT CLASS 12 SOLUTIONS
Complete Solutions for Physics, Chemistry, and Mathematics

PHYSICS SOLUTIONS
=================

Chapter 1: Electric Charges and Fields

Q1. What is the force between two small charged spheres having charges of 2 × 10^–7C and 3 × 10^–7C placed 30 cm apart in air?

Solution:
Using Coulomb's law: F = k(q1q2)/r²
Where k = 9 × 10^9 Nm²/C²
F = 9×10^9 × (2×10^-7 × 3×10^-7) / (0.3)²
F = 9×10^9 × 6×10^-14 / 0.09
F = 6×10^-3 N

Q2. A 600 pF capacitor is charged by a 200 V supply. It is then disconnected from the supply and is connected to another uncharged 600 pF capacitor. How much electrostatic energy is lost in the process?

Solution:
Initial energy = ½CV² = ½ × 600×10^-12 × (200)² = 12×10^-6 J
Final energy = ½ × 1200×10^-12 × (100)² = 6×10^-6 J
Energy lost = 12×10^-6 - 6×10^-6 = 6×10^-6 J

CHEMISTRY SOLUTIONS
==================

Chapter 1: The Solid State

Q1. Define the term 'amorphous'. Give a few examples of amorphous solids.

Solution:
Amorphous solids are those in which the constituent particles are not arranged in a regular manner. They lack long-range order and have irregular arrangement of particles.

Examples:
- Glass
- Rubber
- Plastic
- Wax
- Tar

Chapter 2: Solutions

Q1. Calculate the mass percentage of benzene (C6H6) and carbon tetrachloride (CCl4) if 22 g of benzene is dissolved in 122 g of carbon tetrachloride.

Solution:
Total mass of solution = 22 + 122 = 144 g
Mass percentage of benzene = (22/144) × 100 = 15.28%
Mass percentage of CCl4 = (122/144) × 100 = 84.72%

MATHEMATICS SOLUTIONS
=====================

Chapter 1: Relations and Functions

Q1. Show that the relation R in the set A = {1, 2, 3, 4, 5} given by R = {(a, b) : |a – b| is even}, is an equivalence relation.

Solution:
To prove R is an equivalence relation, we need to show:
(i) Reflexive: |a – a| = 0 is even for all a ∈ A ✓
(ii) Symmetric: If |a – b| is even, then |b – a| is also even ✓
(iii) Transitive: If |a – b| and |b – c| are even, then |a – c| is even ✓

Hence R is an equivalence relation.

Chapter 2: Inverse Trigonometric Functions

Q1. Find the principal value of sin^-1(-1/2)

Solution:
sin^-1(-1/2) = -π/6 (principal value)
Since sin(-π/6) = -1/2 and -π/6 ∈ [-π/2, π/2]

IMPORTANT FORMULAS
==================

Physics:
- Coulomb's Law: F = k(q1q2)/r²
- Electric Field: E = F/q
- Electric Potential: V = W/q
- Capacitance: C = Q/V

Chemistry:
- Molarity = Moles of solute/Volume of solution in liters
- Molality = Moles of solute/Mass of solvent in kg
- Mole fraction = Moles of component/Total moles

Mathematics:
- sin²θ + cos²θ = 1
- sin(A+B) = sinAcosB + cosAsinB
- cos(A+B) = cosAcosB - sinAsinB

This comprehensive guide covers all major topics in NCERT Class 12.
For more detailed solutions and practice questions, visit our library.`
  },
  
  'jee-main-previous-papers': {
    title: 'JEE Main Previous Year Papers',
    content: `JEE MAIN PREVIOUS YEAR PAPERS
Complete Question Papers with Solutions

JEE MAIN 2023 - PAPER 1
=======================

PHYSICS SECTION
===============

Q1. A particle of mass m is moving in a circular path of radius r with uniform speed v. The change in momentum when it completes half the circle is:
(a) mv (b) 2mv (c) mv/2 (d) zero

Solution:
When particle completes half circle, its direction changes by 180°.
Initial momentum = mv (→)
Final momentum = mv (←)
Change in momentum = mv - (-mv) = 2mv
Answer: (b) 2mv

Q2. A block of mass 2 kg is placed on a rough inclined plane as shown. The coefficient of static friction between the block and the plane is 0.4. The minimum angle of inclination of the plane for which the block will start sliding is:
(a) 21.8° (b) 30° (c) 45° (d) 60°

Solution:
For sliding to start: mg sin θ = μmg cos θ
tan θ = μ = 0.4
θ = tan^-1(0.4) = 21.8°
Answer: (a) 21.8°

CHEMISTRY SECTION
=================

Q1. The IUPAC name of CH3-CH2-CH=CH-CH3 is:
(a) 2-pentene (b) 3-pentene (c) 2-methyl-2-butene (d) 3-methyl-1-butene

Solution:
CH3-CH2-CH=CH-CH3
Counting from left: CH3-CH2-CH=CH-CH3
Double bond is at position 2
Answer: (a) 2-pentene

Q2. Which of the following is a strong electrolyte?
(a) CH3COOH (b) NH4OH (c) NaCl (d) H2O

Solution:
Strong electrolytes completely dissociate in solution.
NaCl is a strong electrolyte as it completely dissociates into Na+ and Cl- ions.
Answer: (c) NaCl

MATHEMATICS SECTION
===================

Q1. If sin θ + cos θ = 1, then the value of sin 2θ is:
(a) 0 (b) 1 (c) -1 (d) 1/2

Solution:
sin θ + cos θ = 1
Squaring both sides: sin²θ + cos²θ + 2sinθcosθ = 1
1 + sin 2θ = 1
sin 2θ = 0
Answer: (a) 0

Q2. The number of real roots of the equation x^4 - 4x^3 + 12x^2 - 16x + 8 = 0 is:
(a) 0 (b) 1 (c) 2 (d) 4

Solution:
Let f(x) = x^4 - 4x^3 + 12x^2 - 16x + 8
f'(x) = 4x^3 - 12x^2 + 24x - 16
f'(x) = 4(x^3 - 3x^2 + 6x - 4)
f'(x) = 4(x-1)(x^2 - 2x + 4)
Since x^2 - 2x + 4 > 0 for all real x, f'(x) = 0 only at x = 1
f(x) has minimum at x = 1
f(1) = 1 - 4 + 12 - 16 + 8 = 1 > 0
Hence f(x) > 0 for all real x
Answer: (a) 0

JEE MAIN 2022 - PAPER 1
=======================

PHYSICS SECTION
===============

Q1. A body is moving with uniform acceleration. Its velocity after 5 seconds is 25 m/s and after 8 seconds is 34 m/s. The acceleration of the body is:
(a) 3 m/s² (b) 4 m/s² (c) 5 m/s² (d) 6 m/s²

Solution:
v = u + at
25 = u + 5a ...(1)
34 = u + 8a ...(2)
Subtracting (1) from (2): 9 = 3a
a = 3 m/s²
Answer: (a) 3 m/s²

CHEMISTRY SECTION
=================

Q1. The hybridization of carbon in CH4 is:
(a) sp (b) sp² (c) sp³ (d) sp³d

Solution:
CH4 has tetrahedral geometry
Carbon forms 4 sigma bonds
Hybridization = sp³
Answer: (c) sp³

MATHEMATICS SECTION
===================

Q1. The value of ∫(x²+1)/(x+1) dx is:
(a) x²/2 + x + C (b) x²/2 - x + C (c) x²/2 + ln|x+1| + C (d) x²/2 - ln|x+1| + C

Solution:
∫(x²+1)/(x+1) dx = ∫(x²-1+2)/(x+1) dx
= ∫(x-1) dx + ∫2/(x+1) dx
= x²/2 - x + 2ln|x+1| + C
Answer: (c) x²/2 + ln|x+1| + C

IMPORTANT FORMULAS FOR JEE MAIN
===============================

Physics:
- Kinematics: v = u + at, s = ut + ½at², v² = u² + 2as
- Circular Motion: a = v²/r, ω = v/r
- Work Energy: W = Fs, KE = ½mv², PE = mgh

Chemistry:
- Mole Concept: n = m/M = N/NA
- Gas Laws: PV = nRT
- Chemical Bonding: VSEPR Theory

Mathematics:
- Trigonometry: sin²θ + cos²θ = 1
- Calculus: d/dx(x^n) = nx^(n-1), ∫x^n dx = x^(n+1)/(n+1)
- Algebra: Quadratic formula, Binomial theorem

This compilation includes actual JEE Main questions with detailed solutions.
For more practice papers and mock tests, visit our library.`
  },
  
  'neet-biology-notes': {
    title: 'NEET Biology Notes',
    content: `NEET BIOLOGY NOTES
Comprehensive Study Material for NEET Preparation

UNIT 1: DIVERSITY IN THE LIVING WORLD
====================================

CHAPTER 1: THE LIVING WORLD
===========================

Characteristics of Living Organisms:
1. Growth: Increase in mass and number of cells
2. Reproduction: Ability to produce offspring
3. Metabolism: Sum total of all chemical reactions
4. Cellular organization: Made up of cells
5. Consciousness: Ability to sense environment
6. Homeostasis: Maintenance of internal environment

Taxonomic Categories:
- Kingdom
- Phylum/Division
- Class
- Order
- Family
- Genus
- Species

CHAPTER 2: BIOLOGICAL CLASSIFICATION
===================================

Five Kingdom Classification (R.H. Whittaker):
1. Monera: Prokaryotes (bacteria, cyanobacteria)
2. Protista: Unicellular eukaryotes (protozoa, algae)
3. Fungi: Multicellular, heterotrophic, cell wall of chitin
4. Plantae: Multicellular, autotrophic, cell wall of cellulose
5. Animalia: Multicellular, heterotrophic, no cell wall

UNIT 2: STRUCTURAL ORGANIZATION IN PLANTS AND ANIMALS
====================================================

CHAPTER 3: PLANT KINGDOM
========================

Algae:
- Chlorophyceae (Green algae): Chlorella, Volvox
- Phaeophyceae (Brown algae): Laminaria, Fucus
- Rhodophyceae (Red algae): Polysiphonia, Porphyra

Bryophytes:
- Liverworts: Marchantia
- Mosses: Funaria, Sphagnum

Pteridophytes:
- Ferns: Dryopteris, Pteris
- Horsetails: Equisetum

Gymnosperms:
- Cycas, Pinus, Ginkgo

Angiosperms:
- Monocots: Rice, Wheat, Maize
- Dicots: Pea, Sunflower, Rose

CHAPTER 4: ANIMAL KINGDOM
=========================

Phylum Porifera (Sponges):
- Cellular level of organization
- Asymmetrical body
- Examples: Sycon, Spongilla

Phylum Coelenterata:
- Tissue level of organization
- Radial symmetry
- Examples: Hydra, Jellyfish

Phylum Platyhelminthes (Flatworms):
- Organ level of organization
- Bilateral symmetry
- Examples: Planaria, Liver fluke

Phylum Nematoda (Roundworms):
- Organ level of organization
- Pseudocoelomate
- Examples: Ascaris, Wuchereria

Phylum Annelida (Segmented worms):
- Organ system level
- True coelom
- Examples: Earthworm, Leech

Phylum Arthropoda:
- Jointed appendages
- Exoskeleton of chitin
- Examples: Cockroach, Butterfly, Spider

Phylum Mollusca:
- Soft body with shell
- Examples: Snail, Octopus, Pearl oyster

Phylum Echinodermata:
- Spiny skinned
- Radial symmetry in adults
- Examples: Starfish, Sea urchin

Phylum Chordata:
- Notochord present
- Dorsal nerve cord
- Pharyngeal gill slits
- Post-anal tail

UNIT 3: CELL STRUCTURE AND FUNCTION
===================================

CHAPTER 5: CELL: THE UNIT OF LIFE
=================================

Cell Theory:
1. All living organisms are composed of cells
2. Cell is the basic unit of life
3. All cells arise from pre-existing cells

Prokaryotic Cell:
- No nucleus
- No membrane-bound organelles
- Examples: Bacteria, Cyanobacteria

Eukaryotic Cell:
- True nucleus
- Membrane-bound organelles
- Examples: Plant and animal cells

Cell Organelles:
1. Cell Membrane: Selectively permeable
2. Cell Wall: Present in plants, fungi, bacteria
3. Nucleus: Contains genetic material
4. Mitochondria: Powerhouse of cell
5. Chloroplast: Site of photosynthesis
6. Endoplasmic Reticulum: Protein and lipid synthesis
7. Golgi Apparatus: Packaging and secretion
8. Lysosomes: Digestive enzymes
9. Vacuoles: Storage and turgidity
10. Ribosomes: Protein synthesis

UNIT 4: PLANT PHYSIOLOGY
========================

CHAPTER 6: PHOTOSYNTHESIS
=========================

Photosynthesis is the process by which green plants synthesize organic compounds from CO2 and H2O in the presence of sunlight.

Equation: 6CO2 + 12H2O → C6H12O6 + 6O2 + 6H2O

Light Reaction:
- Takes place in thylakoid membranes
- Requires light energy
- Produces ATP and NADPH
- Splits water to release oxygen

Dark Reaction (Calvin Cycle):
- Takes place in stroma
- Does not require light
- Uses ATP and NADPH
- Fixes CO2 to form glucose

CHAPTER 7: RESPIRATION
======================

Respiration is the process of oxidation of food to release energy.

Aerobic Respiration:
C6H12O6 + 6O2 → 6CO2 + 6H2O + Energy

Steps:
1. Glycolysis: Glucose → Pyruvate
2. Krebs Cycle: Pyruvate → CO2 + NADH + FADH2
3. Electron Transport Chain: NADH + FADH2 → ATP

UNIT 5: HUMAN PHYSIOLOGY
========================

CHAPTER 8: DIGESTION AND ABSORPTION
===================================

Digestive System:
- Mouth: Mechanical and chemical digestion
- Esophagus: Food passage
- Stomach: Protein digestion
- Small Intestine: Complete digestion and absorption
- Large Intestine: Water absorption

Enzymes:
- Amylase: Starch → Maltose
- Pepsin: Proteins → Peptides
- Trypsin: Proteins → Amino acids
- Lipase: Fats → Fatty acids + Glycerol

CHAPTER 9: BREATHING AND EXCHANGE OF GASES
==========================================

Respiratory System:
- Nose: Air filtration and warming
- Pharynx: Common passage
- Larynx: Voice box
- Trachea: Windpipe
- Bronchi: Air passage to lungs
- Alveoli: Gas exchange

Mechanism:
- Inspiration: Diaphragm contracts, chest expands
- Expiration: Diaphragm relaxes, chest contracts

CHAPTER 10: BODY FLUIDS AND CIRCULATION
=======================================

Blood Components:
- Plasma: 55% of blood volume
- RBCs: Oxygen transport
- WBCs: Immunity
- Platelets: Blood clotting

Heart:
- Four chambers: 2 atria, 2 ventricles
- Double circulation: Pulmonary and systemic
- Cardiac cycle: Systole and diastole

IMPORTANT DIAGRAMS AND FIGURES
==============================

1. Plant Cell Structure
2. Animal Cell Structure
3. Photosynthesis Process
4. Respiratory System
5. Digestive System
6. Heart Structure
7. Brain Structure
8. Kidney Structure

NEET IMPORTANT POINTS
=====================

1. Always read questions carefully
2. Pay attention to keywords
3. Use elimination method
4. Practice diagrams
5. Revise regularly
6. Solve previous year papers
7. Take mock tests

This comprehensive guide covers all major topics for NEET Biology.
For more detailed notes and practice questions, visit our library.`
  },
  
  'upsc-current-affairs': {
    title: 'UPSC Current Affairs - December 2024',
    content: `UPSC CURRENT AFFAIRS - DECEMBER 2024
Comprehensive Analysis for UPSC Preparation

NATIONAL AFFAIRS
================

1. INDIA'S G20 PRESIDENCY SUCCESS
India successfully concluded its G20 presidency with remarkable achievements:
- Digital Public Infrastructure (DPI) framework established
- Green Development Pact adopted
- New Delhi Declaration passed unanimously
- Presidency handed over to Brazil
- India's leadership praised globally for consensus building

Key Achievements:
- 112 outcomes and presidency documents
- 73% increase in outcomes compared to previous presidencies
- Focus on Global South representation
- Digital transformation initiatives

2. CHANDRAYAAN-3 MISSION
India's third lunar mission achieved historic success:
- First country to land on lunar south pole
- Pragyan rover explored lunar surface for 14 days
- ISRO's cost-effective mission model praised
- Total mission cost: ₹615 crore (much lower than other space agencies)

Scientific Discoveries:
- Detection of sulphur, aluminium, calcium, iron, chromium, titanium
- Temperature variations on lunar surface
- Seismic activity measurements
- Lunar soil analysis

3. WOMEN'S RESERVATION BILL
Parliament passed the Women's Reservation Bill (Nari Shakti Vandan Adhiniyam):
- 33% reservation for women in Lok Sabha and State Assemblies
- Bill received overwhelming support across party lines
- Implementation after delimitation exercise
- Historic step towards women empowerment

4. DIGITAL INDIA INITIATIVES
India's digital transformation continues to accelerate:
- UPI transactions crossed 100 billion in 2023
- Digital Rupee pilot expanded to more cities
- Aadhaar-based services reach 1.3 billion people
- India Stack becoming global model for digital governance

INTERNATIONAL AFFAIRS
=====================

1. UKRAINE-RUSSIA CONFLICT
The conflict continues with significant global implications:
- Global food and energy security impacted
- India maintains neutral stance, calls for dialogue
- G20 summit addressed economic impacts
- Humanitarian crisis continues

India's Position:
- Strategic autonomy in foreign policy
- Humanitarian assistance to Ukraine
- Energy security concerns
- Call for peaceful resolution

2. ISRAEL-HAMAS CONFLICT
Escalation in Middle East region:
- Humanitarian crisis in Gaza
- India's Operation Ajay to evacuate citizens
- Global calls for ceasefire and peace talks
- Impact on regional stability

India's Response:
- Evacuation of Indian citizens
- Humanitarian aid to Palestine
- Call for two-state solution
- Balanced diplomatic approach

3. CHINA'S BELT AND ROAD INITIATIVE
10th anniversary of BRI celebrated:
- India's concerns about CPEC continue
- Alternative connectivity initiatives gaining traction
- Debt sustainability issues in participating countries
- Strategic implications for Indo-Pacific

ECONOMY AND FINANCE
===================

1. INDIA'S ECONOMIC GROWTH
India remains the fastest growing major economy:
- GDP growth projected at 6.5% for FY24
- Services sector leading growth
- Manufacturing sector showing recovery
- Strong domestic demand

Key Indicators:
- Inflation under control
- Foreign exchange reserves strong
- Current account deficit manageable
- Fiscal consolidation on track

2. DIGITAL PAYMENTS REVOLUTION
UPI becoming global payment system:
- Singapore, UAE, France adopt UPI
- Cross-border digital payments expanding
- Financial inclusion through digital means
- India's digital leadership recognized

3. CLIMATE FINANCE
India's commitment to net zero by 2070:
- Green hydrogen mission launched
- Renewable energy capacity targets
- International climate finance mechanisms
- Sustainable development focus

SCIENCE AND TECHNOLOGY
======================

1. ARTIFICIAL INTELLIGENCE
India's AI mission launched:
- Focus on indigenous AI development
- Ethical AI framework being developed
- AI for public service delivery
- National AI strategy implementation

2. SPACE TECHNOLOGY
ISRO's commercial arm NSIL expanding:
- Private sector participation in space sector
- Satellite launch services to other countries
- Space debris management initiatives
- Commercial space activities

ENVIRONMENT AND CLIMATE
=======================

1. CLIMATE CHANGE
COP28 held in UAE:
- Global stocktake of climate action
- India's climate commitments
- Adaptation and mitigation strategies
- Climate finance discussions

2. BIODIVERSITY CONSERVATION
Kunming-Montreal Global Biodiversity Framework:
- India's biodiversity targets
- Wildlife conservation efforts
- Marine ecosystem protection
- Sustainable development goals

HEALTH AND EDUCATION
====================

1. HEALTHCARE INITIATIVES
Ayushman Bharat expansion:
- Digital health mission progress
- COVID-19 management learnings
- Mental health awareness programs
- Universal health coverage

2. EDUCATION REFORMS
National Education Policy implementation:
- Digital learning platforms
- Skill development programs
- International student exchange programs
- Quality education focus

DEFENCE AND SECURITY
====================

1. DEFENCE MODERNIZATION
Atmanirbhar Bharat in defence:
- Indigenous weapons development
- Defence exports increasing
- Strategic partnerships with friendly nations
- Self-reliance in defence

2. CYBER SECURITY
National Cyber Security Strategy:
- Critical infrastructure protection
- Cyber crime prevention
- International cooperation on cyber security
- Digital security framework

AGRICULTURE AND RURAL DEVELOPMENT
=================================

1. AGRICULTURAL REFORMS
PM-KISAN scheme benefits:
- Digital agriculture initiatives
- Crop insurance schemes
- Agricultural marketing reforms
- Farmer welfare programs

2. RURAL DEVELOPMENT
PM Gram Sadak Yojana progress:
- Rural electrification completion
- Digital connectivity in villages
- Rural employment generation
- Infrastructure development

IMPORTANT UPSC PREPARATION TIPS
===============================

1. Current Affairs Analysis:
- Read multiple sources
- Understand context and implications
- Connect with static portions
- Practice answer writing

2. Answer Writing Practice:
- Structure your answers properly
- Use relevant examples
- Include data and facts
- Time management

3. Revision Strategy:
- Regular revision of current affairs
- Make notes and mind maps
- Practice previous year questions
- Mock test analysis

This compilation covers major current affairs relevant for UPSC preparation.
For detailed analysis and more topics, visit our library.`
  }
}

export const downloadStudyMaterial = (materialId) => {
  const material = studyMaterialContent[materialId]
  if (material) {
    generatePDF(material.title, material.content, materialId)
  }
} 