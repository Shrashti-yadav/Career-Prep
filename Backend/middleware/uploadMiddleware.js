import multer from "multer";
import path from "path";

/* =========================================================
   AUDIO UPLOAD (KEEP AS IT IS - DO NOT CHANGE)
========================================================= */

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/");
    },
    filename(req, file, cb) {
        const ext = path.extname(file.originalname);

        const sessionId = req.params.id || 'unknown';

        cb(null, `${sessionId}-${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith("audio/") ||
        file.mimetype === "application/octet-stream"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Not an audio file"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 },
});

const uploadSingleAudio = upload.single("audioFile");


/* =========================================================
   RESUME ANALYSIS UPLOAD (NEW ADDITION - DO NOT AFFECT AUDIO)
========================================================= */

const resumeStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/");
    },
    filename(req, file, cb) {
        const ext = path.extname(file.originalname);

        const sessionId = req.params.id || 'resume';

        cb(null, `${sessionId}-resume-${Date.now()}${ext}`);
    },
});

const resumeFileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF, DOC, DOCX, TXT allowed"), false);
    }
};

const resumeUpload = multer({
    storage: resumeStorage,
    fileFilter: resumeFileFilter,
    limits: { fileSize: 1024 * 1024 * 10 },
});

// for resume + jd upload
const uploadResumeFiles = resumeUpload.fields([
    { name: "resume", maxCount: 1 },
    { name: "jd", maxCount: 1 },
]);


/* =========================================================
   EXPORTS
========================================================= */

export {
    uploadSingleAudio,
    uploadResumeFiles
};