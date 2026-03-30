const fs = require("fs");

console.log("🚀 Starting audio extraction...\n");

// ============================================
// STEP 1: AUTO-LOAD RESPONSE
// ============================================
let rawResponse;

try {
    console.log("🔍 [Step 1] Looking for response.json (from Python script)...");
    const responseJson = fs.readFileSync("response.json", "utf8");
    rawResponse = JSON.parse(responseJson);
    console.log("✅ Response loaded successfully from response.json\n");
} catch (err) {
    console.log("⚠️  response.json not found. Trying response.txt...");
    try {
        const responseText = fs.readFileSync("response.txt", "utf8");
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            rawResponse = JSON.parse(jsonMatch[0]);
            console.log("✅ Response loaded from response.txt\n");
        }
    } catch (err2) {
        console.error("❌ ERROR: Could not load response file!");
        console.error("Please run Python script first: python test.py");
        console.error("This will generate response.json with the API response");
        process.exit(1);
    }
}

// ============================================
// STEP 2: VALIDATE RESPONSE
// ============================================
console.log("🔍 [Step 2] Validating response structure...");

if (!rawResponse.audio_base64) {
    console.error("❌ ERROR: No audio_base64 found in response!");
    process.exit(1);
}

if (!rawResponse.alignment) {
    console.warn("⚠️  Warning: No alignment data in response");
}

console.log("✅ Response structure is valid\n");

// ============================================
// STEP 3: PROCESS RESPONSE DATA
// ============================================
console.log("🔍 [Step 3] Processing response data...");

const audioBase64 = rawResponse.audio_base64;
const alignment = rawResponse.alignment || {};
const normalizedAlignment = rawResponse.normalized_alignment || {};

console.log(`   📊 Audio size: ${(audioBase64.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`   📍 Characters in alignment: ${alignment.characters ? alignment.characters.length : 0}`);
console.log(`   📍 Normalized characters: ${normalizedAlignment.characters ? normalizedAlignment.characters.length : 0}\n`);

// ============================================
// STEP 4: SAVE AUDIO FILE
// ============================================
console.log("🔍 [Step 4] Saving audio file...");

const audioBuffer = Buffer.from(audioBase64, "base64");
const outputPath = "output_audio.mp3";

fs.writeFileSync(outputPath, audioBuffer);
console.log(`✅ Audio saved to: ${outputPath}`);
console.log(`   File size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB\n`);

// ============================================
// STEP 5: SAVE ALIGNMENT DATA
// ============================================
if (alignment.characters && alignment.characters.length > 0) {
    console.log("🔍 [Step 5] Processing alignment data...");
    
    const alignmentData = {
        totalCharacters: alignment.characters.length,
        characters: alignment.characters,
        timings: []
    };

    // Combine character with timing info
    for (let i = 0; i < alignment.characters.length; i++) {
        alignmentData.timings.push({
            character: alignment.characters[i],
            start_time: alignment.character_start_times_seconds[i] || 0,
            end_time: alignment.character_end_times_seconds[i] || 0,
            duration: (alignment.character_end_times_seconds[i] || 0) - (alignment.character_start_times_seconds[i] || 0)
        });
    }

    // Save alignment as JSON
    const alignmentPath = "alignment_data.json";
    fs.writeFileSync(alignmentPath, JSON.stringify(alignmentData, null, 2));
    console.log(`✅ Alignment data saved to: ${alignmentPath}`);
    
    // Show preview
    console.log("   Sample timings:");
    alignmentData.timings.slice(0, 5).forEach((t, i) => {
        console.log(`      ${i + 1}. '${t.character}': ${t.start_time.toFixed(3)}s - ${t.end_time.toFixed(3)}s (${t.duration.toFixed(3)}s)`);
    });
    if (alignmentData.totalCharacters > 5) {
        console.log(`      ... and ${alignmentData.totalCharacters - 5} more characters\n`);
    }
} else {
    console.log("⚠️  No alignment timing data available\n");
}

// ============================================
// STEP 6: SAVE FULL RESPONSE
// ============================================
console.log("🔍 [Step 6] Saving full response metadata...");

const responsePath = "audio_metadata.json";
const metadata = {
    timestamp: new Date().toISOString(),
    audio_size_bytes: audioBuffer.length,
    audio_size_mb: (audioBuffer.length / 1024 / 1024).toFixed(2),
    alignment_character_count: alignment.characters ? alignment.characters.length : 0,
    normalized_alignment_count: normalizedAlignment.characters ? normalizedAlignment.characters.length : 0,
    output_files: [
        "output_audio.mp3",
        "alignment_data.json",
        "audio_metadata.json"
    ]
};

fs.writeFileSync(responsePath, JSON.stringify(metadata, null, 2));
console.log(`✅ Metadata saved to: ${responsePath}\n`);

// ============================================
// SUMMARY
// ============================================
console.log("=".repeat(60));
console.log("✅ EXTRACTION COMPLETE!");
console.log("=".repeat(60));
console.log("Output files:");
console.log(`  1. ${outputPath} (${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
console.log(`  2. alignment_data.json (${alignment.characters ? alignment.characters.length : 0} characters)`);  
console.log(`  3. ${responsePath}`);
console.log("\n💡 Next steps:");
console.log("  - Play the MP3 file: output_audio.mp3");
console.log("  - Use alignment data to sync with text");
console.log("  - Share the files or process further as needed");
console.log("=".repeat(60) + "\n");

// ============================================
// CHUNKED CONTENT HANDLING
// ============================================
if (rawResponse.alignment && rawResponse.alignment.characters && rawResponse.alignment.character_start_times_seconds) {
    console.log("📖 Generating chunked text with timing info...");
    
    const chunks = [];
    let currentChunk = "";
    let chunkStartTime = 0;
    
    // Group characters into chunks (e.g., words or phrases)
    rawResponse.alignment.characters.forEach((char, index) => {
        const startTime = rawResponse.alignment.character_start_times_seconds[index];
        
        // Start new chunk every few characters or on space after 5+ chars
        if (currentChunk.length > 5 && char === " ") {
            chunks.push({
                text: currentChunk.trim(),
                start_time: chunkStartTime,
                end_time: startTime,
                duration: startTime - chunkStartTime
            });
            currentChunk = "";
            chunkStartTime = startTime;
        } else {
            currentChunk += char;
        }
    });
    
    // Add remaining chunk
    if (currentChunk.length > 0) {
        const lastEndTime = rawResponse.alignment.character_end_times_seconds[rawResponse.alignment.character_end_times_seconds.length - 1] || 0;
        chunks.push({
            text: currentChunk.trim(),
            start_time: chunkStartTime,
            end_time: lastEndTime,
            duration: lastEndTime - chunkStartTime
        });
    }
    
    // Save chunks
    fs.writeFileSync("chunked_content.json", JSON.stringify(chunks, null, 2));
    console.log(`✅ Saved ${chunks.length} text chunks to: chunked_content.json\n`);
    
    // Show preview
    console.log("Content preview:");
    chunks.slice(0, 3).forEach((chunk, i) => {
        console.log(`  [${chunk.start_time.toFixed(2)}s - ${chunk.end_time.toFixed(2)}s] "${chunk.text}"`);
    });
    if (chunks.length > 3) {
        console.log(`  ... and ${chunks.length - 3} more chunks`);
    }
}
