export const DAMAGE_TEMPLATES: Record<string, { MINOR: string; MODERATE: string; MAJOR: string }> =
  {
    "Events & Party": {
      MINOR: "Small stains (<2cm), wax drippings, or singular light scratches.",
      MODERATE: "Large food stains, wobbly joints, or noticeable fabric snags.",
      MAJOR: "Broken structural components, cigarette burns, or permanent dye stains.",
    },
    "Camera & AV Equipment": {
      MINOR: "External casing scuffs, sensor dust, or missing lens caps/cables.",
      MODERATE: "Deep scratches on body, loose input ports, or minor software lag.",
      MAJOR: "Cracked lens/glass, water damage, or dropped unit impact damage.",
    },
    Transportation: {
      MINOR: "Small paint chips, minor interior scuffs, or dirty upholstery.",
      MODERATE: "Noticeable dents, torn seat fabric, or cracked plastic trim.",
      MAJOR: "Engine/Motor failure, broken lights, or major body deformation.",
    },
    "Camping & Hiking Equipment": {
      MINOR: "Mud/dirt buildup, small sap stains, or missing tent stakes.",
      MODERATE: "Small mesh tears, bent tent poles, or stuck zippers.",
      MAJOR: "Large rainfly rips, broken stoves, or mold/mildew damage.",
    },
    "Tools & Construction Equipment": {
      MINOR: "Chipped paint, dull blades, or heavy sawdust/mud buildup.",
      MODERATE: "Worn-out belts, cracked plastic housing, or frayed power cords.",
      MAJOR: "Motor burnout, bent metal frames, or hydraulic leaks.",
    },
    "Fashion & Apparel": {
      MINOR: "Loose threads, missing buttons, or tiny washable stains.",
      MODERATE: "Large stains, small snags in fabric, or broken zippers.",
      MAJOR: "Irreparable tears, permanent odors, or significant fabric burns.",
    },
    "Sports Equipment": {
      MINOR: "Surface scratches, grip wear, or cosmetic decal peeling.",
      MODERATE: "Broken strings, flat tires, or minor frame warping.",
      MAJOR: "Snapped frames, cracked helmets, or structural failure.",
    },
    "Baby & Mobility": {
      MINOR: "Washable food stains, minor scuffs on plastic, or squeaky wheels.",
      MODERATE: "Torn padding, stuck folding mechanisms, or missing safety straps.",
      MAJOR: "Broken frames, moldy fabric, or non-functional brakes.",
    },
    Default: {
      MINOR: "Minor cosmetic wear that does not affect basic function.",
      MODERATE: "Noticeable damage requiring professional repair or parts.",
      MAJOR: "Severe damage rendering the item unsafe or unusable.",
    },
  }
