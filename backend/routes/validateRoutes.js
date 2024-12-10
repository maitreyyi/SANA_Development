const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const upload = require("../middlewares/upload");
const HttpError = require("../middlewares/HttpError");

const router = express.Router();

/**
 * @typedef {Object} JobData
 * @property {string} id - The job ID.
 * @property {string} job_location - The location of the job directory.
 * @property {string} extension - The file extension of the network files.
 * @property {string} network_1_name - The name of the first network file.
 * @property {string} network_2_name - The name of the second network file.
 */

/**
 * @typedef {Object} OptionsInputs
 * @property {number} t - Running time must be an integer between 1 and 60, inclusive.
 * // Add other options as needed
 */

/**
 * @typedef {Object} InfoJson
 * @property {string} status - The status of the job.
 * @property {JobData} data - The job data.
 * @property {Object} options - The options inputs.
 */

router.post("/upload", upload.array("network-files", 2), (req, res) => {
    // Ensure options_inputs exist
    if (!req.body.options_inputs) {
        req.body.options_inputs = {};
    }

    // Read default options from config.json
    // const defaultOptionsInfo = JSON.parse(
    //     fs.readFileSync(path.join(__dirname,'../config', "SANA1.json"), "utf8")
    // );

    const getDefaultOptionsInfo = (sanaVersion) => {
        const validVersions = new Set(["SANA1", "SANA1_1", "SANA2"]);
        if (validVersions.has(sanaVersion)) {
            return fs.readFileSync(path.join(__dirname, '../config', `${sanaVersion}.json`), "utf8");
        } else {
            throw new HttpError("Invalid sana version specified in request");
        }
    };
    const sanaVersion = req.body.version;
    const defaultOptionsInfo = getDefaultOptionsInfo(sanaVersion);
    const defaultOptionsInfoArray = [
        ...defaultOptionsInfo.standard,
        ...defaultOptionsInfo.advanced,
    ];

    // Sanitize input received to the options form
    defaultOptionsInfoArray.forEach((option) => {
        if (!(option[0] in req.body.options_inputs)) {
            req.body.options_inputs[option[0]] =
                option[1] !== "checkbox" ? option[2] : 0;
        }
    });

    // Validate options
    for (let [option, value] of Object.entries(req.body.options_inputs)) {
        if (isNaN(value)) {
            return res.json({
                success: false,
                status: "One or more of the selected options was invalid. Please try again.",
                data: { data: req.body.options_inputs },
            });
        }
        if (option === "t") {
            if (value < 1 || value > 60) {
                return res.json({
                    success: false,
                    status: "Running time must be an integer between 1 and 60, inclusive. Please try again.",
                    data: { data: req.body.options_inputs },
                });
            }
        }
    }

    // Validate that two files were uploaded
    if (!req.files || req.files.length < 2) {
        return res.json({
            success: false,
            status: "Two files must be uploaded.",
            data: { data: req.body.options_inputs },
        });
    }

    // Get file info
    const file1 = req.files[0];
    const file2 = req.files[1];

    const network1PathInfo = path.parse(file1.originalname);
    const network2PathInfo = path.parse(file2.originalname);

    // Validate filenames for whitespace
    const network1Name = network1PathInfo.name;
    const network2Name = network2PathInfo.name;

    if (/\s/.test(network1Name)) {
        return res.json({
            success: false,
            status: "The first selected file's name contains whitespace characters. Please rename the file or select a different file and try again",
        });
    }

    if (/\s/.test(network2Name)) {
        return res.json({
            success: false,
            status: "The second selected file's name contains whitespace characters. Please rename the file or select a different file and try again",
        });
    }

    // Validate file extensions
    const validExtensions = ["gw", "el"];
    const network1Ext = network1PathInfo.ext.slice(1);
    const network2Ext = network2PathInfo.ext.slice(1);

    if (!validExtensions.includes(network1Ext)) {
        return res.json({
            success: false,
            status:
                "The first network file was not of a valid extension: " +
                file1.originalname,
        });
    }

    if (!validExtensions.includes(network2Ext)) {
        return res.json({
            success: false,
            status:
                "The second network file was not of a valid extension: " +
                file2.originalname,
        });
    }

    if (network1Ext !== network2Ext) {
        return res.json({
            success: false,
            status: "The two network files were not of the same extension.",
        });
    }

    // Create a job ID hash
    const job_id = crypto
        .createHash("md5")
        .update(Date.now().toString() + network1Name + network2Name)
        .digest("hex");

    // Create an array containing info about the job
    /** @type {JobData} */
    const job_data = {
        id: job_id,
        job_location: path.join(__dirname, "process", job_id),
        extension: network1Ext,
        network_1_name: network1Name,
        network_2_name: network2Name,
    };

    // Create directories for the job
    try {
        fs.mkdirSync(job_data.job_location, { recursive: true });
        fs.mkdirSync(path.join(job_data.job_location, "networks"), {
            recursive: true,
        });
        fs.mkdirSync(
            path.join(
                job_data.job_location,
                "networks",
                job_data.network_1_name
            ),
            { recursive: true }
        );
        if (job_data.network_1_name !== job_data.network_2_name) {
            fs.mkdirSync(
                path.join(
                    job_data.job_location,
                    "networks",
                    job_data.network_2_name
                ),
                { recursive: true }
            );
        }
    } catch (err) {
        return res.json({
            success: false,
            status: "Processing directories could not be created.",
        });
    }

    // Move the network files into their respective directories
    const network1Location = path.join(
        job_data.job_location,
        "networks",
        job_data.network_1_name,
        `${job_data.network_1_name}.${job_data.extension}`
    );
    try {
        fs.renameSync(file1.path, network1Location);
    } catch (err) {
        return res.json({
            success: false,
            status:
                "First file " +
                file1.originalname +
                " could not be moved to " +
                network1Location,
        });
    }

    if (job_data.network_1_name !== job_data.network_2_name) {
        const network2Location = path.join(
            job_data.job_location,
            "networks",
            job_data.network_2_name,
            `${job_data.network_2_name}.${job_data.extension}`
        );
        try {
            fs.renameSync(file2.path, network2Location);
        } catch (err) {
            return res.json({
                success: false,
                status:
                    "Second file " +
                    file2.originalname +
                    " could not be moved to " +
                    network2Location,
            });
        }
    }

    // Create info.json
    /** @type {InfoJson} */
    const infoJson = {
        status: "preprocessed",
        data: job_data,
        options: req.body,
    };
    try {
        fs.writeFileSync(
            path.join(job_data.job_location, "info.json"),
            JSON.stringify(infoJson)
        );
    } catch (err) {
        return res.json({
            success: false,
            status: "Could not write info.json file.",
        });
    }

    // Return success
    return res.json({
        success: true,
        status: "Can move on to actual processing",
        data: { url: "/process?id=" + job_data.id },
    });
});

module.exports = router;
