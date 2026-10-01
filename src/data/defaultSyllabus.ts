import { SubjectSyllabus, SubjectType } from '../types';

export const DEFAULT_SYLLABUS: Record<SubjectType, SubjectSyllabus> = {
  Maths: {
    subject: 'Maths',
    units: [
      {
        id: 'math-u1',
        title: 'Calculus: Differentiation & Applications',
        weightage: 'High',
        topics: [
          {
            id: 'm-t1',
            title: 'Chain, Product, & Quotient Rules',
            importance: 'Core',
            status: 'in_progress',
            sampleNotes: `Product rule: d/dx [u*v] = u'v + uv'.
Quotient rule: d/dx [u/v] = (u'v - uv') / v^2 (Remember: Low d-High minus High d-Low over Low squared).
Chain rule: d/dx [f(g(x))] = f'(g(x)) * g'(x).
Implicit differentiation: Differentiate both sides with respect to x, remembering d/dx [y^2] = 2y * dy/dx, then collect dy/dx terms.`,
          },
          {
            id: 'm-t2',
            title: 'Maxima, Minima & Optimization',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Critical points happen where f'(x) = 0 or f'(x) is undefined.
First Derivative Test: If f' changes + to -, local max. If - to +, local min.
Second Derivative Test: If f''(c) < 0, concave down -> local maximum. If f''(c) > 0, concave up -> local minimum.
Inflection point occurs where concavity changes (f''(x) = 0 with sign change).`,
          },
          {
            id: 'm-t3',
            title: 'Related Rates & Approximations',
            importance: 'Advanced',
            status: 'not_started',
            sampleNotes: `Step 1: Draw diagram and define all variables as functions of time t.
Step 2: Write geometric equation relating variables (e.g. Pythagorean theorem, volume of cone V = 1/3 * pi * r^2 * h).
Step 3: Eliminate redundant variables using similar triangles if needed.
Step 4: Differentiate implicitly with respect to time t.
Step 5: Substitute numerical values at the specific instant.`,
          },
        ],
      },
      {
        id: 'math-u2',
        title: 'Calculus: Integration & Areas',
        weightage: 'High',
        topics: [
          {
            id: 'm-t4',
            title: 'Integration by Substitution (u-sub)',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Let u = inner function whose derivative du appears as a factor in the integrand.
Substitute du = g'(x) dx.
Do not forget to change upper and lower limits when computing definite integrals!
Common pattern: int [f'(x)/f(x) dx] = ln|f(x)| + C.`,
          },
          {
            id: 'm-t5',
            title: 'Integration by Parts & Partial Fractions',
            importance: 'Advanced',
            status: 'not_started',
            sampleNotes: `Integration by parts formula: int [u dv] = u*v - int [v du].
Selection rule for u (LIATE): Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential.
Partial fractions: Decompose rational expressions P(x)/Q(x) into A/(x-a) + B/(x-b) after ensuring degree of P is less than Q.`,
          },
          {
            id: 'm-t6',
            title: 'Definite Integrals & Area Between Curves',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Fundamental Theorem of Calculus: int_a^b f(x) dx = F(b) - F(a).
Area between two curves: int_a^b [top_function - bottom_function] dx.
If integrating with respect to y: int_c^d [right_function - left_function] dy.
Find intersection points first by setting f(x) = g(x).`,
          },
        ],
      },
      {
        id: 'math-u3',
        title: 'Algebra: Vectors & Matrices',
        weightage: 'Medium',
        topics: [
          {
            id: 'm-t7',
            title: 'Dot Product & Cross Product of Vectors',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Dot product: a · b = |a||b| cos(theta) = a1b1 + a2b2 + a3b3. If dot product is 0, vectors are perpendicular.
Cross product: a x b gives vector perpendicular to both, magnitude |a||b| sin(theta).
Vector equation of a straight line: r = a + lambda * d.`,
          },
          {
            id: 'm-t8',
            title: 'Systems of Linear Equations & Matrices',
            importance: 'Foundational',
            status: 'not_started',
            sampleNotes: `Matrix multiplication AB is valid only when columns of A = rows of B.
Determinant of 2x2: ad - bc. Matrix is invertible if det != 0.
Inverse of 2x2: 1/(ad-bc) * [[d, -b], [-c, a]].`,
          },
        ],
      },
      {
        id: 'math-u4',
        title: 'Probability & Statistics',
        weightage: 'Medium',
        topics: [
          {
            id: 'm-t9',
            title: 'Conditional Probability & Bayes Theorem',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `P(A|B) = P(A and B) / P(B).
Independent events: P(A and B) = P(A) * P(B).
Bayes Theorem: P(A|B) = [P(B|A) * P(A)] / P(B).
Draw tree diagrams for multi-stage selection without replacement.`,
          },
          {
            id: 'm-t10',
            title: 'Binomial & Normal Distributions',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Binomial conditions: Fixed n trials, only 2 outcomes (success/failure), constant p probability, independent trials.
Mean = n*p, Variance = n*p*(1-p).
Normal distribution: Z = (X - mu) / sigma. 68-95-99.7 empirical rule.`,
          },
        ],
      },
    ],
  },
  Physics: {
    subject: 'Physics',
    units: [
      {
        id: 'phys-u1',
        title: 'Mechanics: Kinematics & Newton’s Laws',
        weightage: 'High',
        topics: [
          {
            id: 'p-t1',
            title: 'Uniform Acceleration & SUVAT Equations',
            importance: 'Foundational',
            status: 'mastered',
            sampleNotes: `Equations of motion for constant acceleration:
v = u + at
s = ut + 0.5 a t^2
v^2 = u^2 + 2as
s = ((u + v)/2) * t
s = vt - 0.5 a t^2
In projectile motion: horizontal velocity vx = u cos(theta) is constant (ax = 0). Vertical motion vy = u sin(theta) - gt.`,
          },
          {
            id: 'p-t2',
            title: 'Newton’s Laws of Motion & Free Body Diagrams',
            importance: 'Core',
            status: 'in_progress',
            sampleNotes: `1st Law: Inertia, constant velocity unless net external force.
2nd Law: Net Force = m * a.
3rd Law: Action-reaction pair (equal magnitude, opposite direction, acting on different bodies).
Friction: f_s <= mu_s * N (static), f_k = mu_k * N (kinetic).
Inclined plane: Weight component along slope = mg sin(theta), perpendicular component = mg cos(theta).`,
          },
          {
            id: 'p-t3',
            title: 'Work, Energy, Power & Momentum',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Work = F * d * cos(theta). Work-Energy theorem: Net Work = change in Kinetic Energy.
Kinetic Energy = 0.5 * m * v^2. Gravitational Potential Energy = m * g * h.
Elastic PE = 0.5 * k * x^2. Power = Work / time = F * v.
Conservation of linear momentum: m1 u1 + m2 u2 = m1 v1 + m2 v2 (holds in all isolated collisions).
Elastic collision: KE is conserved. Inelastic: KE is not conserved.`,
          },
        ],
      },
      {
        id: 'phys-u2',
        title: 'Thermodynamics & Heat Transfer',
        weightage: 'Medium',
        topics: [
          {
            id: 'p-t4',
            title: 'Ideal Gas Law & Kinetic Theory',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `PV = nRT = N * k_B * T. Pressure P in Pascals, Volume V in m^3, Temp T strictly in Kelvin (K = C + 273.15).
Average translational KE per molecule = (3/2) * k_B * T.
Root-mean-square speed v_rms = sqrt(3 R T / M).`,
          },
          {
            id: 'p-t5',
            title: 'First Law of Thermodynamics & PV Cycles',
            importance: 'Advanced',
            status: 'not_started',
            sampleNotes: `Delta U = Q - W (or Q + W depending on work sign convention).
Delta U depends only on temperature change: Delta U = n * C_v * Delta T.
Isochoric (constant V): W = 0, Q = Delta U.
Isobaric (constant P): W = P * Delta V.
Isothermal (constant T): Delta U = 0, Q = W.
Adiabatic (no heat transfer Q = 0): Delta U = -W, PV^gamma = constant.`,
          },
        ],
      },
      {
        id: 'phys-u3',
        title: 'Electricity & Magnetism',
        weightage: 'High',
        topics: [
          {
            id: 'p-t6',
            title: 'Coulomb’s Law & Electric Potential',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Coulomb's Law: F = k * |q1 * q2| / r^2 where k = 1/(4 * pi * epsilon_0) = 8.99 * 10^9 N m^2/C^2.
Electric field E = F / q = k * Q / r^2 (vector).
Electric potential V = k * Q / r (scalar).
Potential energy U = q * V. Work done in moving charge W = -q * Delta V.`,
          },
          {
            id: 'p-t7',
            title: 'DC Circuits & Kirchhoff’s Laws',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Ohm's Law: V = I * R. Power P = V * I = I^2 * R = V^2 / R.
Resistors in series: R_eq = R1 + R2. Resistors in parallel: 1/R_eq = 1/R1 + 1/R2.
Capacitors in parallel: C_eq = C1 + C2. Capacitors in series: 1/C_eq = 1/C1 + 1/C2.
Kirchhoff's Junction Rule: Sum of currents entering a junction = sum leaving.
Kirchhoff's Loop Rule: Sum of potential differences around any closed loop is zero.`,
          },
          {
            id: 'p-t8',
            title: 'Electromagnetic Induction & Faraday’s Law',
            importance: 'Advanced',
            status: 'not_started',
            sampleNotes: `Magnetic Flux Phi = B · A = B * A * cos(theta).
Faraday's Law: Induced EMF = -N * (dPhi / dt).
Lenz's Law: The direction of the induced current creates a magnetic field that opposes the change in flux that caused it (negative sign).`,
          },
        ],
      },
      {
        id: 'phys-u4',
        title: 'Waves, Optics & Modern Physics',
        weightage: 'Medium',
        topics: [
          {
            id: 'p-t9',
            title: 'Wave Optics: Interference & Diffraction',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Wave speed v = f * lambda.
Young's double slit constructive: d sin(theta) = m * lambda.
Fringe separation y = (lambda * L) / d.
Snell's Law of Refraction: n1 sin(theta1) = n2 sin(theta2).
Total Internal Reflection occurs when going from dense to rare medium and angle of incidence > critical angle: sin(theta_c) = n2 / n1.`,
          },
          {
            id: 'p-t10',
            title: 'Photoelectric Effect & Photons',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Photon energy E = h * f = (h * c) / lambda.
Einstein's photoelectric equation: h * f = Work Function Phi + KE_max.
Stopping potential V_s: e * V_s = KE_max.
Key point: Increasing light intensity increases number of emitted photoelectrons (current), NOT their maximum kinetic energy. Increasing frequency increases KE_max.`,
          },
        ],
      },
    ],
  },
  Chemistry: {
    subject: 'Chemistry',
    units: [
      {
        id: 'chem-u1',
        title: 'Atomic Structure & Chemical Bonding',
        weightage: 'High',
        topics: [
          {
            id: 'c-t1',
            title: 'Periodic Trends & Electronic Configurations',
            importance: 'Foundational',
            status: 'mastered',
            sampleNotes: `Aufbau principle (fill lowest energy first), Hund's rule (single occupancy before pairing), Pauli exclusion principle.
Atomic radius decreases across a period (higher effective nuclear charge Z_eff pulls electrons tighter), increases down a group (extra shielding shells).
Ionization Energy: generally increases across period, decreases down group (exceptions at Group 13 and Group 16 due to subshell stability).
Electronegativity: Fluorine is highest (4.0). Increases up and to the right.`,
          },
          {
            id: 'c-t2',
            title: 'VSEPR Theory & Intermolecular Forces',
            importance: 'Core',
            status: 'in_progress',
            sampleNotes: `Steric Number = bonding pairs + lone pairs on central atom.
SN 2: Linear (180 deg) e.g. BeCl2, CO2.
SN 3: Trigonal planar (120 deg) e.g. BF3. One lone pair: Bent (<120 deg) e.g. SO2.
SN 4: Tetrahedral (109.5 deg) e.g. CH4. One lone pair: Trigonal pyramidal (107 deg) e.g. NH3. Two lone pairs: Bent (104.5 deg) e.g. H2O.
Intermolecular forces in increasing strength: London dispersion < Dipole-dipole < Hydrogen bonding (H bonded to N, O, or F).`,
          },
        ],
      },
      {
        id: 'chem-u2',
        title: 'Physical Chemistry: Kinetics & Equilibrium',
        weightage: 'High',
        topics: [
          {
            id: 'c-t3',
            title: 'Reaction Rates & Rate Laws',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Rate = k [A]^m [B]^n. Orders m and n must be determined experimentally, NOT from stoichiometric coefficients.
Zero order: Rate is constant, [A] decreases linearly, units of k = M/s.
First order: Rate = k[A], half-life t_1/2 = ln(2)/k is independent of initial concentration! Units of k = s^-1.
Second order: Rate = k[A]^2, units of k = M^-1 s^-1.
Arrhenius equation: k = A * exp(-E_a / RT). Catalysts lower E_a without shifting equilibrium.`,
          },
          {
            id: 'c-t4',
            title: 'Chemical Equilibrium & Le Chatelier’s Principle',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Equilibrium constant K = [products]^coeff / [reactants]^coeff. Pure solids and liquids are omitted!
Reaction quotient Q: If Q < K, shifts right towards products. If Q > K, shifts left towards reactants.
Le Chatelier's:
1. Adding reactant shifts forward.
2. Increasing pressure (decreasing volume) shifts toward side with fewer gas moles.
3. Increasing temperature shifts in endothermic direction (Delta H > 0). NOTE: Temperature is the ONLY factor that changes the value of K!`,
          },
          {
            id: 'c-t5',
            title: 'Acids, Bases, Buffers & pH',
            importance: 'Advanced',
            status: 'not_started',
            sampleNotes: `pH = -log[H+], pOH = -log[OH-], pH + pOH = 14 at 25 deg C.
Weak acid equilibrium: K_a = [H+][A-] / [HA].
Henderson-Hasselbalch equation for buffer: pH = pK_a + log([A-] / [HA]).
Buffer capacity is maximum when [A-] = [HA], so pH = pK_a.
Titration of weak acid with strong base: Equivalence point pH > 7 due to hydrolysis of conjugate base.`,
          },
        ],
      },
      {
        id: 'chem-u3',
        title: 'Thermodynamics & Electrochemistry',
        weightage: 'Medium',
        topics: [
          {
            id: 'c-t6',
            title: 'Enthalpy, Entropy & Gibbs Free Energy',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Delta H_rxn = sum(Delta H_f products) - sum(Delta H_f reactants) = sum(bonds broken) - sum(bonds formed).
Delta S_universe = Delta S_system + Delta S_surroundings > 0 (2nd Law).
Gibbs Free Energy: Delta G = Delta H - T * Delta S.
If Delta G < 0, reaction is thermodynamically spontaneous.
Connection to equilibrium: Delta G_standard = -R * T * ln(K).`,
          },
          {
            id: 'c-t7',
            title: 'Galvanic Cells, Standard Potentials & Nernst',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Anode = Oxidation (AN OX). Cathode = Reduction (RED CAT). Electrons flow from anode to cathode through wire.
E_cell^standard = E_cathode^standard - E_anode^standard.
Delta G_standard = -n * F * E_cell^standard (F = 96485 C/mol). Positive E_cell means spontaneous!
Nernst Equation at 298 K: E_cell = E_cell^standard - (0.0592 / n) * log(Q).`,
          },
        ],
      },
      {
        id: 'chem-u4',
        title: 'Organic Chemistry & Reaction Mechanisms',
        weightage: 'High',
        topics: [
          {
            id: 'c-t8',
            title: 'SN1 vs SN2 Nucleophilic Substitution',
            importance: 'Advanced',
            status: 'not_started',
            sampleNotes: `SN1: 2-step mechanism via carbocation intermediate. Rate = k[substrate]. Racemization (loss of optical activity). Favored by 3ry substrates, polar protic solvents, weak nucleophiles.
SN2: 1-step concerted backside attack. Rate = k[substrate][nucleophile]. Complete inversion of configuration (Walden inversion). Favored by 1ry/methyl substrates, polar aprotic solvents (acetone, DMSO), strong nucleophiles.`,
          },
          {
            id: 'c-t9',
            title: 'Carbonyl Chemistry: Aldehydes & Ketones',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Carbonyl carbon has partial positive charge (electrophilic).
Nucleophilic addition: Hydride reduction using NaBH4 (reduces aldehydes/ketones to alcohols) or LiAlH4 (reduces esters/carboxylic acids too).
Tollens' reagent: Silver mirror test (positive for aldehydes, negative for ketones).
Fehling's test: Red precipitate of Cu2O with aliphatic aldehydes.`,
          },
        ],
      },
    ],
  },
  Biology: {
    subject: 'Biology',
    units: [
      {
        id: 'bio-u1',
        title: 'Cell Biology & Biomolecules',
        weightage: 'High',
        topics: [
          {
            id: 'b-t1',
            title: 'Cell Structure, Organelles & Membrane Transport',
            importance: 'Foundational',
            status: 'mastered',
            sampleNotes: `Plasma membrane: Fluid mosaic model of phospholipid bilayer with embedded proteins and cholesterol.
Passive transport: Simple diffusion (small nonpolar molecules like O2, CO2), Facilitated diffusion (channel/carrier proteins, down concentration gradient, no ATP).
Active transport: Requires ATP (e.g. Na+/K+ ATPase pump: 3 Na+ out, 2 K+ in).
Endomembrane system: Rough ER (protein synthesis by attached ribosomes), Golgi apparatus (sorting, packaging, post-translational modification), Lysosomes (hydrolytic digestive enzymes).`,
          },
          {
            id: 'b-t2',
            title: 'Enzyme Kinetics & Regulation',
            importance: 'Core',
            status: 'in_progress',
            sampleNotes: `Enzymes act as biological catalysts by lowering the activation energy (E_a).
Competitive inhibition: Inhibitor binds active site. V_max remains unchanged, K_m increases (need more substrate to reach half max speed).
Non-competitive inhibition: Inhibitor binds allosteric site. V_max decreases, K_m remains unchanged!
Optimal temperature and pH denaturation: Extreme heat or pH disrupts tertiary hydrogen and ionic bonds.`,
          },
          {
            id: 'b-t3',
            title: 'Cellular Respiration & ATP Yield',
            importance: 'Advanced',
            status: 'not_started',
            sampleNotes: `Glycolysis (cytosol): Glucose -> 2 Pyruvate + 2 net ATP + 2 NADH (anaerobic).
Link reaction (mitochondrial matrix): Pyruvate -> Acetyl CoA + CO2 + NADH.
Krebs Cycle (matrix): Generates 2 ATP, 6 NADH, 2 FADH2, 4 CO2 per glucose.
Oxidative Phosphorylation (inner mitochondrial cristae): Electron Transport Chain pumps H+ into intermembrane space creating proton-motive force. Chemiosmosis via ATP Synthase yields ~26-28 ATP. Net total ~30-32 ATP.`,
          },
        ],
      },
      {
        id: 'bio-u2',
        title: 'Genetics & Molecular Biology',
        weightage: 'High',
        topics: [
          {
            id: 'b-t4',
            title: 'DNA Replication, Transcription & Translation',
            importance: 'Advanced',
            status: 'not_started',
            sampleNotes: `Central Dogma: DNA -> RNA -> Protein.
Replication (semi-conservative): Helicase unwinds, Primase adds RNA primer, DNA Polymerase III synthesizes 5' to 3' (leading strand continuous, lagging strand produces Okazaki fragments), DNA Ligase seals nicks.
Transcription: RNA Polymerase binds promoter (TATA box), transcribes mRNA 5' to 3'. Eukaryotic pre-mRNA processing: 5' cap, poly-A tail, splicing (introns out, exons spliced together).
Translation: Ribosome reads codon; tRNA anticodon pairs at A site, peptide bond forms at P site, exits at E site. Start codon AUG (Methionine), Stop codons UAA, UAG, UGA.`,
          },
          {
            id: 'b-t5',
            title: 'Mendelian Genetics & Pedigrees',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Monohybrid cross: F2 phenotypic ratio 3:1 (genotypic 1:2:1).
Dihybrid cross (independent assortment): 9:3:3:1 ratio.
Autosomal recessive: Skips generations, unaffected parents can have affected offspring (carriers).
Autosomal dominant: In every generation, affected child must have at least one affected parent.
X-linked recessive: Much more frequent in males; affected male cannot pass trait to sons, but passes carrier status to all daughters.`,
          },
        ],
      },
      {
        id: 'bio-u3',
        title: 'Human Physiology & Organ Systems',
        weightage: 'High',
        topics: [
          {
            id: 'b-t6',
            title: 'Circulatory System & Cardiac Cycle',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Double circulation: Pulmonary (lungs) and Systemic (body).
Pacemaker: SA node (fires first, atria contract) -> AV node (slight delay) -> Bundle of His -> Purkinje fibers (ventricles contract).
ECG waves: P wave = atrial depolarization, QRS complex = ventricular depolarization, T wave = ventricular repolarization.
Blood pressure: Systolic / Diastolic (normal ~120/80 mmHg). Cardiac Output = Stroke Volume * Heart Rate.`,
          },
          {
            id: 'b-t7',
            title: 'Nervous System & Action Potentials',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Resting membrane potential: -70 mV maintained by Na+/K+ pump and K+ leak channels.
Threshold: -55 mV (All-or-none principle).
Depolarization: Voltage-gated Na+ channels open, Na+ rushes into cell (+30 mV).
Repolarization: Na+ channels inactivate, voltage-gated K+ channels open, K+ rushes out.
Hyperpolarization: K+ channels slow to close, refractory period prevents back-propagation.
Synapse: Action potential causes voltage-gated Ca2+ influx at axon terminal -> exocytosis of neurotransmitters (e.g. Acetylcholine) into synaptic cleft.`,
          },
        ],
      },
      {
        id: 'bio-u4',
        title: 'Ecology & Evolutionary Biology',
        weightage: 'Medium',
        topics: [
          {
            id: 'b-t8',
            title: 'Natural Selection & Speciation',
            importance: 'Core',
            status: 'not_started',
            sampleNotes: `Darwinian fitness: Reproductive success of an organism relative to others in population.
Types of natural selection:
1. Directional: favors one extreme phenotype (e.g. antibiotic resistance).
2. Disruptive: favors both extremes over intermediate.
3. Stabilizing: favors intermediate (e.g. human birth weights).
Allopatric speciation: Geographic barrier isolates populations.
Sympatric speciation: Speciation occurs in same geographical area (e.g. polyploidy in plants).`,
          },
          {
            id: 'b-t9',
            title: 'Ecosystem Energetics & Trophic Levels',
            importance: 'Foundational',
            status: 'not_started',
            sampleNotes: `10% Rule: Only approximately 10% of energy is transferred from one trophic level to the next; remaining 90% is lost as metabolic heat or unconsumed biomass.
Primary productivity: GPP (Gross Primary Productivity) - Respiration (R) = NPP (Net Primary Productivity).
Bioaccumulation occurs within an individual; Biomagnification increases concentration of persistent toxic chemicals (e.g. DDT, mercury) up the food chain.`,
          },
        ],
      },
    ],
  },
};
