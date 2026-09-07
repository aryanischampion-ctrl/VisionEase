/* =========================================================
   VisionEase 2.0
   Complete JavaScript
   Matches the supplied index.html exactly
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const TOTAL_STEPS = 9;
const HISTORY_KEY = "visionEaseHistory";
const REPORTS_KEY = "visionEaseReports";

const API_URL = "http://127.0.0.1:5000/api/analyze";


/* =========================================================
   STATE
   ========================================================= */

let currentStep = 1;
let assessmentData = createEmptyAssessment();

let textSize = 20;
let readingTimer = null;
let readingStartTime = null;
let readingSeconds = 0;
let aiRequestInProgress = false;


/* =========================================================
   DEFAULT ASSESSMENT
   ========================================================= */

function createEmptyAssessment() {
    return {
        name: "",
        age: "",
        screenTime: "",

        textComfort: "",
        comfortableTextSize: 20,

        contrast: "",

        symptoms: [],

        breakFrequency: "",
        readingEnvironment: "",
        mainDevice: "",

        readingTime: "",
        comprehension: "",

        preferredTextSize: "",
        preferredContrast: "",
        preferredEnvironment: "",
        preferredDevice: "",

        lineSpacing: "1.7",
        letterSpacing: "0"
    };
}


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


function setText(id, value) {
    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }
}


function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, value));
}


function safeArray(value) {
    return Array.isArray(value) ? value : [];
}


function scrollToSection(id) {
    const element = getElement(id);

    if (element) {
        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* =========================================================
   START ASSESSMENT
   ========================================================= */

function startAssessment() {

    console.log("VisionEase: Starting assessment...");

    const assessment = getElement("assessment");

    if (!assessment) {
        console.error("VisionEase: #assessment section not found.");
        return;
    }

    /*
       Reset assessment state
    */

    assessmentData = createEmptyAssessment();

    currentStep = 1;

    resetAssessmentInputs();

    /*
       Show assessment
    */

    assessment.classList.remove("hidden");

    /*
       Hide results
    */

    const results = getElement("results");

    if (results) {
        results.classList.add("hidden");
    }

    /*
       Show first step
    */

    showStep(1);

    updateProgress();

    /*
       Scroll to assessment
    */

    setTimeout(() => {
        assessment.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 100);
}


/* =========================================================
   RESET INPUTS
   ========================================================= */

function resetAssessmentInputs() {

    const name = getElement("user-name");
    const age = getElement("user-age");
    const screenTime = getElement("screen-time");

    if (name) name.value = "";
    if (age) age.value = "";
    if (screenTime) screenTime.value = "";

    /*
       Text test
    */

    textSize = 20;

    const fontDisplay = getElement("font-size-display");

    if (fontDisplay) {
        fontDisplay.textContent = "20px";
    }

    const dynamicText = getElement("dynamic-text");

    if (dynamicText) {
        dynamicText.style.fontSize = "20px";
    }

    /*
       Radio buttons
    */

    document
        .querySelectorAll('input[type="radio"]')
        .forEach(input => {
            input.checked = false;
        });

    /*
       Checkboxes
    */

    document
        .querySelectorAll('input[type="checkbox"]')
        .forEach(input => {
            input.checked = false;
        });

    /*
       Choice buttons
    */

    document
        .querySelectorAll(".choice-btn")
        .forEach(button => {
            button.classList.remove("selected");
        });

    /*
       Reading test
    */

    resetReadingState();

    /*
       Preferences
    */

    const preferenceIds = [
        "preferred-text-size",
        "preferred-contrast",
        "reading-environment",
        "main-device"
    ];

    preferenceIds.forEach(id => {
        const element = getElement(id);

        if (element) {
            element.value = "";
        }
    });

    /*
       Advanced controls
    */

    const lineSpacing = getElement("line-spacing");
    const letterSpacing = getElement("letter-spacing");

    if (lineSpacing) {
        lineSpacing.value = "1.7";
    }

    if (letterSpacing) {
        letterSpacing.value = "0";
    }

    setText("line-spacing-value", "1.7×");
    setText("letter-spacing-value", "0px");

    const preview = getElement("personalized-preview");

    if (preview) {
        preview.style.fontSize = "";
        preview.style.lineHeight = "";
        preview.style.letterSpacing = "";
    }

    setText("preview-ready", "Not applied");
    setText("preview-message", "");
}


/* =========================================================
   SHOW STEP
   ========================================================= */

function showStep(step) {

    if (step < 1) step = 1;
    if (step > TOTAL_STEPS) step = TOTAL_STEPS;

    currentStep = step;

    /*
       Hide every step
    */

    document
        .querySelectorAll(".assessment-step")
        .forEach(element => {
            element.classList.add("hidden");
        });

    /*
       Show requested step
    */

    const current = getElement(`step-${step}`);

    if (current) {
        current.classList.remove("hidden");
    } else {
        console.error(`VisionEase: step-${step} not found.`);
    }

    updateProgress();
}


/* =========================================================
   PROGRESS
   ========================================================= */

function updateProgress() {

    const percentage = Math.round(
        (currentStep / TOTAL_STEPS) * 100
    );

    setText(
        "progress-text",
        `Step ${currentStep} of ${TOTAL_STEPS}`
    );

    setText(
        "progress-percentage",
        `${percentage}%`
    );

    const progress = getElement("progress");

    if (progress) {
        progress.style.width = `${percentage}%`;
    }

    /*
       Progress dots
    */

    const dots = document.querySelectorAll(".progress-dot");

    dots.forEach((dot, index) => {

        if (index < currentStep) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }

    });
}


/* =========================================================
   STEP VALIDATION
   ========================================================= */

function validateStep(step) {

    if (step === 1) {

        const name = getElement("user-name");
        const age = getElement("user-age");
        const screenTime = getElement("screen-time");

        if (!name || !name.value.trim()) {
            alert("Please enter your name.");
            return false;
        }

        if (!age || !age.value) {
            alert("Please enter your age.");
            return false;
        }

        if (!screenTime || !screenTime.value) {
            alert("Please select your daily screen time.");
            return false;
        }

        return true;
    }


    if (step === 2) {

        if (!assessmentData.textComfort) {
            alert("Please select whether the text is comfortable to read.");
            return false;
        }

        return true;
    }


    if (step === 3) {

        if (!assessmentData.contrast) {
            alert("Please select whether the contrast is comfortable.");
            return false;
        }

        return true;
    }


    if (step === 4) {

        collectSymptoms();

        return true;
    }


    if (step === 5) {

        const selected = document.querySelector(
            'input[name="break-frequency"]:checked'
        );

        if (!selected) {
            alert("Please select how often you take breaks.");
            return false;
        }

        return true;
    }


    if (step === 6) {

        const selected = document.querySelector(
            'input[name="reading-location"]:checked'
        );

        if (!selected) {
            alert("Please select your usual reading environment.");
            return false;
        }

        return true;
    }


    if (step === 7) {

        const selected = document.querySelector(
            'input[name="main-device-step7"]:checked'
        );

        if (!selected) {
            alert("Please select the device you use most.");
            return false;
        }

        return true;
    }


    return true;
}


/* =========================================================
   NEXT STEP
   ========================================================= */

function nextStep() {

    /*
       Save current step data
    */

    saveCurrentStepData();

    /*
       Validate
    */

    if (!validateStep(currentStep)) {
        return;
    }

    /*
       Step 8 is special because comprehension
       happens after the reading test.
    */

    if (currentStep < TOTAL_STEPS) {

        showStep(currentStep + 1);

        const assessment = getElement("assessment");

        if (assessment) {
            window.scrollTo({
                top: assessment.offsetTop - 30,
                behavior: "smooth"
            });
        }
    }
}


/* =========================================================
   SAVE CURRENT STEP DATA
   ========================================================= */

function saveCurrentStepData() {

    /*
       STEP 1
    */

    const name = getElement("user-name");
    const age = getElement("user-age");
    const screenTime = getElement("screen-time");

    if (name) {
        assessmentData.name = name.value.trim();
    }

    if (age) {
        assessmentData.age = age.value;
    }

    if (screenTime) {
        assessmentData.screenTime = screenTime.value;
    }


    /*
       STEP 5
    */

    const breakFrequency = document.querySelector(
        'input[name="break-frequency"]:checked'
    );

    if (breakFrequency) {
        assessmentData.breakFrequency = breakFrequency.value;
    }


    /*
       STEP 6
    */

    const environment = document.querySelector(
        'input[name="reading-location"]:checked'
    );

    if (environment) {
        assessmentData.readingEnvironment = environment.value;
    }


    /*
       STEP 7
    */

    const device = document.querySelector(
        'input[name="main-device-step7"]:checked'
    );

    if (device) {
        assessmentData.mainDevice = device.value;
    }


    /*
       STEP 9
    */

    const preferredTextSize = getElement("preferred-text-size");
    const preferredContrast = getElement("preferred-contrast");
    const preferredEnvironment = getElement("reading-environment");
    const preferredDevice = getElement("main-device");

    if (preferredTextSize) {
        assessmentData.preferredTextSize = preferredTextSize.value;
    }

    if (preferredContrast) {
        assessmentData.preferredContrast = preferredContrast.value;
    }

    if (preferredEnvironment) {
        assessmentData.preferredEnvironment =
            preferredEnvironment.value;
    }

    if (preferredDevice) {
        assessmentData.preferredDevice = preferredDevice.value;
    }

    const lineSpacing = getElement("line-spacing");
    const letterSpacing = getElement("letter-spacing");

    if (lineSpacing) {
        assessmentData.lineSpacing = lineSpacing.value;
    }

    if (letterSpacing) {
        assessmentData.letterSpacing = letterSpacing.value;
    }
}


/* =========================================================
   TEXT SIZE TEST
   ========================================================= */

function changeTextSize(change) {

    textSize += change;

    if (textSize < 14) textSize = 14;
    if (textSize > 34) textSize = 34;

    const display = getElement("font-size-display");
    const dynamicText = getElement("dynamic-text");

    if (display) {
        display.textContent = `${textSize}px`;
    }

    if (dynamicText) {
        dynamicText.style.fontSize = `${textSize}px`;
    }

    assessmentData.comfortableTextSize = textSize;
}


function recordTextComfort(value, button) {

    assessmentData.textComfort = value;
    assessmentData.comfortableTextSize = textSize;

    document
        .querySelectorAll(".choice-btn")
        .forEach(btn => {
            btn.classList.remove("selected");
        });

    if (button) {
        button.classList.add("selected");
    }
}


/* =========================================================
   CONTRAST TEST
   ========================================================= */

function recordContrast(value, button) {

    assessmentData.contrast = value;

    /*
       Only contrast buttons should be selected
    */

    const contrastTest = document.querySelector(".contrast-test");

    if (contrastTest) {

        const parent = contrastTest.parentElement;

        if (parent) {

            parent
                .querySelectorAll(".choice-btn")
                .forEach(btn => {
                    btn.classList.remove("selected");
                });

        }
    }

    if (button) {
        button.classList.add("selected");
    }
}


/* =========================================================
   SYMPTOMS
   ========================================================= */

function collectSymptoms() {

    const checked = document.querySelectorAll(
        'input[name="symptoms"]:checked'
    );

    const symptoms = [];

    checked.forEach(input => {
        symptoms.push(input.value);
    });

    /*
       "None" cannot coexist with other symptoms
    */

    if (symptoms.includes("none")) {
        assessmentData.symptoms = ["none"];

        const noSymptoms = getElement("no-symptoms");

        if (noSymptoms) {
            document
                .querySelectorAll('input[name="symptoms"]')
                .forEach(input => {

                    if (input !== noSymptoms) {
                        input.checked = false;
                    }

                });
        }

    } else {
        assessmentData.symptoms = symptoms;
    }

    return assessmentData.symptoms;
}


/* =========================================================
   READING TEST
   ========================================================= */

function startReadingTest() {

    if (readingTimer) {
        return;
    }

    const startButton = getElement("start-reading-btn");
    const finishButton = getElement("finish-reading-btn");
    const status = getElement("reading-status");

    readingSeconds = 0;
    readingStartTime = Date.now();

    if (startButton) {
        startButton.classList.add("hidden");
    }

    if (finishButton) {
        finishButton.classList.remove("hidden");
    }

    if (status) {
        status.textContent = "Reading...";
    }

    setText("reading-time", "0");

    readingTimer = setInterval(() => {

        readingSeconds = Math.floor(
            (Date.now() - readingStartTime) / 1000
        );

        setText(
            "reading-time",
            readingSeconds
        );

    }, 250);
}


function finishReadingTest() {

    if (readingTimer) {
        clearInterval(readingTimer);
        readingTimer = null;
    }

    const startButton = getElement("start-reading-btn");
    const finishButton = getElement("finish-reading-btn");
    const status = getElement("reading-status");
    const comprehensionBox = getElement("comprehension-box");

    if (startButton) {
        startButton.classList.remove("hidden");
        startButton.textContent = "Reading Complete";
        startButton.disabled = true;
    }

    if (finishButton) {
        finishButton.classList.add("hidden");
    }

    if (status) {
        status.textContent = "Complete";
    }

    assessmentData.readingTime = readingSeconds;

    if (comprehensionBox) {
        comprehensionBox.classList.remove("hidden");
    }
}


function submitComprehension() {

    const selected = document.querySelector(
        'input[name="comprehension"]:checked'
    );

    if (!selected) {
        alert("Please answer the comprehension question.");
        return;
    }

    assessmentData.comprehension = selected.value;

    /*
       Go to step 9
    */

    showStep(9);

    updateAdvancedPreview();

    const assessment = getElement("assessment");

    if (assessment) {
        window.scrollTo({
            top: assessment.offsetTop - 30,
            behavior: "smooth"
        });
    }
}


function resetReadingState() {

    if (readingTimer) {
        clearInterval(readingTimer);
        readingTimer = null;
    }

    readingStartTime = null;
    readingSeconds = 0;

    setText("reading-time", "0");
    setText("reading-status", "Ready");

    const startButton = getElement("start-reading-btn");
    const finishButton = getElement("finish-reading-btn");
    const comprehensionBox = getElement("comprehension-box");

    if (startButton) {
        startButton.classList.remove("hidden");
        startButton.textContent = "Start Reading";
        startButton.disabled = false;
    }

    if (finishButton) {
        finishButton.classList.add("hidden");
    }

    if (comprehensionBox) {
        comprehensionBox.classList.add("hidden");
    }
}


/* =========================================================
   ADVANCED PREVIEW
   ========================================================= */

function updateAdvancedPreview() {

    const lineSpacing = getElement("line-spacing");
    const letterSpacing = getElement("letter-spacing");
    const preview = getElement("personalized-preview");

    if (!lineSpacing || !letterSpacing || !preview) {
        return;
    }

    const lineValue = Number(lineSpacing.value);
    const letterValue = Number(letterSpacing.value);

    setText(
        "line-spacing-value",
        `${lineValue.toFixed(1)}×`
    );

    setText(
        "letter-spacing-value",
        `${letterValue}px`
    );

    preview.style.lineHeight = lineValue;
    preview.style.letterSpacing = `${letterValue}px`;

    assessmentData.lineSpacing = String(lineValue);
    assessmentData.letterSpacing = String(letterValue);

    setText("preview-ready", "Preview ready");
}


function applyPreviewSettings() {

    saveCurrentStepData();

    const preview = getElement("personalized-preview");

    if (!preview) {
        return;
    }

    let size = assessmentData.preferredTextSize;

    if (!size) {
        size = `${textSize}px`;
    }

    const contrast = assessmentData.preferredContrast;
    const environment = assessmentData.preferredEnvironment;

    preview.style.fontSize = size;

    preview.style.lineHeight =
        assessmentData.lineSpacing || "1.7";

    preview.style.letterSpacing =
        `${assessmentData.letterSpacing || 0}px`;

    /*
       Preview contrast
    */

    if (contrast === "high") {
        preview.style.fontWeight = "600";
    } else {
        preview.style.fontWeight = "";
    }

    if (contrast === "dark") {
        preview.style.backgroundColor = "#111827";
        preview.style.color = "#ffffff";
        preview.style.padding = "20px";
        preview.style.borderRadius = "12px";
    } else {
        preview.style.backgroundColor = "";
        preview.style.color = "";
        preview.style.padding = "";
        preview.style.borderRadius = "";
    }

    /*
       Environment message
    */

    let environmentText = "normal lighting";

    if (environment === "bright") {
        environmentText = "bright surroundings";
    } else if (environment === "dim") {
        environmentText = "dim surroundings";
    }

    setText(
        "preview-message",
        `Preview applied: ${size} text, ${environmentText}, and ${assessmentData.lineSpacing}× line spacing.`
    );

    setText(
        "preview-ready",
        "Applied"
    );
}


/* =========================================================
   STEP 9 → RESULTS
   ========================================================= */

function finishStep9() {

    saveCurrentStepData();

    /*
       Validate important Step 9 preferences
    */

    if (!assessmentData.preferredTextSize) {

        const choice = confirm(
            "You have not selected a preferred text size. Continue anyway?"
        );

        if (!choice) {
            return;
        }
    }

    /*
       Generate results
    */

    generateResults();
}


/* =========================================================
   LOCAL SCORE ENGINE
   ========================================================= */

/*
   IMPORTANT:

   The numeric score is calculated locally.

   Ollama/Qwen is used for qualitative analysis,
   recommendations and risk factors.

   This prevents a small AI model from returning
   an incorrect score such as 0.
*/

function calculateScore() {

    let score = 100;

    const factors = [];

    function subtract(points, message) {

        score -= points;

        factors.push(message);
    }


    /*
       Screen time
    */

    if (assessmentData.screenTime === "high") {

        subtract(
            20,
            "High daily screen exposure may increase digital reading fatigue."
        );

    } else if (assessmentData.screenTime === "medium") {

        subtract(
            9,
            "Moderate daily screen exposure may contribute to reading fatigue."
        );
    }


    /*
       Text comfort
    */

    if (assessmentData.textComfort === "no") {

        subtract(
            15,
            "Your selected text size was not fully comfortable."
        );
    }


    /*
       Contrast
    */

    if (assessmentData.contrast === "no") {

        subtract(
            15,
            "The selected contrast level was not fully comfortable."
        );
    }


    /*
       Symptoms
    */

    const symptoms = safeArray(assessmentData.symptoms)
        .filter(item => item !== "none");

    if (symptoms.length > 0) {

        subtract(
            Math.min(symptoms.length * 5, 20),
            `You reported ${symptoms.length} screen-related comfort symptom${symptoms.length > 1 ? "s" : ""}.`
        );
    }


    /*
       Break habits
    */

    if (assessmentData.breakFrequency === "rarely") {

        subtract(
            15,
            "Infrequent screen breaks may increase digital reading fatigue."
        );

    } else if (assessmentData.breakFrequency === "sometimes") {

        subtract(
            7,
            "Break habits could be more consistent during long screen sessions."
        );
    }


    /*
       Environment
    */

    if (assessmentData.readingEnvironment === "dim") {

        subtract(
            7,
            "Low-light reading conditions may reduce visual comfort."
        );
    }


    /*
       Reading duration
    */

    const readingTime = Number(
        assessmentData.readingTime
    );

    if (readingTime > 120) {

        subtract(
            10,
            "Your reading test duration was relatively long."
        );

    } else if (readingTime > 90) {

        subtract(
            5,
            "Your reading test duration suggests a longer reading session."
        );
    }


    /*
       Comprehension
    */

    if (assessmentData.comprehension === "wrong") {

        subtract(
            8,
            "The comprehension check suggests the reading content may need more attention."
        );
    }


    score = Math.round(
        clamp(score)
    );

    return {
        score,
        factors
    };
}


/* =========================================================
   SCORE LEVEL
   ========================================================= */

function getScoreLevel(score) {

    if (score >= 80) {
        return "Excellent digital comfort";
    }

    if (score >= 60) {
        return "Moderate digital comfort";
    }

    return "Needs attention";
}


/* =========================================================
   PROFILE GENERATION
   ========================================================= */

function generateProfile(score) {

    if (score >= 80) {

        return {
            title: "Comfortable Digital Reader",

            description:
                "Your responses indicate a generally comfortable digital reading experience. Continue maintaining healthy screen habits, appropriate display settings and regular breaks."
        };

    }


    if (score >= 60) {

        return {
            title: "Adaptive Digital Reader",

            description:
                "Your reading experience appears reasonably comfortable, but some screen habits or display settings could be improved to make longer digital sessions easier."
        };

    }


    return {
        title: "Comfort-Focused Reader",

        description:
            "Your responses indicate several factors that may be affecting digital reading comfort. Adjusting display settings, improving break habits and monitoring persistent symptoms may help."
    };
}


/* =========================================================
   LOCAL RECOMMENDATIONS
   ========================================================= */

function generateRecommendations() {

    let text = "20px";
    let contrast = "Normal";
    let spacing = "1.7× line spacing";
    let breaks = "Take regular breaks";

    /*
       Text
    */

    if (assessmentData.preferredTextSize) {

        text = formatTextSize(
            assessmentData.preferredTextSize
        );

    } else if (assessmentData.textComfort === "no") {

        text = "24px or larger";

    } else {

        text = `${assessmentData.comfortableTextSize || 20}px`;
    }


    /*
       Contrast
    */

    if (assessmentData.preferredContrast) {

        contrast = formatContrast(
            assessmentData.preferredContrast
        );

    } else if (assessmentData.contrast === "no") {

        contrast = "Higher contrast";

    } else {

        contrast = "Normal contrast";
    }


    /*
       Spacing
    */

    if (assessmentData.lineSpacing) {

        spacing =
            `${Number(assessmentData.lineSpacing).toFixed(1)}× line spacing`;
    }


    /*
       Breaks
    */

    if (assessmentData.breakFrequency === "rarely") {

        breaks = "Break every 20–30 minutes";

    } else {

        breaks = "Continue regular breaks";
    }


    return {
        text,
        contrast,
        spacing,
        breaks
    };
}


/* =========================================================
   FORMATTERS
   ========================================================= */

function formatTextSize(value) {

    if (!value) {
        return "Not selected";
    }

    const mapping = {
        "16px": "Small (16px)",
        "20px": "Medium (20px)",
        "24px": "Large (24px)",
        "28px": "Very Large (28px)"
    };

    return mapping[value] || value;
}


function formatContrast(value) {

    const mapping = {
        normal: "Normal",
        high: "High Contrast",
        dark: "Dark Background"
    };

    return mapping[value] || value || "Normal";
}


function getScreenTimeLabel(value) {

    const mapping = {
        low: "Less than 2 hours",
        medium: "2–6 hours",
        high: "More than 6 hours"
    };

    return mapping[value] || "Not available";
}


function getDeviceLabel(value) {

    const mapping = {
        mobile: "Mobile Phone",
        tablet: "Tablet",
        laptop: "Laptop",
        desktop: "Desktop"
    };

    return mapping[value] || "Not available";
}


/* =========================================================
   BREAKDOWN
   ========================================================= */

function setBreakdown(barId, labelId, value) {

    const bar = getElement(barId);
    const label = getElement(labelId);

    value = Math.round(
        clamp(Number(value))
    );

    if (bar) {

        /*
           !important protection against CSS
           width: 0 rules.
        */

        bar.style.setProperty(
            "width",
            `${value}%`,
            "important"
        );
    }

    if (label) {
        label.textContent = `${value}%`;
    }
}


function updateBreakdown() {

    /*
       Screen exposure
    */

    let screenValue = 70;

    if (assessmentData.screenTime === "low") {
        screenValue = 90;
    } else if (assessmentData.screenTime === "medium") {
        screenValue = 65;
    } else if (assessmentData.screenTime === "high") {
        screenValue = 35;
    }


    /*
       Text comfort
    */

    const textValue =
        assessmentData.textComfort === "yes"
            ? 90
            : assessmentData.textComfort === "no"
                ? 45
                : 70;


    /*
       Contrast
    */

    const contrastValue =
        assessmentData.contrast === "yes"
            ? 90
            : assessmentData.contrast === "no"
                ? 45
                : 70;


    /*
       Habits
    */

    let habitValue = 70;

    if (assessmentData.breakFrequency === "regularly") {
        habitValue = 95;
    } else if (assessmentData.breakFrequency === "sometimes") {
        habitValue = 65;
    } else if (assessmentData.breakFrequency === "rarely") {
        habitValue = 35;
    }


    setBreakdown(
        "breakdown-screen",
        "breakdown-screen-value",
        screenValue
    );

    setBreakdown(
        "breakdown-text",
        "breakdown-text-value",
        textValue
    );

    setBreakdown(
        "breakdown-contrast",
        "breakdown-contrast-value",
        contrastValue
    );

    setBreakdown(
        "breakdown-habits",
        "breakdown-habits-value",
        habitValue
    );
}


/* =========================================================
   LOCAL SUMMARY
   ========================================================= */

function generateLocalSummary(score) {

    if (score >= 80) {

        return "Your responses indicate a generally comfortable digital reading experience. Continue using appropriate text settings and taking regular breaks.";

    }

    if (score >= 60) {

        return "Your responses indicate moderate digital reading comfort. A few changes to screen habits, display settings or reading conditions could improve your experience.";

    }

    return "Your responses indicate that several factors may be affecting digital reading comfort. Consider improving display settings, taking more regular breaks and monitoring persistent symptoms.";
}


/* =========================================================
   ATTENTION GUIDANCE
   ========================================================= */

function generateAttentionGuidance(score) {

    const symptoms = safeArray(
        assessmentData.symptoms
    ).filter(item => item !== "none");

    if (
        symptoms.includes("blurry-vision") ||
        symptoms.includes("headache")
    ) {

        return {
            title: "Pay attention to persistent symptoms",

            message:
                "If blurry vision, headaches or other symptoms persist, worsen or interfere with daily activities, consider seeking professional eye-care advice."
        };
    }


    if (score < 60) {

        return {
            title: "Consider improving your screen habits",

            message:
                "Try adjusting text size, contrast, lighting and break frequency. Seek professional eye-care advice if symptoms persist or worsen."
        };
    }


    return {
        title: "Monitor your comfort",

        message:
            "Your screening does not diagnose a medical condition. Continue healthy screen habits and seek professional advice if persistent or worsening symptoms occur."
    };
}


/* =========================================================
   NORMALIZE AI RESPONSE
   ========================================================= */

function normalizeAIResult(aiResult, localAnalysis) {

    const score = localAnalysis.score;

    const profile = generateProfile(score);

    const localRecommendations =
        generateRecommendations();

    const localAttention =
        generateAttentionGuidance(score);

    const result = aiResult || {};

    /*
       IMPORTANT:
       Ignore AI numeric score.
       Local score is authoritative.
    */

    let recommendations = safeArray(
        result.recommendations
    );

    if (recommendations.length === 0) {
        recommendations = [
            "Use a comfortable text size and avoid forcing yourself to read very small text.",
            "Adjust screen contrast and brightness according to your surroundings.",
            "Take regular breaks during long screen sessions.",
            "Keep your screen at a comfortable viewing distance."
        ];
    }


    /*
       Risk factors
    */

    let riskFactors = [
        ...localAnalysis.factors
    ];

    if (Array.isArray(result.risk_factors)) {

        riskFactors = [
            ...riskFactors,
            ...result.risk_factors
        ];
    }


    /*
       Remove duplicates
    */

    riskFactors = [
        ...new Set(
            riskFactors.filter(Boolean)
        )
    ];


    /*
       AI preferred settings
    */

    const aiSettings =
        result.preferred_settings &&
        typeof result.preferred_settings === "object"
            ? result.preferred_settings
            : {};


    const preferredSettings = {

        text_size:
            aiSettings.text_size ||
            localRecommendations.text,

        contrast:
            aiSettings.contrast ||
            localRecommendations.contrast,

        lighting:
            aiSettings.lighting ||
            assessmentData.preferredEnvironment ||
            "Comfortable ambient lighting",

        break_schedule:
            aiSettings.break_schedule ||
            localRecommendations.breaks
    };


    return {

        score,

        level:
            result.level ||
            getScoreLevel(score),

        summary:
            result.summary ||
            generateLocalSummary(score),

        profile:
            result.profile ||
            profile.title,

        risk_factors:
            riskFactors,

        recommendations,

        preferred_settings:
            preferredSettings,

        attention_level:
            result.attention_level ||
            localAttention.title,

        medical_guidance:
            result.medical_guidance ||
            localAttention.message
    };
}


/* =========================================================
   GENERATE RESULTS
   ========================================================= */

async function generateResults() {

    if (aiRequestInProgress) {
        return;
    }

    aiRequestInProgress = true;

    /*
       Make sure latest data is saved
    */

    saveCurrentStepData();

    collectSymptoms();


    /*
       Calculate LOCAL score first.
       This fixes the 0-score problem.
    */

    const localAnalysis = calculateScore();

    console.log(
        "VisionEase local score:",
        localAnalysis.score
    );

    console.log(
        "VisionEase factors:",
        localAnalysis.factors
    );


    /*
       Prepare payload for Flask
    */

    const payload = {
        ...assessmentData,

        local_score: localAnalysis.score,

        local_factors: localAnalysis.factors
    };


    let aiResult = null;


    /*
       Try Ollama / Flask
    */

    try {

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 60000);


        const response = await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload),

                signal: controller.signal
            }
        );


        clearTimeout(timeout);


        const responseText =
            await response.text();


        let parsed;

        try {

            parsed = responseText
                ? JSON.parse(responseText)
                : {};

        } catch (error) {

            throw new Error(
                "Backend returned invalid JSON."
            );
        }


        if (!response.ok) {

            throw new Error(
                parsed.details ||
                parsed.error ||
                `Backend returned HTTP ${response.status}`
            );
        }


        aiResult = parsed;

        console.log(
            "VisionEase AI response:",
            aiResult
        );

    } catch (error) {

        console.warn(
            "VisionEase AI unavailable:",
            error.message
        );

        /*
           IMPORTANT:
           Do NOT stop the result page.

           We use the local score and local
           recommendations instead.
        */

        aiResult = null;
    }


    /*
       Combine local + AI analysis
    */

    const finalResult =
        normalizeAIResult(
            aiResult,
            localAnalysis
        );


    /*
       Display results
    */

    displayAIResults(finalResult);


    /*
       Save
    */

    saveAIReport(finalResult);

    saveAssessment(
        finalResult.score,
        finalResult.profile
    );

    updateDashboard();


    aiRequestInProgress = false;
}


/* =========================================================
   DISPLAY RESULTS
   ========================================================= */

function displayAIResults(result) {

    const assessment = getElement("assessment");
    const results = getElement("results");

    /*
       Hide assessment
    */

    if (assessment) {
        assessment.classList.add("hidden");
    }

    /*
       Show results
    */

    if (results) {
        results.classList.remove("hidden");
    }


    /*
       SCORE
    */

    const score = Math.round(
        clamp(
            Number(result.score)
        )
    );

    setText(
        "score",
        score
    );


    /*
       Level
    */

    setText(
        "result-level",
        result.level ||
        getScoreLevel(score)
    );


    /*
       Summary
    */

    setText(
        "result-message",
        result.summary ||
        generateLocalSummary(score)
    );


    /*
       Introduction
    */

    setText(
        "result-introduction",
        `Your results are based on your VisionEase screening responses. Your calculated digital comfort score is ${score}/100.`
    );


    /*
       Profile
    */

    const profile =
        result.profile ||
        generateProfile(score).title;

    setText(
        "profile-title",
        profile
    );

    setText(
        "profile-badge",
        profile
    );

    setText(
        "profile-description",
        generateProfile(score).description
    );


    /*
       Text result
    */

    let textResult;

    if (assessmentData.preferredTextSize) {

        textResult =
            formatTextSize(
                assessmentData.preferredTextSize
            );

    } else {

        textResult =
            `${assessmentData.comfortableTextSize || 20}px`;
    }

    setText(
        "text-result",
        textResult
    );

    setText(
        "text-result-detail",
        assessmentData.textComfort === "yes"
            ? "Your selected text size felt comfortable."
            : assessmentData.textComfort === "no"
                ? "Consider using a larger text size."
                : "Text preference recorded."
    );


    /*
       Contrast result
    */

    const contrastResult =
        assessmentData.preferredContrast
            ? formatContrast(
                assessmentData.preferredContrast
            )
            : assessmentData.contrast === "yes"
                ? "Comfortable"
                : "Needs adjustment";

    setText(
        "contrast-result",
        contrastResult
    );

    setText(
        "contrast-result-detail",
        assessmentData.contrast === "yes"
            ? "The contrast sample was comfortable."
            : "Consider increasing contrast or adjusting display settings."
    );


    /*
       Screen time
    */

    setText(
        "screen-result",
        getScreenTimeLabel(
            assessmentData.screenTime
        )
    );

    setText(
        "screen-result-detail",
        assessmentData.screenTime === "high"
            ? "High daily screen exposure."
            : "Your reported daily screen exposure."
    );


    /*
       Device
    */

    setText(
        "device-result",
        getDeviceLabel(
            assessmentData.mainDevice
        )
    );

    setText(
        "device-result-detail",
        "Your primary digital reading device."
    );


    /*
       Breakdown
    */

    updateBreakdown();


    /*
       Recommendations
    */

    const localRecommendations =
        generateRecommendations();

    const settings =
        result.preferred_settings ||
        {};

    setText(
        "recommend-text",
        settings.text_size ||
        localRecommendations.text
    );

    setText(
        "recommend-contrast",
        settings.contrast ||
        localRecommendations.contrast
    );

    setText(
        "recommend-spacing",
        `${assessmentData.lineSpacing || "1.7"}×`
    );

    setText(
        "recommend-breaks",
        settings.break_schedule ||
        localRecommendations.breaks
    );


    /*
       Risk factors
    */

    const factorsList =
        getElement("factors-list");

    if (factorsList) {

        factorsList.innerHTML = "";

        const factors =
            safeArray(result.risk_factors);

        if (factors.length === 0) {

            const li =
                document.createElement("li");

            li.textContent =
                "No major comfort factors were identified from your responses.";

            factorsList.appendChild(li);

        } else {

            factors.forEach(factor => {

                const li =
                    document.createElement("li");

                li.textContent = factor;

                factorsList.appendChild(li);

            });
        }
    }


    /*
       Attention guidance
    */

    const localAttention =
        generateAttentionGuidance(score);

    setText(
        "attention-title",
        result.attention_level ||
        localAttention.title
    );

    setText(
        "attention-message",
        result.medical_guidance ||
        localAttention.message
    );


    /*
       Scroll to results
    */

    setTimeout(() => {

        if (results) {

            results.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }, 150);
}


/* =========================================================
   COMFORT MODE
   ========================================================= */

function activateComfortMode() {

    const body = document.body;

    body.classList.toggle(
        "comfort-mode"
    );


    const active =
        body.classList.contains(
            "comfort-mode"
        );


    const message =
        getElement("comfort-mode-message");

    if (message) {

        message.textContent =
            active
                ? "Comfort Mode activated. Your reading environment has been adjusted."
                : "Comfort Mode turned off.";
    }


    /*
       Apply basic comfort settings
    */

    if (active) {

        body.style.lineHeight = "1.7";

        document
            .querySelectorAll(
                "#results p, #results li"
            )
            .forEach(element => {

                element.style.lineHeight = "1.7";

            });

    } else {

        body.style.lineHeight = "";

        document
            .querySelectorAll(
                "#results p, #results li"
            )
            .forEach(element => {

                element.style.lineHeight = "";

            });
    }
}


/* =========================================================
   SAVE ASSESSMENT
   ========================================================= */

function saveAssessment(score, profile) {

    try {

        const history =
            getStoredArray(
                HISTORY_KEY
            );

        history.unshift({

            id: Date.now(),

            date:
                new Date().toLocaleString(),

            name:
                assessmentData.name,

            score:
                score,

            profile:
                profile,

            screenTime:
                assessmentData.screenTime,

            device:
                assessmentData.mainDevice

        });


        /*
           Keep latest 20
        */

        const trimmed =
            history.slice(0, 20);

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(trimmed)
        );

    } catch (error) {

        console.warn(
            "Could not save assessment:",
            error
        );
    }
}


/* =========================================================
   SAVE AI REPORT
   ========================================================= */

function saveAIReport(result) {

    try {

        const reports =
            getStoredArray(
                REPORTS_KEY
            );

        reports.unshift({

            id: Date.now(),

            date:
                new Date().toISOString(),

            assessment:
                { ...assessmentData },

            result:
                result

        });


        localStorage.setItem(
            REPORTS_KEY,
            JSON.stringify(
                reports.slice(0, 10)
            )
        );

    } catch (error) {

        console.warn(
            "Could not save report:",
            error
        );
    }
}


/* =========================================================
   SAFE LOCAL STORAGE
   ========================================================= */

function getStoredArray(key) {

    try {

        const value =
            localStorage.getItem(key);

        if (!value) {
            return [];
        }

        const parsed =
            JSON.parse(value);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.warn(
            `Could not read ${key}:`,
            error
        );

        return [];
    }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const history =
        getStoredArray(
            HISTORY_KEY
        );


    setText(
        "assessment-count",
        history.length
    );


    if (history.length === 0) {

        setText(
            "dashboard-score",
            "—"
        );

        setText(
            "dashboard-status",
            "No assessment yet"
        );

        setText(
            "dashboard-profile",
            "Not created"
        );

        setText(
            "dashboard-message",
            "Complete your first VisionEase assessment to build your personal profile."
        );

        const progress =
            getElement(
                "dashboard-progress-fill"
            );

        if (progress) {
            progress.style.width = "0%";
        }

        renderHistory();

        return;
    }


    const latest =
        history[0];

    const score =
        Number(latest.score) || 0;


    setText(
        "dashboard-score",
        score
    );

    setText(
        "dashboard-profile",
        latest.profile ||
        "Digital Reader"
    );


    let status;

    if (score >= 80) {
        status = "Good comfort";
    } else if (score >= 60) {
        status = "Moderate comfort";
    } else {
        status = "Needs attention";
    }

    setText(
        "dashboard-status",
        status
    );


    setText(
        "dashboard-message",
        `Your latest digital comfort score is ${score}/100.`
    );


    const progress =
        getElement(
            "dashboard-progress-fill"
        );

    if (progress) {

        progress.style.setProperty(
            "width",
            `${score}%`,
            "important"
        );
    }


    renderHistory();
}


/* =========================================================
   HISTORY
   ========================================================= */

function renderHistory() {

    const historyList =
        getElement(
            "history-list"
        );

    if (!historyList) {
        return;
    }


    const history =
        getStoredArray(
            HISTORY_KEY
        );


    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                <span>◌</span>
                <p>No assessments yet.</p>
                <small>
                    Your completed assessments will appear here.
                </small>
            </div>
        `;

        return;
    }


    historyList.innerHTML = "";


    history.forEach(item => {

        const row =
            document.createElement("div");

        row.className =
            "history-item";


        row.innerHTML = `
            <div>
                <strong>${escapeHTML(item.profile || "Digital Reader")}</strong>
                <small>${escapeHTML(item.date || "")}</small>
            </div>

            <strong>${Number(item.score) || 0}/100</strong>
        `;


        historyList.appendChild(row);

    });
}


/* =========================================================
   CLEAR HISTORY
   ========================================================= */

function clearHistory() {

    const confirmed =
        confirm(
            "Clear all VisionEase assessment history?"
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        HISTORY_KEY
    );

    localStorage.removeItem(
        REPORTS_KEY
    );

    updateDashboard();
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   RESTART ASSESSMENT
   ========================================================= */

function restartAssessment() {

    const results =
        getElement("results");

    if (results) {
        results.classList.add("hidden");
    }

    startAssessment();
}


/*
   Alias for compatibility
*/

function resetAssessment() {
    restartAssessment();
}


/* =========================================================
   PRINT REPORT
   ========================================================= */

function printReport() {
    window.print();
}


/* =========================================================
   NAVIGATION HELPERS
   ========================================================= */

function finishAssessment() {
    finishStep9();
}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

/*
   Your HTML uses inline onclick="..."
   therefore these functions must be available
   on window.
*/

window.startAssessment = startAssessment;
window.scrollToSection = scrollToSection;

window.nextStep = nextStep;

window.changeTextSize = changeTextSize;
window.recordTextComfort = recordTextComfort;
window.recordContrast = recordContrast;

window.collectSymptoms = collectSymptoms;

window.startReadingTest = startReadingTest;
window.finishReadingTest = finishReadingTest;
window.submitComprehension = submitComprehension;

window.updateAdvancedPreview = updateAdvancedPreview;
window.applyPreviewSettings = applyPreviewSettings;

window.finishStep9 = finishStep9;
window.generateResults = generateResults;

window.activateComfortMode = activateComfortMode;

window.clearHistory = clearHistory;

window.restartAssessment = restartAssessment;
window.resetAssessment = resetAssessment;

window.printReport = printReport;
window.finishAssessment = finishAssessment;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "VisionEase JavaScript loaded successfully."
        );


        /*
           Start with assessment hidden
        */

        const assessment =
            getElement("assessment");

        if (assessment) {
            assessment.classList.add("hidden");
        }


        /*
           Results hidden
        */

        const results =
            getElement("results");

        if (results) {
            results.classList.add("hidden");
        }


        /*
           Initial progress
        */

        currentStep = 1;

        updateProgress();


        /*
           Dashboard
        */

        updateDashboard();


        /*
           Symptoms: "None" behavior
        */

        const noSymptoms =
            getElement("no-symptoms");

        if (noSymptoms) {

            noSymptoms.addEventListener(
                "change",
                () => {

                    if (noSymptoms.checked) {

                        document
                            .querySelectorAll(
                                'input[name="symptoms"]'
                            )
                            .forEach(input => {

                                if (
                                    input !== noSymptoms
                                ) {
                                    input.checked = false;
                                }

                            });

                    }

                    collectSymptoms();
                }
            );
        }


        /*
           Other symptoms uncheck "None"
        */

        document
            .querySelectorAll(
                'input[name="symptoms"]:not(#no-symptoms)'
            )
            .forEach(input => {

                input.addEventListener(
                    "change",
                    () => {

                        if (input.checked && noSymptoms) {
                            noSymptoms.checked = false;
                        }

                        collectSymptoms();
                    }
                );

            });


        /*
           Reading environment
        */

        document
            .querySelectorAll(
                'input[name="reading-location"]'
            )
            .forEach(input => {

                input.addEventListener(
                    "change",
                    () => {

                        assessmentData.readingEnvironment =
                            input.value;

                    }
                );

            });


        /*
           Break frequency
        */

        document
            .querySelectorAll(
                'input[name="break-frequency"]'
            )
            .forEach(input => {

                input.addEventListener(
                    "change",
                    () => {

                        assessmentData.breakFrequency =
                            input.value;

                    }
                );

            });


        /*
           Device
        */

        document
            .querySelectorAll(
                'input[name="main-device-step7"]'
            )
            .forEach(input => {

                input.addEventListener(
                    "change",
                    () => {

                        assessmentData.mainDevice =
                            input.value;

                    }
                );

            });


        /*
           Preferences
        */

        [
            "preferred-text-size",
            "preferred-contrast",
            "reading-environment",
            "main-device"
        ].forEach(id => {

            const element =
                getElement(id);

            if (element) {

                element.addEventListener(
                    "change",
                    saveCurrentStepData
                );

            }

        });


        /*
           Advanced controls
        */

        updateAdvancedPreview();

    }
);