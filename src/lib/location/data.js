// SCRIPT FOR POPULATING COUNTIES, AREAS AND ZIPCODES
import { putData } from "../api";
import { fetchModel } from "../models/model";
import { AREA, ZIPCODE } from "../queries";

//* NOTE: Populate collection data function for client comps
//   const names = `
// 37004	Γλώσσα
// 37001	Ζαγορά
// 37010	Μηλιές
// 37013	Μηλίνα
// 37400	Νέα Αγχίαλος
// 37011	Πορταριά
//   `;

// const response = await populateCountyAreas(0, 49, names);
// const response = await populateAreaZipcodes(0, names);
// console.log("active RESPONSE", response);

export async function populateCountyAreas(execute, countyId, string) {
  if (execute === 1) {
    // CREATE THE ARRAY OF STRINGS OF A MULTILINE STRING
    const namesArray = string
      .trim()
      .split("\n")
      .map((item) => item.trim());
    // REMOVE DUPLICATE NAMES
    const names = Array.from(new Set(namesArray));
    const ids = [];

    // FOR EACH NAME GET THE ITS ID
    for (const name of names) {
      const { areas } = await fetchModel("areas", AREA(name));
      ids.push({ id: areas[0].id, name: areas[0].attributes.name });
    }

    const data = {
      areas: ids,
    };

    // PATCH THE AREAS TO COUNTY
    const response = await putData(
      `counties/${countyId}/?fields[0]=name&populate[areas][fields][0]=name`,
      data
    );

    return response;
  } else {
    return "not active";
  }
}

export async function populateAreaZipcodes(execute, string) {
  if (execute === 1) {
    // Parse the input string and create an array of objects with zip and area
    const zipAreaArray = string
      .trim()
      .split("\n")
      .map((line) => {
        const [zip, ...areaParts] = line.trim().split("\t");
        const area = areaParts.join(" ");
        return { zipcode: zip.trim(), area: area.trim() };
      });

    // Group zip codes by area
    const areaZipMap = zipAreaArray.reduce((acc, { zipcode, area }) => {
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(zipcode);
      return acc;
    }, {});

    const areaIds = [];

    // For each area, get its ID and associate zip code IDs
    for (const [area, zips] of Object.entries(areaZipMap)) {
      const { areas } = await fetchModel("areas", AREA(area));
      if (areas.length > 0) {
        const areaId = areas[0].id;
        const zipIdsPromises = zips.map(async (zipcode) => {
          const { zipcodes } = await fetchModel("zipcodes", ZIPCODE(zipcode));
          return zipcodes.length > 0 ? zipcodes[0].id : null;
        });

        const zipIds = (await Promise.all(zipIdsPromises)).filter(
          (id) => id !== null
        );

        areaIds.push({
          id: areaId,
          zipcodes: zipIds,
        });
      }
    }

    // PATCH the areas with their respective zip codes
    for (const { id, zipcodes } of areaIds) {
      const data = { zipcodes };

      const response = await putData(
        `areas/${id}/?fields[0]=name&populate[areas][fields][0]=name`,
        data
      );

      console.log(`Updated area ${id} with zipcodes ${zipcodes}:`, response);
    }
    return areaIds;
  } else {
    return "not active";
  }
}
