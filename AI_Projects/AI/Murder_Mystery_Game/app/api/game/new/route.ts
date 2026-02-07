import { NextResponse } from "next/server";
import caseData from "@/data/cases/mansion-murder.json";
import { CaseTemplate, Clue } from "@/types/game";

// Force dynamic to ensure randomization on each request
export const dynamic = "force-dynamic";

// Motives and confessions for each suspect
// Smoking gun clues - only the killer's clue will be injected
const smokingGunClues: Record<string, Clue> = {
  marcus: {
    id: "marcus_bloody_cuff",
    name: "Torn Shirt Cuff",
    description: "A torn piece of expensive shirt fabric caught on the study door handle. Blood-spotted and embroidered with 'MB' - Marcus Blackwood.",
    roomId: "study",
    pointsTo: "marcus",
    category: "physical"
  },
  victoria: {
    id: "victoria_gloves",
    name: "Lady Victoria's Gloves",
    description: "A pair of expensive silk gloves stuffed behind a cushion. One has a dark stain that looks like dried blood.",
    roomId: "drawing_room",
    pointsTo: "victoria",
    category: "physical"
  },
  gerald: {
    id: "gerald_bloody_cloth",
    name: "Bloodied Polishing Cloth",
    description: "A silver polishing cloth hidden in the back of a drawer. Fresh bloodstains soak through the fabric. Monogrammed 'GF' - Gerald Finch.",
    roomId: "kitchen",
    pointsTo: "gerald",
    category: "physical"
  }
};

const suspectMotives: Record<string, { motive: string; confession: string }> = {
  victoria: {
    motive: "Victoria discovered Edmund's hidden will would leave her nothing after 30 years of marriage. Facing a future of poverty and humiliation, she decided to act before the will could be filed.",
    confession: "Thirty years I gave him! And he was going to leave me with nothing—NOTHING! After all I endured, all I sacrificed. When I found that will, I knew it was him or me. I grabbed the knife and... I don't regret it. He deserved worse."
  },
  marcus: {
    motive: "Marcus was drowning in gambling debts and discovered his father planned to disinherit the entire family. In a moment of desperate rage, he confronted his father and struck him down.",
    confession: "I... I didn't mean for it to happen! He was going to leave everything to charity. CHARITY! While I had loan sharks threatening to break my legs! I just wanted to talk, but he laughed at me, called me weak. I grabbed the knife and... it was over. I'm sorry."
  },
  helena: {
    motive: "Helena had discovered Edmund's embezzlement and was being blackmailed to keep quiet. When Edmund threatened to destroy her career and reputation, she saw only one way out.",
    confession: "He made me complicit in his crimes! Five years of covering up his theft, and he held it over me like a sword. When he said he'd tell everyone I was his accomplice, I snapped. I couldn't let him destroy my life. The knife was right there..."
  },
  gerald: {
    motive: "After 40 years of loyal service, Gerald learned Edmund planned to fire him without pension, exposing years of petty theft. Facing disgrace and destitution, the butler struck first.",
    confession: "Forty years of 'Yes, sir' and 'Very good, sir.' Forty years of my life given to this family! And he was going to throw me out like rubbish, expose my... indiscretions. I served him his last brandy, and when he turned his back... God forgive me."
  },
  rose: {
    motive: "Rose had witnessed Victoria and Edmund's explosive argument and knew about the secret passage. When she overheard Edmund planning to fire the entire staff, she used her knowledge of the manor to strike unseen.",
    confession: "I see everything in this house. EVERYTHING. I heard him telling her he'd fire us all—no references, no severance. After eight years! I know every secret passage, every hidden door. He never even heard me coming. The silent servant, invisible to the end."
  }
};

export async function GET() {
  try {
    // Deep clone the case data to avoid mutating the original
    const randomizedCase = JSON.parse(JSON.stringify(caseData)) as CaseTemplate;

    // Only select killers with 3+ clues pointing to them (fair/winnable)
    const eligibleKillers = ["marcus", "victoria", "gerald"];
    const killerIndex = Math.floor(Math.random() * eligibleKillers.length);
    const killerId = eligibleKillers[killerIndex];
    const killer = randomizedCase.suspects.find(s => s.id === killerId)!;

    // Fixed weapon - carving knife (matches "missing knife" clue)
    const weapon = randomizedCase.weapons.find(w => w.id === "carving_knife")!;

    // Add only the killer's smoking gun clue
    const killerSmokingGun = smokingGunClues[killerId];
    randomizedCase.clues.push(killerSmokingGun);

    // Add to room's clueIds
    const targetRoom = randomizedCase.rooms.find(r => r.id === killerSmokingGun.roomId);
    if (targetRoom) {
      targetRoom.clueIds.push(killerSmokingGun.id);
    }

    // Update the solution with randomized killer and weapon
    randomizedCase.solution = {
      killerId: killer.id,
      weaponId: weapon.id,
      locationId: "study", // Murder always happens in the study
      motive: suspectMotives[killer.id].motive,
      confession: suspectMotives[killer.id].confession
    };

    return NextResponse.json({
      caseData: randomizedCase,
    });
  } catch (error) {
    console.error("Error loading case:", error);
    return NextResponse.json(
      { error: "Failed to load case" },
      { status: 500 }
    );
  }
}
