/**
 * Simple Role Extractor - No AI Required
 * Takes each line from the text file as a complete role name
 */

const extractRolesFromText = (text) => {
    console.log("=== TEXT ROLE EXTRACTION START ===");
    console.log("Input Text Length:", text.length);
    console.log("Input Preview:", text.substring(0, 500));

    const roles = new Set();

    // Split text into lines
    const lines = text.split(/\r?\n/);

    // Look for a line that contains "role" as a header, then extract everything after it
    let startExtracting = false;
    let headerLineIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) {
            continue;
        }

        // Check if this is the header line (contains "role" but we skip it)
        if (line.toLowerCase().includes('role') && line.length < 100 && !startExtracting) {
            console.log(`Found header at line ${i}: "${line}"`);
            startExtracting = true;
            headerLineIndex = i;
            continue; // Skip the header itself
        }

        // If we've found the header, extract each subsequent line as a complete role
        if (startExtracting) {
            // Take the entire line as-is (no splitting, no pattern matching)
            // Only skip obvious non-role entries
            const cleanLine = line.trim();

            // Skip very short lines or common non-role words
            if (cleanLine.length < 2) continue;
            if (cleanLine.toLowerCase().match(/^(yes|no|true|false|description|status|enabled|disabled)$/i)) continue;

            // Add the complete line as a role
            roles.add(cleanLine);
        }
    }

    // If no header was found, just take all non-empty lines as roles
    if (!startExtracting) {
        console.log("No header found, extracting all non-empty lines");
        for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.length > 2) {
                roles.add(cleanLine);
            }
        }
    }

    const extractedRoles = Array.from(roles);
    console.log(`Extracted ${extractedRoles.length} roles:`, extractedRoles);
    console.log("=== TEXT ROLE EXTRACTION END ===");

    return extractedRoles;
};

module.exports = { extractRolesFromText };
