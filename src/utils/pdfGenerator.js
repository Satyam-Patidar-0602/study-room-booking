import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

// New function for generating booking ID card PDFs with proper height calculation
export const generateBookingIdCardPDF = async (cardElement, filename = 'StudyPoint_IDCard') => {
  try {
    // Generate canvas from the card element
    const canvas = await html2canvas(cardElement, { 
      backgroundColor: null, 
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF with proper dimensions
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'mm', 
      format: 'a4' 
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate optimal dimensions to fit the card properly
    const aspectRatio = canvas.height / canvas.width;
    const maxWidth = pageWidth - 20; // 10mm margin on each side
    const maxHeight = pageHeight - 20; // 10mm margin on top and bottom
    
    let imgWidth = maxWidth;
    let imgHeight = imgWidth * aspectRatio;
    
    // If height exceeds page height, scale down proportionally
    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = imgHeight / aspectRatio;
    }
    
    // Center the image on the page
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    
    // Add the image to PDF
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    
    // Save the PDF
    pdf.save(filename + '.pdf');
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

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

CHEMISTRY SECTION
=================

Q1. The IUPAC name of CH3-CH2-CH=CH-CH3 is:
(a) 2-pentene (b) 3-pentene (c) 2-methyl-2-butene (d) 3-methyl-1-butene

Solution:
CH3-CH2-CH=CH-CH3
Counting from left: CH3-CH2-CH=CH-CH3
Double bond is at position 2
Answer: (a) 2-pentene

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
  },

  'ssc-quantitative-aptitude': {
    title: 'SSC Quantitative Aptitude Guide',
    content: `SSC QUANTITATIVE APTITUDE GUIDE
Complete Preparation Material for SSC Exams

NUMBER SYSTEM
=============

1. Natural Numbers: 1, 2, 3, 4, 5, ...
2. Whole Numbers: 0, 1, 2, 3, 4, ...
3. Integers: ..., -3, -2, -1, 0, 1, 2, 3, ...
4. Rational Numbers: Numbers that can be expressed as p/q
5. Irrational Numbers: Numbers that cannot be expressed as p/q

Important Formulas:
- Sum of first n natural numbers = n(n+1)/2
- Sum of squares of first n natural numbers = n(n+1)(2n+1)/6
- Sum of cubes of first n natural numbers = [n(n+1)/2]²

PERCENTAGE
==========

1. Basic Percentage: x% of y = (x/100) × y
2. Percentage Change: ((New - Old)/Old) × 100
3. Successive Percentage: If A increases by x% and then by y%, final value = A(1+x/100)(1+y/100)

Examples:
- 20% of 150 = (20/100) × 150 = 30
- If 200 increases by 10% and then by 5%, final value = 200(1.1)(1.05) = 231

PROFIT AND LOSS
===============

1. Profit = Selling Price - Cost Price
2. Loss = Cost Price - Selling Price
3. Profit % = (Profit/CP) × 100
4. Loss % = (Loss/CP) × 100
5. Selling Price = CP(1 + Profit%/100) or CP(1 - Loss%/100)

Examples:
- CP = ₹100, SP = ₹120, Profit = ₹20, Profit% = 20%
- CP = ₹100, SP = ₹80, Loss = ₹20, Loss% = 20%

SIMPLE AND COMPOUND INTEREST
============================

Simple Interest:
- SI = (P × R × T)/100
- Amount = P + SI

Compound Interest:
- Amount = P(1 + R/100)^T
- CI = Amount - P

Examples:
- P = ₹1000, R = 10%, T = 2 years
- SI = (1000 × 10 × 2)/100 = ₹200
- Amount (CI) = 1000(1.1)² = ₹1210
- CI = ₹210

TIME AND WORK
=============

1. If A can do work in x days, work done in 1 day = 1/x
2. If A and B can do work in x and y days respectively, together they can do in xy/(x+y) days
3. Efficiency is inversely proportional to time

Examples:
- A can do work in 10 days, B in 15 days
- Together: 10×15/(10+15) = 6 days

PRACTICE QUESTIONS
==================

Q1. A number when divided by 6 leaves remainder 3. What will be the remainder when the square of this number is divided by 6?

Solution:
Let number be 6k + 3
Square = (6k + 3)² = 36k² + 36k + 9 = 6(6k² + 6k + 1) + 3
Remainder = 3

Q2. A shopkeeper marks his goods 20% above cost price and gives 10% discount. Find his profit percentage.

Solution:
Let CP = 100
Marked Price = 120
Selling Price = 120 × 0.9 = 108
Profit = 8, Profit% = 8%

This comprehensive guide covers all major topics for SSC Quantitative Aptitude.
For more practice questions and mock tests, visit our library.`
  },

  'mpsc-study-material': {
    title: 'MPSC Study Material',
    content: `MPSC STUDY MATERIAL
Maharashtra Public Service Commission Preparation Guide

MAHARASHTRA GEOGRAPHY
=====================

PHYSICAL FEATURES
=================

1. Western Ghats (Sahyadri):
- Runs parallel to Arabian Sea coast
- Average height: 1000-1500 meters
- Highest peak: Kalsubai (1646m)
- Important passes: Thal Ghat, Bhor Ghat, Pal Ghat

2. Deccan Plateau:
- Covers major part of Maharashtra
- Average elevation: 600-900 meters
- Rich in black soil (regur)
- Major rivers originate here

3. Konkan Coast:
- Narrow coastal strip along Arabian Sea
- Width: 50-80 km
- High rainfall (3000-4000mm annually)
- Important ports: Mumbai, JNPT, Ratnagiri

MAJOR RIVERS
============

1. Godavari:
- Longest river in Maharashtra
- Source: Trimbakeshwar (Nashik)
- Tributaries: Pravara, Purna, Manjra
- Important cities: Nashik, Aurangabad, Nanded

2. Krishna:
- Second longest river
- Source: Mahabaleshwar
- Tributaries: Koyna, Bhima, Tungabhadra
- Important cities: Satara, Sangli, Kolhapur

MAHARASHTRA HISTORY
===================

ANCIENT PERIOD
==============

1. Satavahanas (230 BCE - 220 CE):
- Capital: Pratishthan (Paithan)
- Important rulers: Gautamiputra Satakarni
- Trade with Rome, China
- Buddhist art and architecture

2. Vakatakas (250-500 CE):
- Capital: Vatsagulma (Washim)
- Patrons of art and literature
- Ajanta caves built during this period

MEDIEVAL PERIOD
===============

1. Yadavas (1187-1318):
- Capital: Devagiri (Daulatabad)
- Important rulers: Singhana, Ramachandra
- Literature and architecture flourished
- Defeated by Alauddin Khilji

2. Maratha Empire (1674-1818):
- Founded by Chhatrapati Shivaji Maharaj
- Capital: Raigad, later Satara
- Important rulers: Shivaji, Sambhaji, Rajaram, Shahu
- Peshwa period (1713-1818)

MAHARASHTRA POLITY
==================

CONSTITUTIONAL FRAMEWORK
========================

1. Governor:
- Appointed by President
- Constitutional head of state
- Powers: Executive, Legislative, Judicial

2. Chief Minister:
- Real executive head
- Appointed by Governor
- Leader of majority party in Assembly

3. State Legislature:
- Bicameral: Legislative Assembly (288 members), Legislative Council (78 members)
- Assembly term: 5 years
- Council: 1/3 members retire every 2 years

ADMINISTRATIVE STRUCTURE
========================

1. Divisions: 6 (Amravati, Aurangabad, Konkan, Nagpur, Nashik, Pune)
2. Districts: 36
3. Talukas: 358
4. Villages: 43,665

IMPORTANT SCHEMES AND POLICIES
==============================

1. Jalyukt Shivar Abhiyan:
- Water conservation
- Drought-proofing villages
- Micro-irrigation projects

2. Mahatma Jyotiba Phule Jan Arogya Yojana:
- Health insurance scheme
- Coverage for BPL families
- Cashless treatment

PRACTICE QUESTIONS
==================

Q1. Which is the highest peak in Maharashtra?
(a) Kalsubai (b) Salher (c) Dhodap (d) Harishchandragad

Answer: (a) Kalsubai (1646m)

Q2. Who founded the Maratha Empire?
(a) Sambhaji (b) Shivaji (c) Rajaram (d) Shahu

Answer: (b) Chhatrapati Shivaji Maharaj

Q3. How many districts are there in Maharashtra?
(a) 34 (b) 35 (c) 36 (d) 37

Answer: (c) 36

This comprehensive guide covers all major topics for MPSC preparation.
For more detailed notes and practice questions, visit our library.`
  }
}

export const downloadStudyMaterial = (materialId) => {
  const material = studyMaterialContent[materialId]
  if (material) {
    generatePDF(material.title, material.content, materialId)
  }
} 