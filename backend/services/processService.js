const fs = require("fs");
const path = require("path");
const HttpError = require("../middlewares/HttpError");
const { exec } = require("child_process");
const archiver = require("archiver");
const { SANA_MODELS, SANA_LOCATIONS, validateSanaVersion } = require('../config/modelOptions');

const jobProcess = async (jobId) => {
    // Step 1: Check that there is an id supplied - done in controller
    const jobDir = path.join(__dirname, "../process", jobId);

    if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
        return {
            status: "Job does not exist.",
            redirect: `/lookup-job/${jobId}`,
        };
    }

    // Step 2: Check that the job is not already processed
    const infoFilePath = path.join(jobDir, "info.json");
    let info;
    try {
        info = JSON.parse(fs.readFileSync(infoFilePath, "utf8"));
    } catch (err) {
        throw new HttpError("Could not read info.json", 500);
    }

    if (info.status === "processed" || info.status === "failed") {
        return {
            success: true,
            status: "Networks already aligned.",
            redirect: `/lookup-job/${jobId}`,
        };
    } else if (info.status === "processing") {
        return { success: true, status: "Networks are still being aligned." };
    }

    // Step 3: Update status to 'processing' in info.json
    info.status = "processing";
    fs.writeFileSync(infoFilePath, JSON.stringify(info));

    // Step 4: Generate the command string
    let optionString = "";
    const { id, jobLocation, extension, network1Name, network2Name, modelVersion } =
        info.data;
    const { options } = info;
    // console.log("shape of info", info); //TESTING

    validateSanaVersion(modelVersion);
    const sanaLocation = SANA_LOCATIONS[modelVersion];

    //EDIT SANA LOCATION HERE IF NEEDED
    optionString += `cd ${jobLocation} && ${sanaLocation} `;

    if (extension === ".el") {
        optionString += `-fg1 networks/${network1Name}/${network1Name}.el `;
        optionString += `-fg2 networks/${network2Name}/${network2Name}.el `;
    } else {
        optionString += `-g1 ${network1Name} `;
        optionString += `-g2 ${network2Name} `;
    }

    optionString += "-tinitial auto ";
    optionString += "-tdecay auto ";

    // Append SANA execution options
    for (const [option, value] of Object.entries(options.standard)) {
        optionString += ` -${option} ${value} `;
    }

    if (modelVersion === SANA_MODELS.SANA2) {
        const esim = options.advanced?.esim;
        if (esim && esim.length > 0) {
            const numFiles = esim.length;
            // Add external similarity weights (-esim)
            optionString += `-esim ${numFiles} `;
            // Add all weights
            optionString += `${esim.join(' ')} `;
            // Add similarity filenames (-simFile)
            optionString += `-simFile ${numFiles} `;
            // Add paths to all similarity files
            for (let i = 0; i < numFiles; i++) {
                optionString += `similarityFiles/sim_${i} `;
            }
            // Add similarity formats (-simFormat)
            optionString += `-simFormat ${numFiles} `;
            // Add format '1' (node names) for each file
            optionString += `${Array(numFiles).fill('1').join(' ')} `;
        }
    }
    console.log('optionstring!:', optionString);//TESTING

    // Step 5: Run the script
    // return promise hereee????
    return new Promise((resolve, reject) => {
        exec(
            `${optionString} &> run.log`,
            // { cwd: jobLocation },
            (error, stdout, stderr) => {
                if (error) {
                    // Execution failed
                    const failedInfo = {
                        status: "failed",
                        log: path.join(jobLocation, "error.log"),
                        command: optionString,
                    };
                    fs.writeFileSync(infoFilePath, JSON.stringify(failedInfo));
                    resolve({
                        success: false,
                        status: "Networks could not be aligned.",
                        redirect: `/lookup-job/${jobId}`,
                    }); 
                } else {
                    // Execution succeeded
                    // Step 6: Create a zip for the files
                    const zipName = `SANA_alignment_output_${id}.zip`;
                    const zipPath = path.join(jobLocation, zipName);
                    const output = fs.createWriteStream(zipPath);
                    const archive = archiver("zip", { zlib: { level: 9 } });
                    archive.on("entry", function(entry) {
                        console.log("Adding to zip:", entry.name);
                    });
                    output.on("pipe", () => {
                        console.log("Pipe started");
                    });
                    archive.on("warning", function(err) {
                        console.warn("Warning during zip creation:", err);
                        if (err.code === "ENOENT") {
                            console.warn("File not found while zipping");
                        } else {
                            reject(err);
                        }
                    });
                    archive.on("error", (err) => {
                        console.error("Error during zip creation:", err);
                        reject(err);
                    });

                    output.on("close", () => {
                        console.log(`Zip file created at ${zipPath}`);
                        console.log(`Zip file size: ${archive.pointer()} bytes`);
                        if (!fs.existsSync(zipPath)) {
                            console.error("Zip file was not created!");
                            reject(new Error("Zip file creation failed"));
                            return;
                        }
                        // Step 7: Update info.json with status 'processed'
                        const successInfo = {
                            status: "processed",
                            zipName: zipName,
                            command: optionString,
                        };
                        fs.writeFileSync(
                            infoFilePath,
                            JSON.stringify(successInfo)
                        );
                        resolve({
                            success: true,
                            status: "Networks successfully processed.",
                            redirect: `/lookup-job/${jobId}`,
                        });
                    });
                    
                    archive.pipe(output);
                    // archive.directory(jobLocation, false);
                    archive.glob('**/*', {
                        cwd: jobLocation,
                        ignore: [zipName], 
                        dot: true 
                    });
                    archive.finalize();
                }
            }
        );
    });
};

module.exports = {
    jobProcess,
};
