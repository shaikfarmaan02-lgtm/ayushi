// Drug information database for the AI Virtual Pharmacist
const drugDatabase = {
  "paracetamol": {
    name: "Paracetamol",
    aliases: ["acetaminophen", "tylenol"],
    description: "A pain reliever and fever reducer.",
    dosage: "Adults: 500-1000mg every 4-6 hours as needed, not exceeding 4000mg in 24 hours.",
    sideEffects: ["Nausea", "Rash", "Headache", "Liver damage (with overdose)"],
    interactions: ["Warfarin", "Alcohol"],
    missedDose: "Take as soon as you remember. Skip if it's almost time for your next dose. Don't double dose.",
    storage: "Store at room temperature away from moisture and heat."
  },
  "ibuprofen": {
    name: "Ibuprofen",
    aliases: ["advil", "motrin"],
    description: "A nonsteroidal anti-inflammatory drug (NSAID) used to relieve pain, reduce inflammation, and lower fever.",
    dosage: "Adults: 200-400mg every 4-6 hours as needed, not exceeding 1200mg in 24 hours.",
    sideEffects: ["Stomach pain", "Heartburn", "Dizziness", "Mild headache", "Nausea"],
    interactions: ["Aspirin", "Blood thinners", "Diuretics", "ACE inhibitors"],
    missedDose: "Take as soon as you remember. Skip if it's almost time for your next dose. Don't double dose.",
    storage: "Store at room temperature away from moisture and heat."
  },
  "aspirin": {
    name: "Aspirin",
    aliases: ["acetylsalicylic acid", "ASA"],
    description: "A nonsteroidal anti-inflammatory drug (NSAID) used to treat pain, fever, and inflammation.",
    dosage: "Adults: 325-650mg every 4 hours as needed, not exceeding 4000mg in 24 hours.",
    sideEffects: ["Upset stomach", "Heartburn", "Stomach bleeding", "Allergic reactions"],
    interactions: ["Blood thinners", "Ibuprofen", "ACE inhibitors", "Methotrexate"],
    missedDose: "Take as soon as you remember. Skip if it's almost time for your next dose. Don't double dose.",
    storage: "Store at room temperature away from moisture and heat."
  },
  "amoxicillin": {
    name: "Amoxicillin",
    aliases: ["amox"],
    description: "An antibiotic used to treat a variety of bacterial infections.",
    dosage: "Adults: 250-500mg three times daily for 7-10 days, depending on the infection.",
    sideEffects: ["Diarrhea", "Stomach pain", "Nausea", "Vomiting", "Rash"],
    interactions: ["Probenecid", "Allopurinol", "Oral contraceptives"],
    missedDose: "Take as soon as you remember. Skip if it's almost time for your next dose. Don't double dose.",
    storage: "Store at room temperature away from moisture and heat."
  },
  "lisinopril": {
    name: "Lisinopril",
    aliases: ["prinivil", "zestril"],
    description: "An ACE inhibitor used to treat high blood pressure and heart failure.",
    dosage: "Adults: 10-40mg once daily.",
    sideEffects: ["Dizziness", "Headache", "Dry cough", "High potassium levels"],
    interactions: ["Potassium supplements", "Potassium-sparing diuretics", "Lithium", "NSAIDs"],
    missedDose: "Take as soon as you remember. Skip if it's almost time for your next dose. Don't double dose.",
    storage: "Store at room temperature away from moisture and heat."
  },
  "metformin": {
    name: "Metformin",
    aliases: ["glucophage"],
    description: "An oral diabetes medicine that helps control blood sugar levels.",
    dosage: "Adults: 500-1000mg twice daily with meals.",
    sideEffects: ["Nausea", "Vomiting", "Stomach upset", "Diarrhea", "Lactic acidosis (rare but serious)"],
    interactions: ["Contrast dyes", "Diuretics", "Corticosteroids", "Certain heart medications"],
    missedDose: "Take as soon as you remember. Skip if it's almost time for your next dose. Don't double dose.",
    storage: "Store at room temperature away from moisture and heat."
  }
};

// Function to search for drug information
export const searchDrugInfo = (query) => {
  if (!query) return null;
  
  const searchTerm = query.toLowerCase().trim();
  
  // Direct match by key
  if (drugDatabase[searchTerm]) {
    return drugDatabase[searchTerm];
  }
  
  // Search by name or aliases
  for (const key in drugDatabase) {
    const drug = drugDatabase[key];
    if (drug.name.toLowerCase() === searchTerm) {
      return drug;
    }
    
    if (drug.aliases && drug.aliases.some(alias => alias.toLowerCase() === searchTerm)) {
      return drug;
    }
  }
  
  return null;
};

// Function to check drug interactions
export const checkDrugInteractions = (drugs) => {
  if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
    return [];
  }
  
  const interactions = [];
  
  // Check each drug against every other drug
  for (let i = 0; i < drugs.length; i++) {
    const drug1 = searchDrugInfo(drugs[i]);
    
    if (!drug1) continue;
    
    for (let j = i + 1; j < drugs.length; j++) {
      const drug2Name = drugs[j];
      const drug2 = searchDrugInfo(drug2Name);
      
      if (!drug2) continue;
      
      // Check if drug2 is in drug1's interactions list
      if (drug1.interactions && drug1.interactions.some(interaction => 
        interaction.toLowerCase() === drug2.name.toLowerCase() || 
        (drug2.aliases && drug2.aliases.some(alias => interaction.toLowerCase() === alias.toLowerCase()))
      )) {
        interactions.push({
          drug1: drug1.name,
          drug2: drug2.name,
          severity: "Potential interaction",
          description: `${drug1.name} may interact with ${drug2.name}. Consult your doctor or pharmacist.`
        });
      }
      
      // Check if drug1 is in drug2's interactions list
      if (drug2.interactions && drug2.interactions.some(interaction => 
        interaction.toLowerCase() === drug1.name.toLowerCase() || 
        (drug1.aliases && drug1.aliases.some(alias => interaction.toLowerCase() === alias.toLowerCase()))
      )) {
        // Only add if not already added from the previous check
        if (!interactions.some(item => 
          (item.drug1 === drug1.name && item.drug2 === drug2.name) || 
          (item.drug1 === drug2.name && item.drug2 === drug1.name)
        )) {
          interactions.push({
            drug1: drug1.name,
            drug2: drug2.name,
            severity: "Potential interaction",
            description: `${drug1.name} may interact with ${drug2.name}. Consult your doctor or pharmacist.`
          });
        }
      }
    }
  }
  
  return interactions;
};

// Function to get missed dose information
export const getMissedDoseInfo = (drugName) => {
  const drug = searchDrugInfo(drugName);
  
  if (drug && drug.missedDose) {
    return {
      drugName: drug.name,
      missedDoseInfo: drug.missedDose
    };
  }
  
  return {
    drugName: drugName,
    missedDoseInfo: "Take as soon as you remember. Skip if it's almost time for your next dose. Don't double dose. Consult your doctor or pharmacist for specific advice."
  };
};

// Common drug-related questions and answers
export const commonDrugQuestions = {
  "side effects": (drugName) => {
    const drug = searchDrugInfo(drugName);
    if (drug && drug.sideEffects) {
      return `Common side effects of ${drug.name} include: ${drug.sideEffects.join(", ")}.`;
    }
    return `I don't have specific information about ${drugName}. Please consult your doctor or pharmacist.`;
  },
  
  "dosage": (drugName) => {
    const drug = searchDrugInfo(drugName);
    if (drug && drug.dosage) {
      return `The typical dosage for ${drug.name} is: ${drug.dosage}`;
    }
    return `I don't have specific dosage information for ${drugName}. Please consult your doctor or pharmacist.`;
  },
  
  "what is": (drugName) => {
    const drug = searchDrugInfo(drugName);
    if (drug && drug.description) {
      return `${drug.name}: ${drug.description}`;
    }
    return `I don't have information about ${drugName}. Please consult your doctor or pharmacist.`;
  },
  
  "missed dose": (drugName) => {
    const info = getMissedDoseInfo(drugName);
    return `If you miss a dose of ${info.drugName}: ${info.missedDoseInfo}`;
  },
  
  "storage": (drugName) => {
    const drug = searchDrugInfo(drugName);
    if (drug && drug.storage) {
      return `${drug.name} storage: ${drug.storage}`;
    }
    return `Most medications should be stored at room temperature away from light and moisture. Keep all medications away from children and pets.`;
  }
};

export default {
  searchDrugInfo,
  checkDrugInteractions,
  getMissedDoseInfo,
  commonDrugQuestions
};