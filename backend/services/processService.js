const fs = require("fs");
const path = require("path");
const HttpError = require("../middlewares/HttpError");
const { exec } = require("child_process");
const archiver = require("archiver");

const SANA1_0 = process.env.SANA_LOCATION_1_0;
const SANA1_1 = process.env.SANA_LOCATION_1_1;
const SANA2_0 = process.env.SANA_LOCATION_2_0;

const jobProcessingService = async (jobId, sanaVersion = "sana1.0") => {
    // major error: no sana models allocated
    if (typeof SANA1_0 === "undefined") {
        throw new HttpError("SANA_LOCATION_1_0 is not defined");
    }
    if (typeof SANA1_1 === "undefined") {
        throw new HttpError("SANA_LOCATION_1_1 is not defined");
    }
    if (typeof SANA2_0 === "undefined") {
        throw new HttpError("SANA_LOCATION_2_0 is not defined");
    }

    const currentSana = (() => {
        switch (sanaVersion) {
            case "sana1.0":
                return SANA1_0;
            case "sana1.1":
                return SANA1_1;
            case "sana2.0":
                return SANA2_0;
            default:
                throw new HttpError("Invalid sanaVersion specified");
        }
    })();

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
    // console.log("info.data:", {
    //     id,
    //     jobLocation,
    //     extension,
    //     network1Name,
    //     network2Name,
    // });
    const { options } = info;
    // console.log("shape of info", info); //TESTING

    // shape of info {
    //     status: 'processing',
    //     data: {
    //       id: '2a70487c5a231f34d7433386b9b9aebf',
    //       jobLocation: '/Users/jj/projects/uci/research/SANA_Development/backend/process/2a70487c5a231f34d7433386b9b9aebf',
    //       extension: '.gw',
    //       network1Name: 'yeast',
    //       network2Name: 'yeast'
    //     },
    //     options: { t: 3, s3: 1, ec: 0 }
    //   }

    //EDIT SANA LOCATION HERE IF NEEDED
    optionString += `cd ${jobLocation} && ${currentSana} `;

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
                    resolve({
                        success: false,
                        status: "Networks could not be aligned.",
                        redirect: `/lookup-job/${jobId}`,
                    }); // or redirect to `/lookup-job`
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
                        resolve({
                            success: true,
                            status: "Networks successfully processed.",
                            redirect: `/lookup-job/${jobId}`,
                        });
                    });

                    archive.on("error", (err) => {
                        reject(err);
                    });

                    archive.pipe(output);
                    archive.directory(jobLocation, false);
                    archive.finalize();
                }
            }
        );
    });
};

module.exports = {
    jobProcessingService,
};
