const express = require("express");
const fs = require("fs");
const path = require("path");
const HttpError = require("./HttpError");
const { exec } = require("child_process");
const archiver = require("archiver");

const router = express.Router();

// router.post("/processService", (req, res, next) => {
const processJob = async(jobId) => {
        // Step 1: Check that there is an id supplied
        // const jobId = req.body.id;
        // if (!jobId) {
        //     // No Job ID supplied
        //     throw new HttpError("No Job ID supplied.", 400);
        // }
        const jobDir = path.join(__dirname, jobId);

        // const jobDir = path.join(__dirname, jobId);
        if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
            return { status: "Job does not exist.", redirect: `/results?id=${jobId}` };

            // return res.status(200).json({
            //     success: true,
            //     status: "Job does not exist.",
            //     data: { url: `/results?id=${jobId}` },
            // });
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
            return { success: true, status: "Networks already aligned.", url: `/results?id=${jobId}` };
            // return res.status(200).json({
            //     success: true,
            //     status: "Networks already aligned.",
            //     redirect: `/results?id=${jobId}`,
            // });
        } else if (info.status === "processing") {
            return { success: true, status: "Networks are still being aligned." };
        }

        // Step 3: Update status to 'processing' in info.json
        info.status = "processing";
        fs.writeFileSync(infoFilePath, JSON.stringify(info));

        // Step 4: Generate the command string
        /*
            const jobData = {
                id: jobId,
                jobLocation: path.join(__dirname, "../process", jobId),
                extension: path.extname(req.files[0].originalname).toLowerCase(),
                network1Name: network1Name,
                network2Name: network2Name,
            };
        */
        let optionString = "";
        const { id, jobLocation, extension, network1Name, network2Name } =
            info.data;
        const { options } = info.options;

        //EDIT SANA LOCATION HERE IF NEEDED
        optionString += `cd ${jobLocation} && ${process.env.SANA_LOCATION || '/home/sana/bin/sana1.1'} `; 

        if (extension === "el") {
            optionString += `-fg1 networks/${network1Name}/${network1Name}.el `;
            optionString += `-fg2 networks/${network2Name}/${network2Name}.el `;
        } else {
            optionString += `-g1 ${network1Name} `;
            optionString += `-g2 ${network2Name} `;
        }

        optionString += "-tinitial auto ";
        optionString += "-tdecay auto ";

        // Append SANA execution options
        for (const [option, value] of Object.entries(options)) {
            optionString += ` -${option} ${value} `;
        }

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
                        resolve({ success: false, status: "Networks could not be aligned.", redirect: `/results?query=${id}` });
                        // return res.status(200).json({
                        //     success: false,
                        //     status: "Networks could not be aligned.",
                        //     data: { url: `/results?query=${id}` },
                        // });
                    } else {
                        // Execution succeeded
                        // Step 6: Create a zip for the files
                        const zipName = `SANA_alignment_output_${id}.zip`;
                        const output = fs.createWriteStream(
                            path.join(jobLocation, zipName)
                        );
                        const archive = archiver("zip", { zlib: { level: 9 } });

                        output.on("close", () => {
                            // Step 7: Update info.json with status 'processed'
                            const successInfo = {
                                status: "processed",
                                zip_name: zipName,
                                command: optionString,
                            };
                            fs.writeFileSync(
                                infoFilePath,
                                JSON.stringify(successInfo)
                            );
                            resolve({ success: true, status: "Networks successfully processed.", url: `/results?id=${id}` });
                            // return res.status(200).json({
                            //     success: true,
                            //     status: "Networks successfully processed.",
                            //     data: { url: `/results?id=${id}` },
                            // });
                        });

                        archive.on("error", (err) => {
                            reject(err);
                        });

                        archive.pipe(output);
                        archive.directory(jobLocation, false);
                        archive.finalize();
                    }
                }
                
        ) });
    } 

module.exports = router;
